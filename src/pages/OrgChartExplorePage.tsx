import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useHoldRouteTransition } from "../contexts/RouteTransitionContext";
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
import { useOrgChartVersionQueryId, useOrgChartVersionReady } from "../features/org-chart/context/OrgChartVersionContext";
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

const MAP_MAX_LEVELS = 4;

type ExploreBodyProps = {
  personId: string;
  /** Posición visual (`org_visual_relation.id`) que se está explorando, si aplica. */
  relationId: string | null;
};

function OrgChartExploreBody({ personId, relationId }: ExploreBodyProps) {
  const conn = useOrgChartConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const teamNavState = readOrgTeamNavState(location.state);
  const queryClient = useQueryClient();
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  const {
    data: tree,
    isLoading,
    isError,
    error,
  } = useOrgChartNode(personId, true, relationId);

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [detailPanelMinimized, setDetailPanelMinimized] = useState(false);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [activeDetailModule, setActiveDetailModule] =
    useState<ProfileModuleCode | null>(null);

  useEffect(() => {
    setSelectedPersonId(null);
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

  const treeDescendantCount =
    tree && selectedPersonId
      ? (() => {
          const n = findNodeInTree(tree, selectedPersonId);
          return n ? countPeopleUnder(n) : null;
        })()
      : null;

  const handleSelectNodeFromMap = useCallback((id: string) => {
    setDetailPanelMinimized(false);
    setSelectedPersonId(id);
  }, []);

  const handleExploreTeam = useCallback(
    (id: string, childRelationId?: string | null) => {
      const nodeKey = orgQueryKeys.node(id, versionId, childRelationId);
      void queryClient.prefetchQuery({
        queryKey: nodeKey,
        queryFn: () =>
          fetchOrgChartNode(
            id,
            versionId || childRelationId != null
              ? { versionId, relationId: childRelationId }
              : undefined,
          ),
      });
      navigate(buildTeamExplorePath(id, childRelationId), {
        state: buildTeamExploreNavState({
          currentPersonId: personId,
          navState: teamNavState,
        }),
      });
    },
    [navigate, personId, teamNavState, queryClient, versionId],
  );

  const handleBack = useCallback(() => {
    const { path, state } = resolveTeamBackNavigation({ navState: teamNavState });
    navigate(path, state ? { state } : undefined);
  }, [navigate, teamNavState]);

  const handleLoadChildren = useCallback(
    async (parentId: string, childRelationId?: string | null) => {
      const loaded = await queryClient.fetchQuery(
        orgChartChildrenQueryOptions(parentId, versionId, childRelationId),
      );
      const nodeKey = orgQueryKeys.node(personId, versionId, relationId);
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
      prefetchDirectChildrenHints(queryClient, parentId, loaded, versionId);
      return loaded;
    },
    [queryClient, personId, versionId, relationId],
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
      const nodeKey = orgQueryKeys.node(personId, versionId, relationId);
      const current = queryClient.getQueryData<OrgNode>(nodeKey);
      if (current) {
        queryClient.setQueryData(
          nodeKey,
          patchNodePhotoUrl(current, id, photoUrl),
        );
      }
    },
    [queryClient, personId, versionId, relationId],
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

      <main className="relative min-h-0 flex-1 overflow-hidden bg-transparent">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.10),transparent_42%)]"
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
                  <NodeSummaryPanel personId={expandedNodeId ?? personId} />
                </div>
              </div>

              <div className="absolute inset-0 z-0 flex min-h-0 flex-col">
                {displayTier === "teamListPage" ? (
                  <TeamScrollListView
                    key="explore-list"
                    leader={tree}
                    onSelectPerson={handleSelectNodeFromMap}
                    onExploreTeam={handleExploreTeam}
                    showBackButton
                    onBack={handleBack}
                  />
                ) : (
                  <OrgMapView
                    key="explore-map"
                    variant="fullscreen"
                    root={tree}
                    selectedPersonId={selectedPersonId}
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
                      onClose={() => {
                        setSelectedPersonId(null);
                        setDetailPanelMinimized(false);
                        setActiveDetailModule(null);
                      }}
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
  const relationId = searchParams.get("relationId");

  if (!personId) {
    return <Navigate to="/" replace />;
  }

  // Re-montar al cambiar versión o posición (relationId); personId se maneja por
  // props + reset de UI. Así no se mezcla el equipo de dos posiciones distintas.
  return (
    <OrgChartExploreBody
      key={`v:${versionId ?? "active"}:r:${relationId ?? "none"}`}
      personId={personId}
      relationId={relationId}
    />
  );
}
