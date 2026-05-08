import { useState } from 'react'
import type { OrgNode } from '../types'
import { OrgNodeCard } from './OrgNodeCard'

type Props = {
  root: OrgNode
  selectedPersonId: string | null
  onSelectNode: (id: string) => void
}

type BranchProps = {
  node: OrgNode
  depth: number
  selectedPersonId: string | null
  onSelectNode: (id: string) => void
}

/**
 * Rama recursiva: cada nodo con hijos mantiene su propio estado de expansión.
 * La selección para el panel lateral sube por `onSelectNode`.
 */
function OrgBranch({ node, depth, selectedPersonId, onSelectNode }: BranchProps) {
  const directCount = node.children.length
  const [expanded, setExpanded] = useState(depth < 1)

  return (
    <div className="flex flex-col gap-3">
      <OrgNodeCard
        node={node}
        emphasis={depth === 0 ? 'root' : 'default'}
        directReportsCount={directCount}
        childrenExpanded={expanded}
        selected={selectedPersonId === node.id}
        onSelectNode={onSelectNode}
        onToggleChildren={
          directCount > 0 ? () => setExpanded((prev) => !prev) : undefined
        }
      />

      {directCount > 0 && expanded ? (
        <ul
          className="ml-4 flex list-none flex-col gap-4 border-l border-slate-200 pl-4 sm:ml-6 sm:pl-6"
          role="group"
          aria-label={`Equipo directo de ${node.name}`}
        >
          {node.children.map((child) => (
            <li key={child.id}>
              <OrgBranch
                node={child}
                depth={depth + 1}
                selectedPersonId={selectedPersonId}
                onSelectNode={onSelectNode}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Contenedor del árbol: recibe selección desde la página para resaltar nodos. */
export function OrgChartView({
  root,
  selectedPersonId,
  onSelectNode,
}: Props) {
  return (
    <section
      className="h-full min-h-[280px] rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-8 shadow-sm sm:px-8"
      aria-label="Organigrama"
    >
      <OrgBranch
        node={root}
        depth={0}
        selectedPersonId={selectedPersonId}
        onSelectNode={onSelectNode}
      />
    </section>
  )
}
