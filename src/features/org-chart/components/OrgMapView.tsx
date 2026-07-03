import type { MutableRefObject, ReactElement } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  MarkerType,
  useOnViewportChange,
  useReactFlow,
} from "@xyflow/react";
import type { OrgMapExpansionPersisted } from "../state/orgChartMainSession";
import "@xyflow/react/dist/style.css";

import type { OrgNode } from "../types";
import { orgNodeHasDirectReports } from "../types";
import { OrgMapNode } from "./OrgMapNode";
import { buildVisibleSubtree } from "../utils/buildVisibleSubtree";
import {
  resolveTeamDisplayTier,
  resolveTeamNavigation,
  shouldNavigateToTeamListPage,
  shouldRenderHorizontalRow,
  shouldRenderInternalTeamHub,
  shouldRenderTeamBox,
} from "../utils/orgMapDisplayPolicy";
import { buildOrgMap, type OrgMapNodeData } from "../utils/orgMapLayout";
import { resolveOrgMapTheme, resolveOrgMapVisualLevel } from "../utils/orgMapLevelTheme";
import { truncateTreeToMaxLevels } from "../utils/truncateOrgTreeLevels";
import { RadarBackground } from "./RadarBackground";
import { OrgMapSelectionProvider } from "../context/OrgMapSelectionContext";
import { useOrgPerfLite } from "../context/OrgPerfLiteContext";

type Props = {
  root: OrgNode;
  selectedPersonId: string | null;
  onSelectNode: (id: string) => void;
  variant?: "default" | "fullscreen";
  maxRenderLevels?: number;
  initialShowRootChildren?: boolean;
  onExploreTeam?: (nodeId: string, relationId?: string | null) => void;
  /**
   * Carga hijos directos bajo demanda y actualiza el árbol en la página.
   * `relationId` (posición visual) permite pedir el equipo de una posición
   * concreta cuando la misma persona ocupa varias.
   */
  onLoadChildren?: (
    parentId: string,
    relationId?: string | null,
  ) => Promise<OrgNode[]>;
  /** Tras materializar hijos directos (carga o ya en árbol): prefetch / hints. */
  onDirectChildrenVisible?: (parentId: string, children: OrgNode[]) => void;
  /** Estado de mapa persistido (expansión + viewport) para restaurar al volver a /org. */
  persistedMapState?: OrgMapExpansionPersisted | null;
  onPersistedMapStateChange?: (state: OrgMapExpansionPersisted) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  /** Se dispara cuando el nodo expandido cambia (null = ninguno expandido). */
  onExpandedNodeChange?: (nodeId: string | null) => void;
};

type CameraIntent = {
  parentId: string;
  /** `true` = acaba de expandir; `false` = acaba de colapsar */
  expanded: boolean;
};

const CAMERA_DURATION_MS = 650;
const CAMERA_PADDING = 0.2;
const CAMERA_MAX_ZOOM = 1.06;
const CAMERA_MIN_ZOOM = 0.28;

/**
 * Ajusta viewport tras expandir/colapsar (debe vivir dentro de `<ReactFlow>` para `useReactFlow`).
 * Doble `requestAnimationFrame` para dejar medir nodos; `fitView({ nodes })` encuadra nodos relevantes.
 */
