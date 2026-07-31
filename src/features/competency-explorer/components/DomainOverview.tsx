import type {
  CompetencyExplorerDomain,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'
import { hasSelection } from '../utils/queryState'
import type { CompetencyExplorerSelection } from '../types/competencyExplorer.types'

type Props = {
  domains: CompetencyExplorerDomain[]
  specialties: CompetencyExplorerSpecialty[]
  selectedSpecialtyCodes: CompetencyExplorerSelection[]
  onToggleSpecialty: (code: string) => void
}

/** Vista exploratoria cuando hay dominios y aún no hay skills. */
export function DomainOverview({
  domains,
  specialties,
  selectedSpecialtyCodes,
  onToggleSpecialty,
}: Props) {
  const peopleEstimate = domains.reduce((sum, d) => sum + d.peopleCount, 0)
  const specialtyCount = specialties.length

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
          {domains.length === 1
            ? domains[0].name
            : `${domains.length} dominios seleccionados`}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          {domains.length === 1
            ? domains[0].description
            : 'Explore las especialidades de los dominios seleccionados o continúe afinando la consulta.'}
        </p>
        <p className="text-[12px] text-slate-500">
          <span className="tabular-nums text-slate-300">{peopleEstimate}</span>{' '}
          personas relacionadas ·{' '}
          <span className="tabular-nums text-slate-300">{specialtyCount}</span>{' '}
          especialidades
        </p>
      </div>

      <section aria-labelledby="domain-overview-specialties" className="space-y-3">
        <h3
          id="domain-overview-specialties"
          className="text-sm font-medium text-slate-200"
        >
          Especialidades
        </h3>
        {specialties.length === 0 ? (
          <p className="text-sm text-slate-500" role="status">
            No hay especialidades para los dominios seleccionados.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {specialties.map((specialty) => {
              const selected = hasSelection(
                selectedSpecialtyCodes,
                specialty.code,
              )
              return (
                <li key={specialty.code}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleSpecialty(specialty.code)}
                    className={
                      selected
                        ? 'flex w-full flex-col rounded-xl border border-cyan-300/40 bg-cyan-950/35 p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50'
                        : 'flex w-full flex-col rounded-xl border border-cyan-400/12 bg-[#06111f]/55 p-3.5 text-left outline-none transition-colors hover:border-cyan-300/30 hover:bg-cyan-950/20 focus-visible:ring-2 focus-visible:ring-cyan-300/50'
                    }
                  >
                    <span className="text-sm font-medium text-slate-100">
                      {specialty.name}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[12px] text-slate-400">
                      {specialty.description}
                    </span>
                    <span className="mt-2 text-[11px] text-slate-500">
                      <span className="tabular-nums text-slate-300">
                        {specialty.skillCount}
                      </span>{' '}
                      skills ·{' '}
                      <span className="tabular-nums text-slate-300">
                        {specialty.peopleCount}
                      </span>{' '}
                      personas
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
