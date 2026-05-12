import type { MutableRefObject, ReactElement } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controls, ReactFlow, MarkerType, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { OrgNode } from "../types";
import { OrgMapMiniMap } from "./OrgMapMiniMap";
import { OrgMapNode } from "./OrgMapNode";
import { buildVisibleSubtree } from "../utils/buildVisibleSubtree";
import { buildOrgMap, type OrgMapNodeData } from "../utils/orgMapLayout";
import {
  getOrgMapLevelTheme,
  resolveOrgMapVisualLevel,
} from "../utils/orgMapLevelTheme";
import { truncateTreeToMaxLevels } from "../utils/truncateOrgTreeLevels";
import { RadarBackground } from "./RadarBackground";

type Props = {
  root: OrgNode;
  selectedPersonId: string | null;
  onSelectNode: (id: string) => void;
  /** Marco pedestal reducido; lienzo útil casi a pantalla completa. */
  variant?: "default" | "fullscreen";
  /** Panel de ficha abierto en escritorio: desplaza minimapa para no solaparse. */
  detailDrawerOpen?: boolean;
  /**
   * Si se define, el mapa y el minimapa no incluyen nodos por debajo de este número
   * de niveles (la raíz cuenta como nivel 1). En el límite se ofrece exploración profunda.
   */
  maxRenderLevels?: number;
  /**
   * Si la fila 2 (reportes directos de la raíz del lienzo) debe mostrarse en el grafo al inicio.
   * Suborganigramas: `true` (recomendado). Vista principal: `false` para empezar sólo con la raíz.
   */
  initialShowRootChildren?: boolean;
  /** Navegación a la vista de equipo centrada en la persona. */
  onExploreTeam?: (nodeId: string) => void;
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
        const expandRow2OnCanvas = parentId === layoutRootId;
        if (expandRow2OnCanvas) {
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
          rootFull && rootFull.children.length > 0
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

/**
 * Centrado inicial del viewport según el bounding box de los nodos (sin `fitView`).
 * Debe vivir dentro de `<ReactFlow>` para `useReactFlow`. No afecta al radar ni capas externas.
 */
function OrgMapInitialCenter({
  nodesKey,
  enabled,
}: {
  nodesKey: string;
  enabled: boolean;
}) {
  const { getNodes, setViewport } = useReactFlow();

  useEffect(() => {
    if (!enabled) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const nodes = getNodes();
        if (nodes.length === 0) return;

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
          const x1 = left;
          const y1 = top;
          const x2 = left + w;
          const y2 = top + h;
          minX = Math.min(minX, x1);
          minY = Math.min(minY, y1);
          maxX = Math.max(maxX, x2);
          maxY = Math.max(maxY, y2);
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const container = document.querySelector(".org-map-flow");
        if (!(container instanceof HTMLElement)) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width <= 0 || height <= 0) return;

        const zoom = INITIAL_CENTER_ZOOM;
        const x = width / 2 - centerX * zoom + INITIAL_CENTER_VISUAL_OFFSET_X;
        const y = height / 2 - centerY * zoom + INITIAL_CENTER_VISUAL_OFFSET_Y;

        setViewport({ x, y, zoom }, { duration: 0 });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
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
 * Canvas = subárbol explorado; el resumen completo del minimapa custom vive en `OrgMapMiniMap`.
 *
 * Expansión del **hub interno** (fila 2): un único `expandedHubNodeId`; al expandir otro, el anterior se cierra.
 */
export function OrgMapView({
  root,
  selectedPersonId,
  onSelectNode,
  variant = "default",
  detailDrawerOpen = false,
  maxRenderLevels,
  initialShowRootChildren = false,
  onExploreTeam,
}: Props): ReactElement {
  const [showRootChildren, setShowRootChildren] = useState(false);
  /** A lo sumo un nodo de fila 2 con panel de equipo interno abierto. */
  const [expandedHubNodeId, setExpandedHubNodeId] = useState<string | null>(
    null,
  );

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

  const expandedHubForFullRoot = useMemo(() => {
    if (!expandedHubNodeId) return null;
    return root.children.some((c) => c.id === expandedHubNodeId)
      ? expandedHubNodeId
      : null;
  }, [expandedHubNodeId, root]);

  const graph = useMemo(
    () =>
      buildOrgMap(layoutRoot, {
        expandedHubNodeId: expandedHubForLayout,
        viewportWidth: mapViewportWidth,
      }),
    [expandedHubForLayout, layoutRoot, mapViewportWidth],
  );

  /**
   * Minimapa: con límite de profundidad refleja el mismo grafo que el lienzo (rendimiento).
   * Sin límite, conserva el resumen del organigrama completo.
   */
  const fullGraph = useMemo(() => {
    if (maxRenderLevels != null) {
      return graph;
    }
    return buildOrgMap(root, {
      expandedHubNodeId: expandedHubForFullRoot,
      viewportWidth: mapViewportWidth,
    });
  }, [graph, maxRenderLevels, root, expandedHubForFullRoot, mapViewportWidth]);

  const visibleNodeIds = useMemo(
    () => new Set(graph.nodes.map((n) => n.id)),
    [graph.nodes],
  );

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      const fullNode = nodeById.get(nodeId);
      if (!fullNode) return;

      const isCanvasRoot = nodeId === root.id;

      if (isCanvasRoot) {
        const willShowRow2 = !showRootChildren;
        cameraIntentRef.current = { parentId: nodeId, expanded: willShowRow2 };
        setCameraNonce((n) => n + 1);
        setShowRootChildren(willShowRow2);
        if (!willShowRow2) {
          setExpandedHubNodeId(null);
        }
        return;
      }

      const openingHub = expandedHubNodeId !== nodeId;
      cameraIntentRef.current = { parentId: nodeId, expanded: openingHub };
      setCameraNonce((n) => n + 1);
      setExpandedHubNodeId(openingHub ? nodeId : null);
    },
    [expandedHubNodeId, nodeById, root.id, showRootChildren],
  );

  /** Sólo abre el panel lateral; no confundir con expandir ramas del mapa. */
  const handleOpenDetail = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);
    },
    [onSelectNode],
  );

  const nodesWithSelection = useMemo(
    () =>
      graph.nodes.map((node) => {
        const full = nodeById.get(node.id);
        const directReportsTotal = full?.children.length ?? 0;
        const isCanvasRoot = node.id === layoutRoot.id;
        const isExpanded = isCanvasRoot
          ? showRootChildren
          : expandedHubNodeId === node.id;
        const layoutOrg = node.data.orgNode;
        const layoutDepth = node.data.mapLayoutDepth ?? 0;
        const visualLevel = resolveOrgMapVisualLevel(
          full ?? layoutOrg,
          layoutDepth,
        );
        const levelTheme = getOrgMapLevelTheme(visualLevel);
        const hasDeferredTeam = Boolean(layoutOrg.deferred_team);
        const showMapExpand = directReportsTotal > 0 && !hasDeferredTeam;
        const internalTeamMembers =
          expandedHubNodeId === node.id && !isCanvasRoot && full
            ? full.children
            : [];

        return {
          ...node,
          /**
           * Con `elementsSelectable={false}`, React Flow aplicaría pointer-events:none al wrapper
           * del nodo y los botones interiores jamás recibirían clics — forzar aquí corrige UX.
           */
          style: {
            ...node.style,
            pointerEvents: "all" as const,
            filter: levelTheme.nodeDropShadow,
          },
          selected: selectedPersonId != null && node.id === selectedPersonId,
          data: {
            ...node.data,
            directReportsTotal,
            isExpanded,
            hasChildren: directReportsTotal > 0,
            hasDeferredTeam,
            showMapExpand,
            isCanvasRoot,
            internalTeamMembers,
            visualLevel,
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
      nodeById,
      onExploreTeam,
      selectedPersonId,
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
        const level = resolveOrgMapVisualLevel(full ?? org, layoutDepth);
        const t = getOrgMapLevelTheme(level);
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

  return (
    <div className={shellClass}>
      {/* Capa degradada casi neutra → cyan apenas visible (sin blur agresivo) */}
      <div className="org-map-shell__atmosphere" aria-hidden />
      {/* Bisel vidrio frío: el canvas oscuro queda físicamente “dentro” de la mesa */}
      <div className="org-map-shell__bezel">
        <div className="org-map-shell__surface">
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
                <RadarBackground />

                {/* Grid ortogonal (plano lógico alineado con el pan/zoom de React Flow). */}
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
              <ReactFlow
                className="org-map-flow relative z-1 h-full w-full"
                proOptions={{ hideAttribution: true }}
                nodes={nodesWithSelection}
                edges={edgesWithStyle}
                nodeTypes={nodeTypes}
                minZoom={0.25}
                maxZoom={1.4}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
              >
                <Controls />
                <OrgMapInitialCenter
                  nodesKey={expansionStateKey}
                  enabled={cameraNonce === 0}
                />
                <OrgMapViewCamera
                  cameraNonce={cameraNonce}
                  expansionStateKey={expansionStateKey}
                  cameraIntentRef={cameraIntentRef}
                  nodeByIdRef={nodeByIdRef}
                  layoutRootId={layoutRoot.id}
                />
              </ReactFlow>

              <OrgMapMiniMap
                fullGraph={fullGraph}
                visibleNodeIds={visibleNodeIds}
                selectedPersonId={selectedPersonId}
                detailDrawerOpen={detailDrawerOpen}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