function OrgMapViewCamera({
  cameraNonce,
  expansionStateKey,
  cameraIntentRef,
  nodeByIdRef,
  layoutRootId,
}: {
  cameraNonce: number;
  expansionStateKey: string;
  cameraIntentRef: MutableRefObject<CameraIntent | null>;
  nodeByIdRef: MutableRefObject<Map<string, OrgNode>>;
  layoutRootId: string;
}) {
  const { fitView, getNodes } = useReactFlow();

  useEffect(() => {
    if (cameraNonce === 0) return;

    const intent = cameraIntentRef.current;
    if (!intent) return;

    const snapshot: CameraIntent = { ...intent };
    const { parentId, expanded } = snapshot;
    const full = nodeByIdRef.current.get(parentId);
    if (!full) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : CAMERA_DURATION_MS;

    let raf1 = 0;
    let raf2 = 0;
    let timeoutId = 0;
    let ranFit = false;

    const runFit = () => {
      if (!ranFit) {
        cameraIntentRef.current = null;
        ranFit = true;
      }

      const all = getNodes();
      const byId = new Map(all.map((n) => [n.id, n]));

      let targetIds: string[];
      let fitPadding: number | undefined = CAMERA_PADDING;
      let fitMaxZoom = CAMERA_MAX_ZOOM;

      if (expanded) {
        const isRoot = parentId === layoutRootId;
        if (isRoot && shouldRenderHorizontalRow(full)) {
          targetIds = [parentId, ...full.children.map((c) => c.id)];
        } else {
          targetIds = [parentId];
          fitPadding = 0.06;
          fitMaxZoom = 1.42;
        }
      } else if (parentId === layoutRootId) {
        targetIds = [parentId];
      } else {
        const rootFull = nodeByIdRef.current.get(layoutRootId);
        targetIds =
          rootFull && shouldRenderHorizontalRow(rootFull)
            ? [layoutRootId, ...rootFull.children.map((c) => c.id)]
            : [layoutRootId];
      }

      const nodes = targetIds
        .map((id) => byId.get(id))
        .filter((n): n is NonNullable<typeof n> => n != null);

      if (nodes.length === 0) return;

      void fitView({
        nodes,
        padding: fitPadding,
        duration,
        minZoom: CAMERA_MIN_ZOOM,
        maxZoom: fitMaxZoom,
      });
    };

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        runFit();
        if (expanded && duration > 0) {
          timeoutId = window.setTimeout(
            runFit,
            snapshot.parentId === layoutRootId ? 48 : 140,
          );
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (!ranFit) {
        cameraIntentRef.current = snapshot;
      }
    };
  }, [
    cameraNonce,
    expansionStateKey,
    cameraIntentRef,
    fitView,
    getNodes,
    layoutRootId,
    nodeByIdRef,
  ]);

  return null;
}

const INITIAL_CENTER_VISUAL_OFFSET_X = 0;
const INITIAL_CENTER_VISUAL_OFFSET_Y = -20;
const INITIAL_CENTER_ZOOM = 0.82;
const INITIAL_CENTER_NODE_W = 360;
const INITIAL_CENTER_NODE_H = 260;
const VIEWPORT_APPLY_MAX_ATTEMPTS = 32;

type ViewportXYZoom = { x: number; y: number; zoom: number };

/** Centra el lienzo sobre el bounding box de los nodos; devuelve null si aún no hay nodos. */
function centerViewportOnNodes(
  getNodes: ReturnType<typeof useReactFlow>["getNodes"],
  setViewport: ReturnType<typeof useReactFlow>["setViewport"],
  zoom = INITIAL_CENTER_ZOOM,
): ViewportXYZoom | null {
  const nodes = getNodes();
  if (nodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const w = node.width ?? INITIAL_CENTER_NODE_W;
    const h = node.height ?? INITIAL_CENTER_NODE_H;
    const ox = node.origin?.[0] ?? 0;
    const oy = node.origin?.[1] ?? 0;
    const left = node.position.x - ox * w;
    const top = node.position.y - oy * h;
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + w);
    maxY = Math.max(maxY, top + h);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const container = document.querySelector(".org-map-flow");
  if (!(container instanceof HTMLElement)) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width <= 0 || height <= 0) return null;

  const x = width / 2 - centerX * zoom + INITIAL_CENTER_VISUAL_OFFSET_X;
  const y = height / 2 - centerY * zoom + INITIAL_CENTER_VISUAL_OFFSET_Y;
  const viewport = { x, y, zoom };

  setViewport(viewport, { duration: 0 });
  return viewport;
}

/** Espera a que React Flow tenga nodos medidos antes de aplicar viewport. */
function scheduleViewportApply(apply: () => boolean | void): () => void {
  let cancelled = false;
  let attempt = 0;
  let rafOuter = 0;
  let rafInner = 0;

  const tick = () => {
    if (cancelled) return;
    attempt += 1;
    if (apply() || attempt >= VIEWPORT_APPLY_MAX_ATTEMPTS) return;
    rafInner = requestAnimationFrame(tick);
  };

  rafOuter = requestAnimationFrame(() => {
    rafInner = requestAnimationFrame(tick);
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafOuter);
    cancelAnimationFrame(rafInner);
  };
}

