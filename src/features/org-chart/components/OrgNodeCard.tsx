import { formatRoleLabel, type OrgNode } from '../types'

type Props = {
  node: OrgNode
  emphasis?: 'root' | 'default'
  directReportsCount: number
  childrenExpanded: boolean
  /** Muestra u oculta la lista de hijos en el árbol (no abre el panel). */
  onToggleChildren?: () => void
  /** Selecciona la persona y abre el panel lateral. */
  onSelectNode: (id: string) => void
  selected: boolean
}

/**
 * Tarjeta de nodo: clic principal → selección; botón aparte → expandir/colapsar hijos.
 */
export function OrgNodeCard({
  node,
  emphasis = 'default',
  directReportsCount,
  childrenExpanded,
  onToggleChildren,
  onSelectNode,
  selected,
}: Props) {
  const hasChildren = directReportsCount > 0

  const emphasisRing =
    emphasis === 'root'
      ? 'ring-2 ring-sky-400/50'
      : ''

  const selectedRing = selected
    ? 'ring-2 ring-sky-600 ring-offset-2 ring-offset-white'
    : ''

  return (
    <article
      className={`w-full max-w-md rounded-xl border border-slate-200/90 bg-white text-left shadow-sm shadow-slate-900/5 transition ${emphasisRing} ${selectedRing} ${
        selected ? 'border-sky-300' : 'hover:border-sky-200 hover:shadow-md'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer px-5 pb-3 pt-4 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        onClick={() => onSelectNode(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelectNode(node.id)
          }
        }}
      >
        <header className="border-b border-slate-100 pb-2">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            {node.name}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-sky-800">
            {formatRoleLabel(node)}
          </p>
        </header>

        <p className="mt-3 text-sm text-slate-600">
          {hasChildren ? (
            <>
              Tiene{' '}
              <span className="font-semibold text-slate-800">
                {directReportsCount}
              </span>{' '}
              {directReportsCount === 1
                ? 'reporte directo'
                : 'reportes directos'}
            </>
          ) : (
            <span className="text-slate-500">Sin reportes directos</span>
          )}
        </p>
      </div>

      {hasChildren && onToggleChildren ? (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation()
              onToggleChildren()
            }}
            aria-expanded={childrenExpanded}
          >
            <span aria-hidden>{childrenExpanded ? '▼' : '▶'}</span>
            {childrenExpanded ? 'Ocultar equipo directo' : 'Mostrar equipo directo'}
          </button>
        </div>
      ) : null}
    </article>
  )
}
