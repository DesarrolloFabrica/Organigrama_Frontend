import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useHoldRouteTransition } from "../contexts/RouteTransitionContext";
import { type OrgNode, countPeopleUnder } from "../features/org-chart/types";
import { findNodeInTree } from "../features/org-chart/utils/findNodeInTree";
import { patchNodePhotoUrl } from "../features/org-chart/utils/patchNodePhotoUrl";
import { NodeSummaryPanel } from "../features/org-chart/components/NodeSummaryPanel";
import { mergeChildrenIntoTree } from "../features/org-chart/utils/mergeChildrenIntoTree";
import { OrgMapView } from "../features/org-chart/components/OrgMapView";
import { PersonDetailPanel } from "../features/org-chart/components/PersonDetailPanel";
import type { ProfileModuleCode } from "../features/org-chart/components/profile-modules/profile-module.types";
import { PersonDetailRestoreButton } from "../features/org-chart/components/PersonDetailRestoreButton";
import { OrgChartVersionBar } from "../features/org-chart/components/OrgChartVersionBar";
import { useOrgChartVersionQueryId, useOrgChartVersionReady } from "../features/org-chart/context/OrgChartVersionContext";
import { fetchOrgChartNode } from "../features/org-chart/services/orgChartService";
import { OrgChartHeader } from "../features/org-chart/components/OrgChartHeader";
import { useOrgChartConnection } from "../features/org-chart/hooks/useOrgChartConnection";
import {
  getOrgChartMainSession,
  saveOrgChartMainSession,
  flushOrgChartMainSession,
  type OrgMapExpansionPersisted,
} from "../features/org-chart/state/orgChartMainSession";
import {
  orgChartChildrenQueryOptions,
  useOrgChartRoot,
} from "../lib/react-query/hooks";
import {
  logQueryCacheAccess,
  logQueryNetworkTiming,
} from "../lib/react-query/devTelemetry";
import { orgQueryKeys } from "../lib/react-query/queryKeys";
import { prefetchDirectChildrenHints } from "../lib/react-query/orgChartPrefetch";
import {
  buildTeamExploreNavState,
  buildTeamExplorePath,
} from "../features/org-chart/utils/orgChartTeamNavigation";
import { entityDetailOverlayWidthClass } from "../features/org-chart/utils/personPresentationRules";

const MAP_MAX_LEVELS = 3;

const defaultMapPersisted = (): OrgMapExpansionPersisted => ({
  showRootChildren: false,
  expandedHubNodeId: null,
  viewport: null,
});

