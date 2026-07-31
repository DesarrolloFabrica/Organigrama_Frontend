import type {
  CompetencyExplorerDomain,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  MatchMode,
  PersonMatchResult,
  PersonSortMode,
  RestrictiveCriterion,
} from '../types/competencyExplorer.types'
import {
  matchModeLabel,
  rankingCriteriaComposition,
  rankingSummaryText,
} from '../utils/personMatchPresentation'
import { NoPeopleResults } from './NoPeopleResults'
import { PersonMatchCard } from './PersonMatchCard'

export type PeopleRankingProps = {
  results: PersonMatchResult[]
  domainCount: number
  specialtyCount: number
  skillCount: number
  matchMode: MatchMode
  sortMode: PersonSortMode
  onMatchModeChange: (mode: MatchMode) => void
  onSortModeChange: (mode: PersonSortMode) => void
  skillCatalog: CompetencyExplorerSkill[]
  specialtyCatalog: CompetencyExplorerSpecialty[]
  domainCatalog: CompetencyExplorerDomain[]
  restrictiveCriterion: RestrictiveCriterion | null
  onChangeToAny: () => void
  onRemoveCriterion: (criterion: RestrictiveCriterion) => void
}

const SORT_OPTIONS: { value: PersonSortMode; label: string }[] = [
  { value: 'MATCH', label: 'Mayor coincidencia' },
  { value: 'EVIDENCE_STRENGTH', label: 'Mayor evidencia' },
  { value: 'NAME', label: 'Nombre' },
]

export function PeopleRanking({
  results,
  domainCount,
  specialtyCount,
  skillCount,
  matchMode,
  sortMode,
  onMatchModeChange,
  onSortModeChange,
  skillCatalog,
  specialtyCatalog,
  domainCatalog,
  restrictiveCriterion,
  onChangeToAny,
  onRemoveCriterion,
}: PeopleRankingProps) {
  const counts = {
    domains: domainCount,
    specialties: specialtyCount,
    skills: skillCount,
  }
  const totalCriteria = domainCount + specialtyCount + skillCount
  const sortSelectId = 'competency-explorer-sort-mode'
  const composition = rankingCriteriaComposition(counts)

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
            Personas encontradas
          </h2>
          <p className="text-sm text-slate-400">
            {rankingSummaryText(results.length, counts)}
          </p>
          {composition ? (
            <p className="text-[12px] text-slate-500">{composition}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div
            role="group"
            aria-label="Modo de coincidencia"
            className="inline-flex rounded-lg border border-slate-600/50 p-0.5"
          >
            <MatchModeButton
              active={matchMode === 'ANY'}
              label="Coincidencia amplia"
              onClick={() => onMatchModeChange('ANY')}
            />
            <MatchModeButton
              active={matchMode === 'ALL'}
              label="Coincidencia exacta"
              onClick={() => onMatchModeChange('ALL')}
            />
          </div>

          <div className="flex min-w-[12rem] flex-col gap-1">
            <label
              htmlFor={sortSelectId}
              className="text-[11px] font-medium text-slate-500"
            >
              Ordenar por
            </label>
            <select
              id={sortSelectId}
              value={sortMode}
              onChange={(e) =>
                onSortModeChange(e.target.value as PersonSortMode)
              }
              className="rounded-lg border border-slate-600/50 bg-[#020617]/80 px-2.5 py-2 text-[13px] text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {matchModeLabel(matchMode)} · orden:{' '}
          {SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? sortMode}
        </p>
      </header>

      {results.length === 0 && totalCriteria > 0 ? (
        <NoPeopleResults
          matchMode={matchMode}
          restrictiveCriterion={restrictiveCriterion}
          domainCatalog={domainCatalog}
          specialtyCatalog={specialtyCatalog}
          skillCatalog={skillCatalog}
          onChangeToAny={onChangeToAny}
          onRemoveCriterion={onRemoveCriterion}
        />
      ) : (
        <ul className="space-y-3">
          {results.map((result) => (
            <li key={result.person.id}>
              <PersonMatchCard
                result={result}
                skillCatalog={skillCatalog}
                specialtyCatalog={specialtyCatalog}
                domainCatalog={domainCatalog}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MatchModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? 'rounded-md bg-cyan-950/60 px-3 py-1.5 text-[12px] font-medium text-cyan-50 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45'
          : 'rounded-md px-3 py-1.5 text-[12px] text-slate-400 outline-none hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-cyan-300/45'
      }
    >
      {label}
    </button>
  )
}
