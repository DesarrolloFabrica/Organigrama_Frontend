import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useActivateFlowIdentity,
  useBeginRouteTransition,
  useFlowAreaIdentity,
  useHoldRouteTransition,
} from "../contexts/RouteTransitionContext";
import { type OrgNode, countPeopleUnder } from "../features/org-chart/types";
import { findNodeInTree } from "../features/org-chart/utils/findNodeInTree";
import { mergeChildrenIntoTree } from "../features/org-chart/utils/mergeChildrenIntoTree";
import { patchNodePhotoUrl } from "../features/org-chart/utils/patchNodePhotoUrl";
import { OrgMapView } from "../features/org-chart/components/OrgMapView";
import { TeamScrollListView } from "../features/org-chart/components/TeamScrollListView";
import { PersonDetailPanel } from "../features/org-chart/components/PersonDetailPanel";
import type { ProfileModuleCode } from "../features/org-chart/components/profile-modules/profile-module.types";
import { PersonDetailRestoreButton } from "../features/org-chart/components/PersonDetailRestoreButton";
import { OrgChartVersionBar } from "../features/org-chart/components/OrgChartVersionBar";
import { useOrgChartScopeVersionQueryId, useOrgChartVersionQueryId, useOrgChartVersionReady } from "../features/org-chart/context/OrgChartVersionContext";
import { fetchOrgChartNode } from "../features/org-chart/services/orgChartService";
import { OrgChartHeader } from "../features/org-chart/components/OrgChartHeader";
import { useOrgChartConnection } from "../features/org-chart/hooks/useOrgChartConnection";
import { NodeSummaryPanel } from "../features/org-chart/components/NodeSummaryPanel";
import { orgNodeHasDirectReports } from "../features/org-chart/types";
import { resolveTeamDisplayTier } from "../features/org-chart/utils/orgMapDisplayPolicy";
import {
  buildTeamExploreNavState,
  buildTeamExplorePath,
  readOrgTeamNavState,
  resolveTeamBackNavigation,
} from "../features/org-chart/utils/orgChartTeamNavigation";
import {
  orgChartChildrenQueryOptions,
  useOrgChartNode,
} from "../lib/react-query/hooks";
import { orgQueryKeys } from "../lib/react-query/queryKeys";
import { prefetchDirectChildrenHints } from "../lib/react-query/orgChartPrefetch";
import { entityDetailOverlayWidthClass } from "../features/org-chart/utils/personPresentationRules";
import { resolveNodeCoordinationContext } from "../features/org-chart/config/coordinationEmblems";
import { parseOrgMapNodeKey } from "../features/org-chart/utils/orgMapLayout";

const MAP_MAX_LEVELS = 4;

type ExploreBodyProps = {
  personId: string;
  /** Posición visual (`org_visual_relation.id`) que se está explorando, si aplica. */
  relationId: string | null;
};