function OrgChartPageBody() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  const initialSession = useRef(getOrgChartMainSession(versionId));
  const initial = initialSession.current;

  const {
    data: rootData,
    isLoading: isRootLoading,
    isError: isRootError,
    error: rootError,
  } = useOrgChartRoot();

  const conn = useOrgChartConnection();
  const [tree, setTree] = useState<OrgNode | null>(initial?.tree ?? null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(
    initial?.selectedPersonId ?? null,
  );
  const [detailPanelMinimized, setDetailPanelMinimized] = useState(
    initial?.detailPanelMinimized ?? false,
  );
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(
    initial?.expandedNodeId ?? null,
  );
  const [mapPersisted, setMapPersisted] = useState<OrgMapExpansionPersisted>(
    initial?.map ?? defaultMapPersisted(),
  );
  const [activeDetailModule, setActiveDetailModule] =
    useState<ProfileModuleCode | null>(null);

  useEffect(() => {
    if (!rootData) return;
    setTree((prev) => {
      if (prev && prev.id === rootData.id) return prev;
      if (initial?.tree?.id === rootData.id) return initial.tree;
      return rootData;
    });
  }, [rootData, initial?.tree]);

  const persistSnapshot = useCallback(() => {
    if (!tree) return;
    saveOrgChartMainSession({
      versionId,
      tree,
      selectedPersonId,
      detailPanelMinimized,
      expandedNodeId,
      map: mapPersisted,
    });
  }, [
    versionId,
    tree,
    selectedPersonId,
    detailPanelMinimized,
    expandedNodeId,
    mapPersisted,
  ]);

  useEffect(() => {
    persistSnapshot();
  }, [persistSnapshot]);

  useEffect(() => {
    const onPageHide = () => flushOrgChartMainSession();
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  const chartError = isRootError
    ? rootError instanceof Error
      ? rootError.message
      : "Error desconocido al cargar datos"
    : null;

  const showRouteLoader = !versionReady || (isRootLoading && !tree);
  useHoldRouteTransition(showRouteLoader);

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

  const handleDirectChildrenVisible = useCallback(
    (parentId: string, children: OrgNode[]) => {
      prefetchDirectChildrenHints(queryClient, parentId, children, versionId);
    },
    [queryClient, versionId],
  );

  const handleExploreTeam = useCallback(
    (id: string, relationId?: string | null) => {
      if (tree) {
        saveOrgChartMainSession(
          {
            versionId,
            tree,
            selectedPersonId,
            detailPanelMinimized,
            expandedNodeId,
            map: mapPersisted,
          },
          { immediate: true },
        );
      }
      const nodeKey = orgQueryKeys.node(id, versionId, relationId);
      logQueryCacheAccess(
        "org-node-prefetch",
        nodeKey,
        queryClient.getQueryData(nodeKey) !== undefined,
      );
      void queryClient.prefetchQuery({
        queryKey: nodeKey,
        queryFn: () =>
          fetchOrgChartNode(
            id,
            versionId || relationId != null
              ? { versionId, relationId }
              : undefined,
          ),
      });
      navigate(buildTeamExplorePath(id, relationId), {
        state: buildTeamExploreNavState({ currentPersonId: null }),
      });
    },
    [navigate, tree, versionId, selectedPersonId, detailPanelMinimized, expandedNodeId, mapPersisted, queryClient],
  );

  const handleLoadChildren = useCallback(
    async (parentId: string, relationId?: string | null) => {
      const key = orgQueryKeys.children(parentId, versionId, relationId);
      const t0 = performance.now();
      logQueryCacheAccess(
        "org-children",
        key,
        queryClient.getQueryData(key) !== undefined,
      );
      const loaded = await queryClient.fetchQuery(
        orgChartChildrenQueryOptions(parentId, versionId, relationId),
      );
      logQueryNetworkTiming("org-children", key, performance.now() - t0);
      setTree((prev) =>
        prev ? mergeChildrenIntoTree(prev, parentId, loaded, relationId) : prev,
      );
      prefetchDirectChildrenHints(queryClient, parentId, loaded, versionId);
      return loaded;
    },
    [queryClient, versionId],
  );

  const handleMapPersistedChange = useCallback(
    (map: OrgMapExpansionPersisted) => {
      setMapPersisted(map);
    },
    [],
  );

  const handleDetailPhotoUrl = useCallback((personId: string, photoUrl: string) => {
    setTree((prev) =>
      prev ? patchNodePhotoUrl(prev, personId, photoUrl) : prev,
    );
  }, []);

  const detailOverlayOpen = Boolean(selectedPersonId && !detailPanelMinimized);

  return (
    <div className="flex min-h-0 flex-1 flex-col [--app-header-h:3.25rem] sm:[--app-header-h:3.5rem]">
      <OrgChartHeader
        conn={conn}
        onSelectSearchHit={handleSelectNodeFromMap}
        searchInputId="org-chart-search"
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
              <p className="font-medium">No se pudo cargar el organigrama</p>
              <p className="mt-1 text-rose-800/90">{chartError}</p>
            </div>
          </div>
        ) : tree ? (
          <>
            <div className="node-summary-panel__slot">
              <div className="node-summary-panel__dock pointer-events-auto">
                <NodeSummaryPanel personId={expandedNodeId ?? tree.id} />
              </div>
            </div>

            <div className="absolute inset-0 z-0 flex min-h-0 flex-col">
              <OrgMapView
                key="org-main-map"
                variant="fullscreen"
                root={tree}
                selectedPersonId={selectedPersonId}
                onSelectNode={handleSelectNodeFromMap}
                maxRenderLevels={MAP_MAX_LEVELS}
                onExploreTeam={handleExploreTeam}
                onLoadChildren={handleLoadChildren}
                onDirectChildrenVisible={handleDirectChildrenVisible}
                persistedMapState={mapPersisted}
                onPersistedMapStateChange={handleMapPersistedChange}
                onExpandedNodeChange={setExpandedNodeId}
              />
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

export function OrgChartPage() {
  const versionId = useOrgChartVersionQueryId();
  // La `key` por versión re-monta el cuerpo al cambiar de versión: descarta
  // árbol/selección/expansión locales y el estado interno del mapa (React Flow),
  // forzando una carga limpia de la nueva versión sin datos viejos.
  return <OrgChartPageBody key={`org-main:v:${versionId ?? "active"}`} />;
}
