import type {
  CompetencyExplorerDomain,
  CompetencyExplorerStats,
} from '../types/competencyExplorer.types'
import { DomainPreviewCard } from './DomainPreviewCard'
import { ExplorerStats } from './ExplorerStats'

type Props = {
  stats: CompetencyExplorerStats
  domains: CompetencyExplorerDomain[]
  onSelectDomain: (code: string) => void
}

/** Área principal cuando no hay criterios de consulta activos. */
export function ExplorerInitialState({
  stats,
  domains,
  onSelectDomain,
}: Props) {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
          Explore el conocimiento de la organización
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          Seleccione un dominio o busque directamente una skill para comenzar.
        </p>
      </div>

      <ExplorerStats stats={stats} />

      <section aria-labelledby="featured-domains-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            id="featured-domains-heading"
            className="text-sm font-medium text-slate-200"
          >
            Dominios
          </h3>
          <p className="text-[11px] text-slate-500">
            Navegue por áreas de conocimiento
          </p>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain) => (
            <li key={domain.code}>
              <DomainPreviewCard
                domain={domain}
                onExplore={onSelectDomain}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
