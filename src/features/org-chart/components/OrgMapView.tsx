import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
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
export function OrgMapView({
  root,
  selectedPersonId,
  onSelectNode,
}: Props) {
  /**
   * Convertimos el árbol del backend en nodos y conexiones.
   * useMemo evita recalcular el mapa en cada render.
   */
  const graph = useMemo(() => buildOrgMap(root), [root]);

  const nodesWithSelection = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected:
          selectedPersonId != null && node.id === selectedPersonId,
      })),
    [graph.nodes, selectedPersonId],
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
      className="h-[680px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm"
      aria-label="Mapa del organigrama"
    >
      <ReactFlow
        nodes={nodesWithSelection}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.25}
        maxZoom={1.4}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        {/* Fondo tipo mapa técnico. */}
        <Background />

        {/* Controles de zoom. */}
        <Controls />

        {/* Mini mapa para navegación rápida. */}
        <MiniMap />
      </ReactFlow>
    </section>
  );
}
