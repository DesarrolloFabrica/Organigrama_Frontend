import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

import { formatRoleLabel } from "../types";
import type { OrgMapNodeData } from "../utils/orgMapLayout";

export function OrgMapNode({ data, selected }: NodeProps) {
  const typedData = data as OrgMapNodeData;

  const node = typedData.orgNode;
  const directReportsCount = node.children.length;

  return (
    <article
      className={`org-map-node relative min-w-[280px] overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur transition ${
        selected
          ? "org-map-node--selected border-cyan-300/80 bg-cyan-50 text-slate-950 ring-2 ring-cyan-300/40"
          : "border-white/10 bg-white/[0.92] text-slate-950 hover:border-cyan-300/60"
      }`}
    >
      {/*
        Banda de brillo simula borde superior iluminado (volumen) sin usar rotate en el nodo
        completo: los Handle siguen alineados con el layout que calcula React Flow.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent" />

      {/* Borde inferior tenue: sensación de plano apoyado sin salir del overflow del nodo. */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-900/15 to-transparent"
        aria-hidden
      />

      <Handle type="target" position={Position.Top} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">
            {node.hierarchy?.name ?? "Nivel sin asignar"}
          </p>

          <h3 className="mt-1 max-w-[220px] text-sm font-bold leading-snug text-slate-950">
            {node.name}
          </h3>

          <p className="mt-1 max-w-[220px] text-xs font-semibold text-slate-600">
            {formatRoleLabel(node)}
          </p>
        </div>

        <div className="grid size-9 place-items-center rounded-xl border border-cyan-200 bg-cyan-50 text-xs font-black text-cyan-700 shadow-inner">
          {directReportsCount}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/90 px-3 py-2 text-[11px] font-semibold text-slate-600">
        <span>
          {directReportsCount > 0 ? "Reportes directos" : "Sin reportes"}
        </span>
        <span className="text-slate-950">{directReportsCount}</span>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </article>
  );
}
