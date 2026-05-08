import { useMemo } from "react";
import {
  Controls,
  MiniMap,
  ReactFlow,
  MarkerType,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { OrgNode } from "../types";
import { OrgMapNode } from "./OrgMapNode";
import { buildOrgMap } from "../utils/orgMapLayout";

type Props = {
  root: OrgNode;
  selectedPersonId: string | null;
  onSelectNode: (id: string) => void;
};

/**
 * Tipos de nodos personalizados disponibles para React Flow.
 */
const nodeTypes = {
  orgNode: OrgMapNode,
};

/**
 * Vista tipo mapa para el organigrama.
 * Maneja zoom, paneo, minimapa y selección de nodos.
 */
export function OrgMapView({ root, selectedPersonId, onSelectNode }: Props) {
  /**
   * Convertimos el árbol del backend en nodos y conexiones.
   * useMemo evita recalcular el mapa en cada render.
   */
  const graph = useMemo(() => buildOrgMap(root), [root]);

  const nodesWithSelection = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected: selectedPersonId != null && node.id === selectedPersonId,
      })),
    [graph.nodes, selectedPersonId],
  );

  const edgesWithStyle = useMemo(
    () =>
      graph.edges.map((edge) => ({
        ...edge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "rgba(34, 211, 238, 0.55)",
        },
      })),
    [graph.edges],
  );

  /**
   * Cuando el usuario hace click en un nodo,
   * subimos el id a la página principal para abrir el panel lateral.
   */
  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onSelectNode(node.id);
  };

  return (
    <section
      className="
        relative
        h-[760px]
        overflow-hidden
        rounded-[32px]
        border
        border-cyan-400/10
        bg-[#020617]
        shadow-[0_0_80px_rgba(6,182,212,0.08)]
      "
      aria-label="Mapa del organigrama"
    >
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
        className="org-map-flow relative z-[1] h-full w-full"
        proOptions={{ hideAttribution: true }}
        nodes={nodesWithSelection}
        edges={edgesWithStyle}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.25}
        maxZoom={1.4}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        {/* Controles de zoom. */}
        <Controls />

        {/* Mini mapa para navegación rápida. */}
        <MiniMap />
      </ReactFlow>
    </section>
  );
}
