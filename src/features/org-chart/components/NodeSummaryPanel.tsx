import { useEffect, useState } from 'react'
import type { OrgSummaryResponse } from '../types'
import { fetchOrgSummaryCached, getOrgSummaryFromCache } from '../services/orgSummaryCache'

type Props = {
  personId: string
  className?: string
}

function SummaryChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-cyan-200/70 transition-transform duration-300 ease-out"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {expanded ? (
        <path
          d="M6 14l6-6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 10l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function NodeSummaryPanel({ personId, className }: Props) {
  const [data, setData] = useState<OrgSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const cached = getOrgSummaryFromCache(personId)
    if (cached) {
      setData(cached)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    void fetchOrgSummaryCached(personId)
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null)
          setError(
            err instanceof Error ? err.message : 'Error al cargar resumen',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [personId])

  const shellClass = [
    'pointer-events-auto w-full max-w-md overflow-hidden rounded-xl border border-cyan-300/20 bg-[#020617]/88 shadow-[0_12px_40px_-12px_rgba(34,211,238,0.25)] backdrop-blur-xl',
    isExpanded ? 'max-h-[min(56vh,460px)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={shellClass} aria-label="Resumen jerárquico">
      {loading ? (
        <p className="px-4 py-6 text-center text-xs text-slate-400">
          Cargando resumen…
        </p>
      ) : error ? (
        <p
          className="px-4 py-6 text-center text-xs text-rose-300/90"
          role="alert"
        >
          {error}
        </p>
      ) : data ? (
        <>
          <button
            type="button"
            className="flex w-full cursor-pointer items-start gap-3 border-b border-cyan-300/15 px-4 py-3 text-left transition-colors hover:bg-cyan-300/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-400/50"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="node-summary-panel-details"
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
                Resumen General
              </h2>
              <p
                className="mt-1.5 truncate text-sm font-semibold text-slate-100"
                title={data.general.name}
              >
                {data.general.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-xs tabular-nums text-cyan-100/90">
                  {data.general.totalPeople}{' '}
                  <span className="text-slate-500">personas y plazas</span>
                </span>
                <span className="text-xs tabular-nums text-cyan-100/90">
                  {data.areas.length}{' '}
                  <span className="text-slate-500">
                    {data.areas.length === 1 ? 'equipo directo' : 'equipos directos'}
                  </span>
                </span>
              </div>
            </div>
            <SummaryChevron expanded={isExpanded} />
          </button>

          <div
            id="node-summary-panel-details"
            className={[
              'node-summary-panel__expandable',
              isExpanded ? 'node-summary-panel__expandable--open' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={!isExpanded}
          >
            <div className="node-summary-panel__expandable-inner">
              <div className="border-b border-cyan-300/10 px-4 py-3">
                {data.general.roleName ? (
                  <p
                    className="truncate text-[10px] text-slate-400/90"
                    title={data.general.roleName}
                  >
                    {data.general.roleName}
                  </p>
                ) : null}
                <div
                  className={[
                    'flex flex-wrap gap-x-4 gap-y-1',
                    data.general.roleName ? 'mt-2' : '',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-xs tabular-nums',
                      data.general.vacancies > 0
                        ? 'rounded-md border border-dashed border-slate-500/40 bg-slate-800/40 px-1.5 py-0.5 text-slate-200'
                        : 'text-slate-400',
                    ].join(' ')}
                  >
                    {data.general.vacancies}{' '}
                    <span className="text-slate-500">vacantes</span>
                  </span>
                </div>
              </div>

              {data.areas.length > 0 ? (
                <>
                  <div className="border-b border-cyan-300/15 px-4 py-2.5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/60">
                      Equipo directo
                    </h3>
                  </div>

                  <div className="max-h-[min(36vh,320px)] overflow-y-auto px-3 py-2">
                    <ul className="divide-y divide-cyan-300/10">
                      {data.areas.map((area) => (
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
                                ? 'text-slate-200'
                                : 'text-slate-400',
                            ].join(' ')}
                          >
                            {area.vacancies}{' '}
                            <span className="text-slate-500">vacantes</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="px-4 py-4 text-center text-xs text-slate-500">
                  No hay equipos asociados para este nivel.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
