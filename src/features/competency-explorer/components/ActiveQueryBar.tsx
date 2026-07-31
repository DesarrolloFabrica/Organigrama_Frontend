import type {
  CompetencyExplorerDomain,
  CompetencyExplorerQueryState,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  MatchMode,
  QuerySelectionSource,
} from '../types/competencyExplorer.types'
import {
  activeQueryPeopleLabel,
  matchModeLabel,
} from '../utils/personMatchPresentation'
import { isQueryEmpty } from '../utils/queryState'

type ChipKind = 'domain' | 'specialty' | 'skill'

type Props = {
  query: CompetencyExplorerQueryState
  domains: CompetencyExplorerDomain[]
  specialties: CompetencyExplorerSpecialty[]
  skills: CompetencyExplorerSkill[]
  matchMode?: MatchMode
  /** Personas del ranking; null si no hay criterios USER. */
  resultCount?: number | null
  onRemoveDomain: (code: string) => void
  onRemoveSpecialty: (code: string) => void
  onRemoveSkill: (code: string) => void
  onClear: () => void
}

export function ActiveQueryBar({
  query,
  domains,
  specialties,
  skills,
  matchMode,
  resultCount = null,
  onRemoveDomain,
  onRemoveSpecialty,
  onRemoveSkill,
  onClear,
}: Props) {
  const empty = isQueryEmpty(query)
  const domainMap = new Map(domains.map((d) => [d.code, d]))
  const specialtyMap = new Map(specialties.map((s) => [s.code, s]))
  const skillMap = new Map(skills.map((s) => [s.code, s]))
  const showRankingMeta = resultCount != null && matchMode

  if (empty) {
    return (
      <section
        aria-label="Consulta activa"
        className="rounded-xl border border-dashed border-slate-600/50 bg-[#06111f]/40 px-3.5 py-3"
      >
        <p className="text-sm font-medium text-slate-300">
          Consulta sin criterios
        </p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Las selecciones de dominio, especialidad y skill aparecerán aquí.
        </p>
      </section>
    )
  }

  const total =
    query.domains.length + query.specialties.length + query.skills.length

  return (
    <section
      aria-label="Consulta activa"
      className="rounded-xl border border-cyan-400/15 bg-[#06111f]/55 px-3.5 py-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-slate-200">
              Consulta activa
            </p>
            <p className="text-[11px] text-slate-500">
              {total} criterio{total === 1 ? '' : 's'}
            </p>
            {showRankingMeta ? (
              <p className="text-[11px] text-cyan-400/80">
                {matchModeLabel(matchMode)}
                {activeQueryPeopleLabel(resultCount) != null
                  ? ` · ${activeQueryPeopleLabel(resultCount)}`
                  : null}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {query.domains.map((sel) => {
              const domain = domainMap.get(sel.code)
              return (
                <CriterionChip
                  key={`domain-${sel.code}`}
                  kind="domain"
                  label={domain?.name ?? sel.code}
                  source={sel.source}
                  onRemove={() => onRemoveDomain(sel.code)}
                />
              )
            })}
            {query.specialties.map((sel) => {
              const specialty = specialtyMap.get(sel.code)
              return (
                <CriterionChip
                  key={`specialty-${sel.code}`}
                  kind="specialty"
                  label={specialty?.name ?? sel.code}
                  source={sel.source}
                  onRemove={() => onRemoveSpecialty(sel.code)}
                />
              )
            })}
            {query.skills.map((sel) => {
              const skill = skillMap.get(sel.code)
              return (
                <CriterionChip
                  key={`skill-${sel.code}`}
                  kind="skill"
                  label={skill?.name ?? sel.code}
                  source={sel.source}
                  onRemove={() => onRemoveSkill(sel.code)}
                />
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-lg border border-slate-600/50 px-2.5 py-1.5 text-[12px] text-slate-300 outline-none transition-colors hover:border-slate-400/50 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        >
          Limpiar consulta
        </button>
      </div>
    </section>
  )
}

function CriterionChip({
  kind,
  label,
  source,
  onRemove,
}: {
  kind: ChipKind
  label: string
  source: QuerySelectionSource
  onRemove: () => void
}) {
  const kindLabel =
    kind === 'domain' ? 'Dominio' : kind === 'specialty' ? 'Especialidad' : 'Skill'

  return (
    <span
      className={
        source === 'CONTEXT'
          ? 'inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-600/45 bg-slate-950/40 py-1 pl-2 pr-1 text-[12px] text-slate-300'
          : 'inline-flex max-w-full items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-950/35 py-1 pl-2 pr-1 text-[12px] text-cyan-50'
      }
    >
      <span className="min-w-0 truncate">
        <span className="mr-1 text-[10px] uppercase tracking-wide text-slate-500">
          {kindLabel}
          {source === 'CONTEXT' ? ' · ctx' : ''}
        </span>
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-0.5 text-slate-400 outline-none hover:bg-slate-800/80 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        aria-label={`Quitar ${kindLabel.toLowerCase()} ${label}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  )
}
