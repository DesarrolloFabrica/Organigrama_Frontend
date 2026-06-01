import type { GeneralAreaSummary } from '../types'

type Props = {
  items: GeneralAreaSummary[]
  loading?: boolean
  error?: string | null
}

/**
 * Bloque complementario: totales por área general bajo el root del organigrama.
 */
export function GeneralAreasSummary({ items, loading, error }: Props) {
  return (
    <section
      className="pointer-events-auto max-h-[min(42vh,320px)] w-full max-w-md overflow-hidden rounded-xl border border-cyan-300/20 bg-[#020617]/88 shadow-[0_12px_40px_-12px_rgba(34,211,238,0.25)] backdrop-blur-xl"
      aria-label="Resumen por áreas generales"
    >
      <header className="border-b border-cyan-300/15 px-4 py-3">
        <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
          Resumen por áreas generales
        </h2>
      </header>

      <div className="overflow-y-auto px-3 py-2">
        {loading ? (
          <p className="px-1 py-4 text-center text-xs text-slate-400">
            Cargando resumen…
          </p>
        ) : error ? (
          <p className="px-1 py-4 text-center text-xs text-rose-300/90" role="alert">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="px-1 py-4 text-center text-xs text-slate-500">
            Sin áreas generales registradas.
          </p>
        ) : (
          <ul className="divide-y divide-cyan-300/10">
            {items.map((area) => (
              <li
                key={area.id}
                className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-3 gap-y-0.5 py-2.5 first:pt-1 last:pb-1"
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium text-slate-100"
                    title={area.name}
                  >
                    {area.name}
                  </p>
                  {area.roleName ? (
                    <p
                      className="truncate text-[10px] text-slate-400/90"
                      title={area.roleName}
                    >
                      {area.roleName}
                    </p>
                  ) : null}
                </div>
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-cyan-100/90">
                  {area.totalPeople}{' '}
                  <span className="text-slate-500">pers. y plazas</span>
                </span>
                <span
                  className={[
                    'whitespace-nowrap text-right text-xs tabular-nums',
                    area.vacancies > 0
                      ? 'rounded border border-dashed border-slate-500/35 px-1 text-slate-200'
                      : 'text-slate-400',
                  ].join(' ')}
                >
                  {area.vacancies}{' '}
                  <span className="text-slate-500">vacantes</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
