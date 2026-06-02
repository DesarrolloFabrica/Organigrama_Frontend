import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useHoldRouteTransition } from "../contexts/RouteTransitionContext";
import { type OrgNode, countPeopleUnder } from "../features/org-chart/types";
import { findNodeInTree } from "../features/org-chart/utils/findNodeInTree";
import { patchNodePhotoUrl } from "../features/org-chart/utils/patchNodePhotoUrl";
import { fetchHealth } from "../features/org-chart/services/orgChartService";
import { NodeSummaryPanel } from "../features/org-chart/components/NodeSummaryPanel";
import { mergeChildrenIntoTree } from "../features/org-chart/utils/mergeChildrenIntoTree";
import { OrgMapView } from "../features/org-chart/components/OrgMapView";
import { PersonDetailPanel } from "../features/org-chart/components/PersonDetailPanel";
import { OrgChartSearchPanel } from "../features/org-chart/components/OrgChartSearchPanel";
import { LogoutButton } from "../features/org-chart/components/LogoutButton";
import {
  getOrgChartMainSession,
  saveOrgChartMainSession,
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
import { fetchOrgChartNode } from "../features/org-chart/services/orgChartService";

type ConnState = "checking" | "online" | "offline";

const MAP_MAX_LEVELS = 3;

const defaultMapPersisted = (): OrgMapExpansionPersisted => ({
  showRootChildren: false,
  expandedHubNodeId: null,
  viewport: null,
});

export function OrgChartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initialSession = useRef(getOrgChartMainSession());
  const initial = initialSession.current;

  const {
    data: rootData,
    isLoading: isRootLoading,
    isError: isRootError,
    error: rootError,
  } = useOrgChartRoot();

  const [conn, setConn] = useState<ConnState>("checking");
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
      tree,
      selectedPersonId,
      detailPanelMinimized,
      expandedNodeId,
      map: mapPersisted,
    });
  }, [
    tree,
    selectedPersonId,
    detailPanelMinimized,
    expandedNodeId,
    mapPersisted,
  ]);

  useEffect(() => {
    persistSnapshot();
  }, [persistSnapshot]);

  const chartError = isRootError
    ? rootError instanceof Error
      ? rootError.message
      : "Error desconocido al cargar datos"
    : null;

  const showRouteLoader = isRootLoading && !tree;
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
    (children: OrgNode[]) => {
      prefetchDirectChildrenHints(queryClient, children);
    },
    [queryClient],
  );

  const handleExploreTeam = useCallback(
    (id: string) => {
      persistSnapshot();
      const nodeKey = orgQueryKeys.node(id);
      logQueryCacheAccess(
        "org-node-prefetch",
        nodeKey,
        queryClient.getQueryData(nodeKey) !== undefined,
      );
      void queryClient.prefetchQuery({
        queryKey: nodeKey,
        queryFn: () => fetchOrgChartNode(id),
      });
      navigate(`/org-chart/team/${encodeURIComponent(id)}`);
    },
    [navigate, persistSnapshot, queryClient],
  );

  const handleLoadChildren = useCallback(
    async (parentId: string) => {
      const key = orgQueryKeys.children(parentId);
      const t0 = performance.now();
      logQueryCacheAccess(
        "org-children",
        key,
        queryClient.getQueryData(key) !== undefined,
      );
      const loaded = await queryClient.fetchQuery(
        orgChartChildrenQueryOptions(parentId),
      );
      logQueryNetworkTiming("org-children", key, performance.now() - t0);
      setTree((prev) =>
        prev ? mergeChildrenIntoTree(prev, parentId, loaded) : prev,
      );
      prefetchDirectChildrenHints(queryClient, loaded);
      return loaded;
    },
    [queryClient],
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

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then(() => {
        if (!cancelled) setConn("online");
      })
      .catch(() => {
        if (!cancelled) setConn("offline");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const apiBaseDisplay =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

  const statusPill =
    conn === "checking" ? (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-amber-300/20 bg-amber-400/8 px-2 py-1 shadow-[0_0_24px_rgba(251,191,36,0.08)] backdrop-blur-md"
      >
        <span className="relative flex size-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-amber-400/40" />
          <span className="relative size-1.5 rounded-full bg-amber-300" />
        </span>
        <span className="truncate text-[11px] font-medium tracking-wide text-amber-100/90">
          Verificando…
        </span>
      </div>
    ) : conn === "online" ? (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 shadow-[0_0_24px_rgba(16,185,129,0.14)] backdrop-blur-md"
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]"
          aria-hidden
        />
        <span className="truncate text-[11px] font-semibold tracking-wide text-emerald-50">
          Conectado
        </span>
      </div>
    ) : (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-rose-300/20 bg-rose-400/10 px-2 py-1 shadow-[0_0_24px_rgba(244,63,94,0.12)] backdrop-blur-md"
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-rose-300 shadow-[0_0_10px_rgba(253,164,175,0.8)]"
          aria-hidden
        />
        <span className="truncate text-[11px] font-medium tracking-wide text-rose-100">
          Sin conexión
        </span>
      </div>
    );

  const detailOverlayOpen = Boolean(selectedPersonId && !detailPanelMinimized);

  return (
    <div className="flex min-h-0 flex-1 flex-col [--app-header-h:2.75rem] sm:[--app-header-h:3rem]">
      <header className="sticky top-0 z-20 shrink-0 border-b border-cyan-300/15 bg-[#020617]/82 shadow-[0_12px_38px_-20px_rgba(34,211,238,0.45)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent"
          aria-hidden
        />
        <div className="mx-auto flex h-[var(--app-header-h)] max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-[0.9375rem]">
              Organigrama OP
            </h1>
            <span
              className="hidden h-3 w-px shrink-0 bg-slate-200 sm:block"
              aria-hidden
            />
            <span className="hidden truncate font-mono text-[10px] font-medium uppercase tracking-wider text-cyan-100/90 sm:inline">
              Dirección de Operaciones
            </span>
          </div>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <span className="hidden rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.28em] text-cyan-100/65 shadow-[0_0_22px_rgba(34,211,238,0.08)] sm:inline-flex">
              <span
                className="size-1 rounded-full bg-cyan-500/55"
                aria-hidden
              />
              Mapa operacional
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <OrgChartSearchPanel
              inputId="org-chart-search-desktop"
              className="hidden sm:block"
              onSelectHit={handleSelectNodeFromMap}
            />
            {statusPill}
            <LogoutButton />
          </div>
        </div>
        <div className="border-t border-cyan-300/10 px-3 py-2 sm:hidden">
          <OrgChartSearchPanel
            inputId="org-chart-search-mobile"
            className="w-full max-w-none"
            onSelectHit={handleSelectNodeFromMap}
          />
        </div>
      </header>

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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[var(--app-header-h)] z-20 flex items-start justify-start pb-3 pr-3 pt-3 pl-7 sm:pb-4 sm:pr-4 sm:pt-4 sm:pl-10">
              <NodeSummaryPanel personId={expandedNodeId ?? tree.id} />
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
                  className="entity-detail-overlay pointer-events-auto flex h-full max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] min-h-0 w-full max-w-[420px] flex-col overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] max-sm:fixed max-sm:bottom-3 max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] sm:max-h-[calc(100vh-var(--app-header-h)-2rem)] sm:w-[min(420px,calc(100vw-2rem))]"
                  aria-label="Ficha técnica de la persona"
                >
                  <PersonDetailPanel
                    personId={selectedPersonId}
                    treeDescendantCount={treeDescendantCount}
                    layoutVariant="overlay"
                    onDetailPhotoUrl={handleDetailPhotoUrl}
                    onMinimize={() => setDetailPanelMinimized(true)}
                    onClose={() => {
                      setSelectedPersonId(null);
                      setDetailPanelMinimized(false);
                    }}
                  />
                </aside>
              ) : null}
            </div>

            {selectedPersonId && detailPanelMinimized ? (
              <button
                type="button"
                className="pointer-events-auto fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-lg backdrop-blur-sm transition hover:border-cyan-300/60 hover:text-cyan-900 sm:absolute sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
                onClick={() => setDetailPanelMinimized(false)}
                aria-label="Mostrar ficha técnica"
              >
                <span
                  className="font-mono text-[10px] text-cyan-700/90"
                  aria-hidden
                >
                  ◈
                </span>
                Ficha
              </button>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