function OrgMapViewportPersistence({
  persistedViewport,
  layoutKey,
  expansionPatch,
  onPersistedMapStateChange,
  lastViewportRef,
}: {
  persistedViewport: OrgMapExpansionPersisted["viewport"];
  layoutKey: string;
  expansionPatch: Pick<
    OrgMapExpansionPersisted,
    "showRootChildren" | "expandedHubNodeId"
  >;
  onPersistedMapStateChange?: (state: OrgMapExpansionPersisted) => void;
  lastViewportRef: MutableRefObject<OrgMapExpansionPersisted["viewport"]>;
}) {
  const { getNodes, setViewport } = useReactFlow();
  const appliedLayoutKeyRef = useRef<string | null>(null);
  const prevLayoutKeyRef = useRef<string | null>(null);
  const viewportPersistTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!persistedViewport) return;
    if (appliedLayoutKeyRef.current === layoutKey) return;

    const prevKey = prevLayoutKeyRef.current;
    prevLayoutKeyRef.current = layoutKey;

    const [show, hub] = layoutKey.split("|");
    const [prevShow, prevHub] = (prevKey ?? "").split("|");
    const expansionUnchanged =
      prevKey != null && show === prevShow && hub === prevHub;

    return scheduleViewportApply(() => {
      if (getNodes().length === 0) return false;

      if (expansionUnchanged) {
        const centered = centerViewportOnNodes(
          getNodes,
          setViewport,
          persistedViewport.zoom,
        );
        if (!centered) return false;
        lastViewportRef.current = centered;
        appliedLayoutKeyRef.current = layoutKey;
        return true;
      }

      setViewport(persistedViewport, { duration: 0 });
      lastViewportRef.current = persistedViewport;
      appliedLayoutKeyRef.current = layoutKey;
      return true;
    });
  }, [layoutKey, persistedViewport, getNodes, setViewport, lastViewportRef]);

  useOnViewportChange({
    onEnd: (viewport) => {
      const next = {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom,
      };
      lastViewportRef.current = next;
      if (viewportPersistTimerRef.current !== null) {
        window.clearTimeout(viewportPersistTimerRef.current);
      }
      viewportPersistTimerRef.current = window.setTimeout(() => {
        viewportPersistTimerRef.current = null;
        onPersistedMapStateChange?.({
          ...expansionPatch,
          viewport: next,
        });
      }, 200);
    },
  });

  useEffect(
    () => () => {
      if (viewportPersistTimerRef.current !== null) {
        window.clearTimeout(viewportPersistTimerRef.current);
      }
    },
    [],
  );

  return null;
}

/**
 * Centrado inicial del viewport según el bounding box de los nodos (sin `fitView`).
 * Reintenta hasta que React Flow registra nodos (vuelta a /org con árbol restaurado).
 */
function OrgMapInitialCenter({
  nodesKey,
  enabled,
}: {
  nodesKey: string;
  enabled: boolean;
}) {
  const { getNodes, setViewport } = useReactFlow();
  const centeredKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (centeredKeyRef.current === nodesKey) return;

    return scheduleViewportApply(() => {
      const centered = centerViewportOnNodes(getNodes, setViewport);
      if (!centered) return false;
      centeredKeyRef.current = nodesKey;
      return true;
    });
  }, [nodesKey, enabled, getNodes, setViewport]);

  return null;
}

/**
 * Tipos de nodos personalizados disponibles para React Flow.
 */
const nodeTypes = {
  orgNode: OrgMapNode,
};

/**
 * Vista tipo mapa para el organigrama.
 * El lienzo oscuro va dentro de `.org-map-shell` (marco claro + halo) para integrarse con la página.
 * Canvas = subárbol explorado del organigrama.
 *
 * Expansión del **hub interno** (fila 2): un único `expandedHubNodeId`; al expandir otro, el anterior se cierra.
 */
