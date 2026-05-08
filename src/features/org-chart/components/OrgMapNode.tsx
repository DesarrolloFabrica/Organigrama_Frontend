import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'

import { formatRoleLabel } from '../types'
import type { OrgMapNodeData } from '../utils/orgMapLayout'

export function OrgMapNode({
  data,
  selected,
}: NodeProps) {
  const typedData = data as OrgMapNodeData

  const node = typedData.orgNode
  const directReportsCount = node.children.length

  return (
    <article
      className={`min-w-[260px] rounded-2xl border bg-white px-4 py-3 shadow-lg transition ${
        selected
          ? 'border-sky-400 ring-2 ring-sky-300'
          : 'border-slate-200 hover:border-sky-200'
      }`}
    >
      <Handle type="target" position={Position.Top} />

      <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
        {node.hierarchy?.name ?? 'Nivel sin asignar'}
      </p>

      <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-950">
        {node.name}
      </h3>

      <p className="mt-1 text-xs font-medium text-slate-600">
        {formatRoleLabel(node)}
      </p>

      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {directReportsCount > 0 ? (
          <>
            <span className="font-semibold text-slate-900">
              {directReportsCount}
            </span>{' '}
            reportes directos
          </>
        ) : (
          'Sin reportes directos'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </article>
  )
}