function OrgChartExploreBody({ personId, relationId }: ExploreBodyProps) {
  const conn = useOrgChartConnection();
  const navigate = useNavigate();
  const beginRouteTransition = useBeginRouteTransition();
  const activateFlowIdentity = useActivateFlowIdentity();
  const flowIdentity = useFlowAreaIdentity();
  const location = useLocation();
  const teamNavState = readOrgTeamNavState(location.state);
  const queryClient = useQueryClient();
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  const {
    data: tree,
    isLoading,
    isError,
    error,
  } = useOrgChartNode(personId, true, relationId);

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(
    null,
  );
  const [detailPanelMinimized, setDetailPanelMinimized] = useState(false);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [activeDetailModule, setActiveDetailModule] =
    useState<ProfileModuleCode | null>(null);
  const detailReturnIdentityRef = useRef(flowIdentity);
  const centralPaletteRouteRef = useRef<string | null>(null);

  useEffect(() => {
    setSelectedPersonId(null);
    setSelectedRelationId(null);
    setDetailPanelMinimized(false);
    setExpandedNodeId(null);
    setActiveDetailModule(null);
  }, [personId, relationId]);

  const chartError = isError
    ? error instanceof Error
      ? error.message
      : "Error desconocido al cargar el equipo"
    : null;

  useHoldRouteTransition(!versionReady || (isLoading && !tree));

  useEffect(() => {
    const routeKey = `${personId}:${relationId ?? ""}`;
    if (!tree || centralPaletteRouteRef.current === routeKey) return;

    centralPaletteRouteRef.current = routeKey;
    const centralCoordination = resolveNodeCoordinationContext(
      tree,
      tree.id,
      tree.relation_id,
    );
    if (centralCoordination?.identity) {
      activateFlowIdentity(centralCoordination.identity);
    }
  }, [activateFlowIdentity, personId, relationId, tree]);

  const treeDescendantCount =
    tree && selectedPersonId
      ? (() => {
          const n = findNodeInTree(tree, selectedPersonId, selectedRelationId);
          return n ? countPeopleUnder(n) : null;
        })()
      : null;

  const handleSelectNodeFromMap = useCallback(
    (id: string, childRelationId?: string | null) => {
      const coordination = tree
        ? resolveNodeCoordinationContext(tree, id, childRelationId)
        : null;

      if (selectedPersonId === null) {
        detailReturnIdentityRef.current = flowIdentity;
      }

      activateFlowIdentity(coordination?.identity ?? flowIdentity);
      setDetailPanelMinimized(false);
      setSelectedPersonId(id);
      setSelectedRelationId(childRelationId ?? null);
    },
    [activateFlowIdentity, flowIdentity, selectedPersonId, tree],
  );

  const handleCloseDetail = useCallback(() => {
    activateFlowIdentity(detailReturnIdentityRef.current);
    setSelectedPersonId(null);
    setSelectedRelationId(null);
    setDetailPanelMinimized(false);
    setActiveDetailModule(null);
  }, [activateFlowIdentity]);

  const handleExploreTeam = useCallback(
    (id: string, childRelationId?: string | null) => {
      const targetCoordination = tree
        ? resolveNodeCoordinationContext(tree, id, childRelationId)
        : null;
      const currentCoordination = tree
        ? resolveNodeCoordinationContext(tree, personId, relationId)
        : null;
      const selectedIdentity = targetCoordination?.identity ?? flowIdentity;
      const currentIdentity = currentCoordination?.identity ?? flowIdentity;
      const nodeKey = orgQueryKeys.node(
        id,
        versionId,
        childRelationId,
        scopeVersionId,
      );
      void queryClient.prefetchQuery({
        queryKey: nodeKey,
        queryFn: () =>
          fetchOrgChartNode(id, {
            ...(versionId !== undefined ? { versionId } : {}),
            ...(scopeVersionId !== undefined ? { scopeVersionId } : {}),
            ...(childRelationId != null ? { relationId: childRelationId } : {}),
          }),
      });
      void beginRouteTransition(selectedIdentity).then(() => {
        navigate(buildTeamExplorePath(id, childRelationId), {
          state: buildTeamExploreNavState({
            currentPersonId: personId,
            navState: teamNavState,
            currentIdentity,
          }),
        });
      });
    },
    [
      beginRouteTransition,
      navigate,
      personId,
      teamNavState,
      queryClient,
      tree,
      versionId,
      scopeVersionId,
      flowIdentity,
    ],
  );

  const handleBack = useCallback(() => {
    const { path, state, backgroundIdentity } = resolveTeamBackNavigation({
      navState: teamNavState,
    });
    const nextIdentity =
      backgroundIdentity !== undefined
        ? backgroundIdentity
        : path === "/org"
          ? null
          : flowIdentity;

    void beginRouteTransition(nextIdentity).then(() => {
      navigate(
        path,
        path === "/org"
          ? { state: { flowBackgroundIdentity: nextIdentity } }
          : state
            ? { state }
            : undefined,
      );
    });
  }, [beginRouteTransition, flowIdentity, navigate, teamNavState]);

  const handleLoadChildren = useCallback(
    async (parentId: string, childRelationId?: string | null) => {
      const loaded = await queryClient.fetchQuery(
        orgChartChildrenQueryOptions(
          parentId,
          versionId,
          childRelationId,
          scopeVersionId,
        ),
      );
      const nodeKey = orgQueryKeys.node(
        personId,
        versionId,
        relationId,
        scopeVersionId,
      );
      const current = queryClient.getQueryData<OrgNode>(nodeKey);
      if (current) {
        const merged = mergeChildrenIntoTree(
          current,
          parentId,
          loaded,
          childRelationId,
        );
        queryClient.setQueryData(nodeKey, merged);
      }
      prefetchDirectChildrenHints(
        queryClient,
        parentId,
        loaded,
        versionId,
        scopeVersionId,
      );
      return loaded;
    },
    [queryClient, personId, versionId, scopeVersionId, relationId],
  );

  const displayTier = tree ? resolveTeamDisplayTier(tree) : null;
  const needsChildrenLoad =
    tree != null &&
    displayTier === "teamListPage" &&
    orgNodeHasDirectReports(tree) &&
    tree.children.length === 0;

  useEffect(() => {
    if (!needsChildrenLoad) return;
    void handleLoadChildren(tree!.id, tree!.relation_id ?? null);
  }, [handleLoadChildren, needsChildrenLoad, tree]);

  const handleDetailPhotoUrl = useCallback(
    (id: string, photoUrl: string) => {
      const nodeKey = orgQueryKeys.node(
        personId,
        versionId,
        relationId,
        scopeVersionId,
      );
      const current = queryClient.getQueryData<OrgNode>(nodeKey);
      if (current) {
        queryClient.setQueryData(
          nodeKey,
          patchNodePhotoUrl(current, id, photoUrl),
        );
      }
    },
    [queryClient, personId, versionId, scopeVersionId, relationId],
  );

  const detailOverlayOpen = Boolean(selectedPersonId && !detailPanelMinimized);

  return (
    <div className="flex min-h-0 flex-1 flex-col [--app-header-h:3.25rem] sm:[--app-header-h:3.5rem]">
      <OrgChartHeader
        conn={conn}
        onSelectSearchHit={handleSelectNodeFromMap}
        searchInputId="org-chart-search-explore"
      />

      <OrgChartVersionBar />

      <main className="org-flow-area-surface relative min-h-0 flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="org-flow-area-accent pointer-events-none absolute inset-0 z-0"
        />
        {chartError ? (
          <div className="flex h-full min-h-0 items-center justify-center overflow-auto p-6">
            <div
              role="alert"
              className="max-w-lg rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              <p className="font-medium">No se pudo cargar el equipo</p>
              <p className="mt-1 text-rose-800/90">{chartError}</p>
              <p className="mt-3">
                <Link
                  to="/org"
                  className="font-semibold text-cyan-800 underline decoration-cyan-400/60 underline-offset-2 hover:text-cyan-950"
                >
                  Volver al organigrama completo
                </Link>
              </p>
            </div>
          </div>
        ) : tree ? (
            <>
              <div className="node-summary-panel__slot">
                <div className="node-summary-panel__dock pointer-events-auto">
                  <NodeSummaryPanel
                    personId={
                      expandedNodeId
                        ? parseOrgMapNodeKey(expandedNodeId).personId
                        : personId
                    }
                  />
                </div>
              </div>

              <div className="absolute inset-0 z-0 flex min-h-0 flex-col">
                {displayTier === "teamListPage" ? (
                  <TeamScrollListView
                    key={`explore-list:${tree.id}:${relationId ?? ""}`}
                    leader={tree}
                    selectedPersonId={selectedPersonId}
                    onSelectPerson={handleSelectNodeFromMap}
                    onExploreTeam={handleExploreTeam}
                    showBackButton
                    onBack={handleBack}
                  />
                ) : (
                  <OrgMapView
                    key={`explore-map:${tree.id}:${relationId ?? ""}`}
                    variant="fullscreen"
                    root={tree}
                    selectedPersonId={selectedPersonId}
                    selectedRelationId={selectedRelationId}
                    onSelectNode={handleSelectNodeFromMap}
                    maxRenderLevels={MAP_MAX_LEVELS}
                    initialShowRootChildren
                    onExploreTeam={handleExploreTeam}
                    onLoadChildren={handleLoadChildren}
                    onDirectChildrenVisible={(parentId, children) =>
                      prefetchDirectChildrenHints(
                        queryClient,
                        parentId,
                        children,
                        versionId,
                        scopeVersionId,
                      )
                    }
                    showBackButton
                    onBack={handleBack}
                    onExpandedNodeChange={setExpandedNodeId}
                  />
                )}
              </div>

              <div
                className="pointer-events-none absolute inset-0 z-30 flex max-sm:items-end max-sm:justify-center sm:items-stretch sm:justify-end sm:p-4"
                aria-hidden={!detailOverlayOpen}
              >
                {detailOverlayOpen ? (
                  <aside
                    className={[
                      "entity-detail-overlay pointer-events-auto flex h-full max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] min-h-0 w-full flex-col overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] max-sm:fixed max-sm:bottom-3 max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] sm:max-h-[calc(100vh-var(--app-header-h)-2rem)]",
                      entityDetailOverlayWidthClass(activeDetailModule),
                    ].join(" ")}
                    aria-label="Ficha técnica de la persona"
                  >
                    <PersonDetailPanel
                      personId={selectedPersonId}
                      treeDescendantCount={treeDescendantCount}
                      layoutVariant="overlay"
                      onDetailPhotoUrl={handleDetailPhotoUrl}
                      onActiveModuleChange={setActiveDetailModule}
                      onMinimize={() => setDetailPanelMinimized(true)}
                      onClose={handleCloseDetail}
                    />
                  </aside>
                ) : null}
              </div>

              {selectedPersonId && detailPanelMinimized ? (
                <PersonDetailRestoreButton
                  onRestore={() => setDetailPanelMinimized(false)}
                />
              ) : null}
            </>
        ) : null}
      </main>
    </div>
  );
}

export function OrgChartExplorePage() {
  const { personId } = useParams<{ personId: string }>();
  const [searchParams] = useSearchParams();
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const relationId = searchParams.get("relationId");

  if (!personId) {
    return <Navigate to="/" replace />;
  }

  return (
    <OrgChartExploreBody
      key={`v:${versionId ?? "active"}:s:${scopeVersionId ?? "auto"}:r:${relationId ?? "none"}`}
      personId={personId}
      relationId={relationId}
    />
  );
}