export function OrgMapView({
  root,
  selectedPersonId,
  onSelectNode,
  variant = "default",
  maxRenderLevels,
  initialShowRootChildren = false,
  onExploreTeam,
  onLoadChildren,
  onDirectChildrenVisible,
  persistedMapState = null,
  onPersistedMapStateChange,
  showBackButton = false,
  onBack,
  onExpandedNodeChange,
}: Props): ReactElement {
  const { liteMode, reportMetrics } = useOrgPerfLite();
  const hasPersistedViewport = Boolean(persistedMapState?.viewport);
  const lastViewportRef = useRef<OrgMapExpansionPersisted["viewport"]>(
    persistedMapState?.viewport ?? null,
  );
  const [showRootChildren, setShowRootChildren] = useState(
    persistedMapState?.showRootChildren ?? initialShowRootChildren,
  );
  /** A lo sumo un nodo de fila 2 con panel de equipo interno abierto. */
  const [expandedHubNodeId, setExpandedHubNodeId] = useState<string | null>(
    persistedMapState?.expandedHubNodeId ?? null,
  );
  const [loadingChildrenNodeId, setLoadingChildrenNodeId] = useState<
    string | null
  >(null);
  const [mapReady, setMapReady] = useState(false);
  const rootIdRef = useRef(root.id);

  useEffect(() => {
    if (rootIdRef.current === root.id) return;
    rootIdRef.current = root.id;
    setShowRootChildren(
      persistedMapState?.showRootChildren ?? initialShowRootChildren,
    );
    setExpandedHubNodeId(persistedMapState?.expandedHubNodeId ?? null);
    setLoadingChildrenNodeId(null);
    setCameraNonce((nonce) => nonce + 1);
  }, [
    root.id,
    initialShowRootChildren,
    persistedMapState?.expandedHubNodeId,
    persistedMapState?.showRootChildren,
  ]);

  useEffect(() => {
    if (!onPersistedMapStateChange) return;
    onPersistedMapStateChange({
      showRootChildren,
      expandedHubNodeId,
      viewport: lastViewportRef.current ?? persistedMapState?.viewport ?? null,
    });
  }, [showRootChildren, expandedHubNodeId, onPersistedMapStateChange, persistedMapState?.viewport]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMapReady(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const mapMeasureRef = useRef<HTMLDivElement | null>(null);
  const [mapViewportWidth, setMapViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useLayoutEffect(() => {
    const el = mapMeasureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMapViewportWidth(el.clientWidth);
    });
    ro.observe(el);
    setMapViewportWidth(el.clientWidth);
    return () => {
      ro.disconnect();
    };
  }, []);

  /** Se incrementa en cada expand/colapsar explícito para disparar la cámara tras el commit. */
  const [cameraNonce, setCameraNonce] = useState(0);
  const cameraIntentRef = useRef<CameraIntent | null>(null);
  const nodeByIdRef = useRef<Map<string, OrgNode>>(new Map());

  const expansionStateKey = useMemo(
    () =>
      `${showRootChildren ? "1" : "0"}|${expandedHubNodeId ?? ""}|${mapViewportWidth}`,
    [expandedHubNodeId, mapViewportWidth, showRootChildren],
  );

  /**
   * Índice id → nodo del árbol COMPLETO (datos de equipo interno, conteos, etc.).
   */
  const nodeById = useMemo(() => {
    const map = new Map<string, OrgNode>();
    function index(n: OrgNode) {
      map.set(n.id, n);
      for (const child of n.children) index(child);
    }
    index(root);
    return map;
  }, [root]);

  useLayoutEffect(() => {
    nodeByIdRef.current = nodeById;
  }, [nodeById]);

  useEffect(() => {
    const rootNode = nodeById.get(root.id) ?? root;
    const expandedId =
      expandedHubNodeId ??
      (showRootChildren && shouldRenderTeamBox(rootNode) ? root.id : null);
    onExpandedNodeChange?.(expandedId);
  }, [expandedHubNodeId, nodeById, onExpandedNodeChange, root, showRootChildren]);

  const layoutRoot = useMemo(() => {
    const visible = buildVisibleSubtree(root, showRootChildren);
    if (maxRenderLevels == null) {
      return visible;
    }
    return truncateTreeToMaxLevels(visible, maxRenderLevels);
  }, [root, showRootChildren, maxRenderLevels]);

  const expandedHubForLayout = useMemo(() => {
    if (!expandedHubNodeId) return null;
    return layoutRoot.children.some((c) => c.id === expandedHubNodeId)
      ? expandedHubNodeId
      : null;
  }, [expandedHubNodeId, layoutRoot]);

  const graph = useMemo(
    () =>
      buildOrgMap(layoutRoot, {
        expandedHubNodeId: expandedHubForLayout,
        viewportWidth: mapViewportWidth,
      }),
    [expandedHubForLayout, layoutRoot, mapViewportWidth],
  );

  const ensureChildrenLoaded = useCallback(
    async (node: OrgNode): Promise<OrgNode> => {
      if (!onLoadChildren || !orgNodeHasDirectReports(node)) {
        return node;
      }

      if (node.children.length > 0) {
        onDirectChildrenVisible?.(node.id, node.children);
        return node;
      }

      setLoadingChildrenNodeId(node.id);
      try {
        const loaded = await onLoadChildren(node.id, node.relation_id ?? null);
        if (loaded.length > 0) {
          onDirectChildrenVisible?.(node.id, loaded);
        }
        return {
          ...node,
          children: loaded,
          direct_reports_count: loaded.length,
        };
      } finally {
        setLoadingChildrenNodeId(null);
      }
    },
    [onDirectChildrenVisible, onLoadChildren],
  );

  useEffect(() => {
    if (!initialShowRootChildren && !showRootChildren) return;
    const rootNode = nodeById.get(root.id) ?? root;
    if (!orgNodeHasDirectReports(rootNode) || rootNode.children.length > 0) {
      return;
    }
    void ensureChildrenLoaded(rootNode);
  }, [
    ensureChildrenLoaded,
    initialShowRootChildren,
    nodeById,
    root,
    showRootChildren,
  ]);

  const handleToggleExpand = useCallback(
    async (nodeId: string) => {
      const fullNode = nodeById.get(nodeId);
      if (!fullNode) return;

      const isCanvasRoot = nodeId === root.id;
      const isExpanded = isCanvasRoot
        ? showRootChildren
        : expandedHubNodeId === nodeId;
      const willExpand = !isExpanded;

      if (!willExpand) {
        cameraIntentRef.current = { parentId: nodeId, expanded: false };
        setCameraNonce((n) => n + 1);
        if (isCanvasRoot) {
          setShowRootChildren(false);
          setExpandedHubNodeId(null);
        } else {
          setExpandedHubNodeId(null);
        }
        return;
      }

      const nodeWithChildren = await ensureChildrenLoaded(fullNode);
      const navigation = resolveTeamNavigation(nodeWithChildren, {
        isCanvasRoot,
      });

      if (navigation === "navigateToTeamPage") {
        onExploreTeam?.(nodeId, nodeWithChildren.relation_id ?? null);
        return;
      }

      cameraIntentRef.current = { parentId: nodeId, expanded: true };
      setCameraNonce((n) => n + 1);

      if (isCanvasRoot) {
        setShowRootChildren(true);
        return;
      }

      setExpandedHubNodeId(nodeId);
    },
    [
      ensureChildrenLoaded,
      expandedHubNodeId,
      nodeById,
      onExploreTeam,
      root.id,
      showRootChildren,
    ],
  );

  /** Sólo abre el panel lateral; no confundir con expandir ramas del mapa. */
  const handleOpenDetail = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);
    },
    [onSelectNode],
  );

  const baseInteractiveNodes = useMemo(
    () =>
      graph.nodes.map((node) => {
        const full = nodeById.get(node.id);
        const layoutOrg = node.data.orgNode;
        const orgNodeForView = full
          ? {
              ...layoutOrg,
              photoUrl: full.photoUrl ?? layoutOrg.photoUrl ?? null,
            }
          : layoutOrg;
        const reportNode = full ?? layoutOrg;
        const directReportsTotal =
          full?.direct_reports_count ??
          layoutOrg.direct_reports_count ??
          (orgNodeHasDirectReports(reportNode)
            ? (full?.children.length ?? 0)
            : 0);
        const isCanvasRoot = node.id === layoutRoot.id;
        const isExpanded = isCanvasRoot
          ? showRootChildren
          : expandedHubNodeId === node.id;
        const layoutDepth = node.data.mapLayoutDepth ?? 0;
        const { visualLevel, tokens: levelTheme } = resolveOrgMapTheme(
          orgNodeForView,
          layoutDepth,
        );
        const hasDeferredTeam = Boolean(layoutOrg.deferred_team);
        const hasChildren = orgNodeHasDirectReports(reportNode);
        const nodeTier = resolveTeamDisplayTier(reportNode);
        const showTeamPageNavigate =
          hasChildren &&
          shouldNavigateToTeamListPage(reportNode) &&
          Boolean(onExploreTeam);
        const showMapExpand =
          hasChildren && nodeTier !== "teamListPage";
        const loadingChildren = loadingChildrenNodeId === node.id;
        const internalTeamMembers =
          isCanvasRoot && showRootChildren && full && shouldRenderTeamBox(full)
            ? full.children
            : expandedHubNodeId === node.id &&
                !isCanvasRoot &&
                full &&
                shouldRenderInternalTeamHub(full)
              ? full.children
              : [];

        const nodeRenderMode =
          internalTeamMembers.length > 0 ? "teamBox" : "treeMap";

        return {
          ...node,
          /**
           * Con `elementsSelectable={false}`, React Flow aplicaría pointer-events:none al wrapper
           * del nodo y los botones interiores jamás recibirían clics — forzar aquí corrige UX.
           */
          style: {
            ...node.style,
            pointerEvents: "all" as const,
            boxShadow: levelTheme.nodeBoxShadow,
          },
          data: {
            ...node.data,
            orgNode: orgNodeForView,
            directReportsTotal,
            isExpanded,
            hasChildren,
            hasDeferredTeam,
            showMapExpand,
            showTeamPageNavigate,
            loadingChildren,
            isCanvasRoot,
            internalTeamMembers,
            visualLevel,
            renderMode: nodeRenderMode,
            onToggleExpand: handleToggleExpand,
            onOpenDetail: handleOpenDetail,
            onExploreTeam,
          },
        };
      }),
    [
      expandedHubNodeId,
      graph.nodes,
      handleOpenDetail,
      handleToggleExpand,
      layoutRoot.id,
      loadingChildrenNodeId,
      nodeById,
      onExploreTeam,
      showRootChildren,
    ],
  );

  const edgesWithStyle = useMemo(
    () =>
      graph.edges.map((edge) => {
        const targetNode = graph.nodes.find((n) => n.id === edge.target);
        const targetData = targetNode?.data as OrgMapNodeData | undefined;
        const layoutDepth = targetData?.mapLayoutDepth ?? 0;
        const org = targetData?.orgNode;
        const full = org ? nodeById.get(edge.target) : undefined;
        const { tokens: t } = resolveOrgMapTheme(full ?? org, layoutDepth);
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: t.edgeStroke,
            strokeWidth: 1.6,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: t.edgeMarker,
          },
        };
      }),
    [graph.edges, graph.nodes, nodeById],
  );

  const shellClass =
    variant === "fullscreen"
      ? "org-map-shell org-map-shell--fullscreen flex h-full min-h-0 flex-1 flex-col"
      : "org-map-shell";

  const radarLevel = useMemo(
    () => resolveOrgMapVisualLevel(root, 0),
    [root],
  );

  useEffect(() => {
    reportMetrics("org-map-view", {
      visibleNodeCount: graph.nodes.length,
      directReportsCount:
        root.direct_reports_count ?? root.children.length ?? 0,
    });
    return () => {
      reportMetrics("org-map-view", {
        visibleNodeCount: 0,
        directReportsCount: 0,
      });
    };
  }, [
    graph.nodes.length,
    reportMetrics,
    root.children.length,
    root.direct_reports_count,
  ]);

  return (
    <div className={shellClass}>
      {/* Capa degradada casi neutra → cyan apenas visible (sin blur agresivo) */}
      <div className="org-map-shell__atmosphere" aria-hidden />
      {/* Bisel vidrio frío: el canvas oscuro queda físicamente “dentro” de la mesa */}
      <div className="org-map-shell__bezel">
        <div className="org-map-shell__surface">
          {showBackButton && onBack && (
            <div
              className={[
                "pointer-events-none absolute left-4 top-4 z-30 flex items-start",
                "transition-all duration-500 ease-out delay-300",
                mapReady
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={onBack}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-[#020617]/72 px-3 py-2 text-xs font-bold tracking-wide text-cyan-50/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-cyan-200/35 hover:bg-cyan-400/10 hover:text-white"
              >
                <span className="text-sm" aria-hidden>
                  ←
                </span>
                Volver
              </button>
            </div>
          )}
          <section
            className="relative h-full min-h-0 w-full overflow-visible bg-[#020617]"
            aria-label="Mapa del organigrama"
          >
            <div ref={mapMeasureRef} className="relative h-full min-h-0 w-full">
              {/*
        Capa decorativa detrás del canvas: pointer-events-none para no robar eventos al pane.
        Aquí SÍ podríamos aplicar perspectiva/rotación (solo estética), pero evitamos inclinar
        el plano del mapa para que el grid no compita visualmente con edges rectas. En su lugar,
        grid ortogonal + trama diagonal suave (sin tocar .react-flow__viewport).
      */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden
              >
                {/* Gradiente radial superior */}
                <div
                  className="
            org-map-decor-glow
            absolute
            left-[-10%]
            top-[-20%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
                />

                {/* Glow inferior */}
                <div
                  className="
                    org-map-decor-glow
                    absolute
                    bottom-[-30%]
                    right-[-10%]
                    h-[600px]
                    w-[600px]
                    rounded-full
                    bg-blue-600/10
                    blur-3xl
                  "
                />
                {!liteMode ? <RadarBackground level={radarLevel} /> : null}
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
                    backgroundSize: "80px 80px",
                  }}
                />

                {/*
          Trama diagonal solo visual: sugiere profundidad sin transformar el viewport.
          Se dibuja encima del grid ortogonal con opacidad baja.
        */}
                <div
                  className="absolute inset-0 opacity-[0.045] mix-blend-screen"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
              -32deg,
              transparent,
              transparent 38px,
              rgba(34, 211, 238, 0.35) 38px,
              rgba(34, 211, 238, 0.35) 39px
            )`,
                  }}
                />
              </div>

              {/*
        org-map-flow: anclas para estilos en index.css (nodos, NUNCA .react-flow__viewport).
        El canvas permanece 2D: pan/zoom siguen siendo la única transformación del viewport.
      */}
              <OrgMapSelectionProvider selectedPersonId={selectedPersonId}>
              <ReactFlow
                className={[
                  "org-map-flow relative z-1 h-full w-full",
                  liteMode ? "org-map-flow--lite" : "",
                  "transition-opacity duration-700 ease-out",
                  mapReady ? "opacity-100" : "opacity-0",
                ].join(" ")}
                proOptions={{ hideAttribution: true }}
                onlyRenderVisibleElements
                {...(persistedMapState?.viewport
                  ? { defaultViewport: persistedMapState.viewport }
                  : {})}
                nodes={baseInteractiveNodes}
                edges={edgesWithStyle}
                nodeTypes={nodeTypes}
                minZoom={0.25}
                maxZoom={1.4}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
              >
                <OrgMapInitialCenter
                  nodesKey={expansionStateKey}
                  enabled={cameraNonce === 0 && !hasPersistedViewport}
                />
                {onPersistedMapStateChange ? (
                  <OrgMapViewportPersistence
                    persistedViewport={persistedMapState?.viewport ?? null}
                    layoutKey={expansionStateKey}
                    expansionPatch={{ showRootChildren, expandedHubNodeId }}
                    onPersistedMapStateChange={onPersistedMapStateChange}
                    lastViewportRef={lastViewportRef}
                  />
                ) : null}
                <OrgMapViewCamera
                  cameraNonce={cameraNonce}
                  expansionStateKey={expansionStateKey}
                  cameraIntentRef={cameraIntentRef}
                  nodeByIdRef={nodeByIdRef}
                  layoutRootId={layoutRoot.id}
                />
              </ReactFlow>
              </OrgMapSelectionProvider>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
