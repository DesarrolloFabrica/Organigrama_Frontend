import { useId, useMemo } from "react";

import type { OrgMapGraph } from "../utils/orgMapLayout";

type Props = {
  /** Grafo del árbol COMPLETO (`buildOrgMap(root)`), independiente del subárbol explorado. */
  fullGraph: OrgMapGraph;
  /** Ids presentes en el canvas principal en este momento (grafo visible/expandido). */
  visibleNodeIds: ReadonlySet<string>;
  selectedPersonId: string | null;
  /** Drawer de ficha abierto (escritorio): evita solapar el resumen en la esquina. */
  detailDrawerOpen?: boolean;
};

/**
 * Radio aproximado del nodo en coords de layout; alineado con `OrgMapNode` (módulo holográfico).
 */
const LAYOUT_NODE_WIDTH = 300;
const LAYOUT_NODE_HEIGHT = 192;

const PAD = 10;

/**
 * MiniMap propio: React Flow `MiniMap` sólo pinta lo que hay en el store del canvas; no admite
 * un segundo juego de nodos. Aquí pintamos siempre el organigrama completo como puntos, mientras
 * el canvas sigue mostrando expansión progresiva.
 */
export function OrgMapMiniMap({
  fullGraph,
  visibleNodeIds,
  selectedPersonId,
  detailDrawerOpen = false,
}: Props) {
  const glowFilterId = useId().replace(/:/g, "");

  const { positions, edgeList } = useMemo(() => {
    const { nodes, edges } = fullGraph;
    const positionsOut = new Map<string, { mx: number; my: number }>();

    if (nodes.length === 0) {
      return { positions: positionsOut, edgeList: edges };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const centers = new Map<string, { cx: number; cy: number }>();
    const halfW = LAYOUT_NODE_WIDTH / 2;
    for (const n of nodes) {
      /** Misma convención que `buildOrgMap` + `origin: [0.5, 0]`: x = centro, y = borde superior. */
      const cx = n.position.x;
      const top = n.position.y;
      const x1 = cx - halfW;
      const x2 = cx + halfW;
      const y1 = top;
      const y2 = top + LAYOUT_NODE_HEIGHT;
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
      centers.set(n.id, {
        cx,
        cy: top + LAYOUT_NODE_HEIGHT / 2,
      });
    }

    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);

    const innerW = 200 - 2 * PAD;
    const innerH = 136 - 2 * PAD;

    const s = Math.min(innerW / bw, innerH / bh);
    const ox = PAD + (innerW - bw * s) / 2 - minX * s;
    const oy = PAD + (innerH - bh * s) / 2 - minY * s;

    for (const [id, c] of centers) {
      positionsOut.set(id, {
        mx: ox + c.cx * s,
        my: oy + c.cy * s,
      });
    }

    return { positions: positionsOut, edgeList: edges };
  }, [fullGraph]);

  const stackedNodes = useMemo(() => {
    const cat = (id: string) => {
      if (selectedPersonId === id) return 2;
      if (visibleNodeIds.has(id)) return 1;
      return 0;
    };
    return [...fullGraph.nodes].sort((a, b) => cat(a.id) - cat(b.id));
  }, [fullGraph.nodes, visibleNodeIds, selectedPersonId]);

  return (
    <div
      className={[
        "pointer-events-none absolute bottom-4 z-20 overflow-hidden rounded-xl",
        detailDrawerOpen
          ? "right-4 max-sm:right-4 sm:right-[calc(1rem+420px+0.75rem)]"
          : "right-4",
      ].join(" ")}
      style={{
        width: 200,
        height: 136,
        background: "rgba(2, 6, 23, 0.82)",
        border: "1px solid rgba(34, 211, 238, 0.18)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
      }}
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 136"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter
            id={glowFilterId}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Conexiones del organigrama completo (líneas muy suaves). */}
        {edgeList.map((edge) => {
          const a = positions.get(edge.source);
          const b = positions.get(edge.target);
          if (!a || !b) return null;
          return (
            <line
              key={edge.id}
              x1={a.mx}
              y1={a.my}
              x2={b.mx}
              y2={b.my}
              stroke="rgba(100, 116, 139, 0.4)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Puntos por nodo: visibles vs resto vs seleccionado */}
        {stackedNodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;

          const isSelected = selectedPersonId === n.id;
          const isVisible = visibleNodeIds.has(n.id);

          if (isSelected) {
            return (
              <circle
                key={n.id}
                cx={p.mx}
                cy={p.my}
                r={5}
                fill="rgba(255,255,255,0.95)"
                stroke="rgba(34, 211, 238, 0.95)"
                strokeWidth={1.5}
                filter={`url(#${glowFilterId})`}
              />
            );
          }

          if (isVisible) {
            return (
              <circle
                key={n.id}
                cx={p.mx}
                cy={p.my}
                r={3.2}
                fill="rgba(34, 211, 238, 0.9)"
              />
            );
          }

          return (
            <circle
              key={n.id}
              cx={p.mx}
              cy={p.my}
              r={2.4}
              fill="rgba(148, 163, 184, 0.72)"
            />
          );
        })}
      </svg>
    </div>
  );
}
