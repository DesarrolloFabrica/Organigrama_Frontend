import type {
  CompetencyExplorerDomain,
  CompetencyExplorerQueryState,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  CompetencyExplorerStats,
  ExplorerContentMode,
  MatchMode,
  PersonMatchResult,
  PersonSortMode,
  RestrictiveCriterion,
} from '../types/competencyExplorer.types'
import { ExplorerInitialState } from './ExplorerInitialState'
import { PeopleRanking } from './PeopleRanking'

type Props = {
  mode: ExplorerContentMode
  stats: CompetencyExplorerStats
  allDomains: CompetencyExplorerDomain[]
  rankingResults: PersonMatchResult[]
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
  onSelectDomain: (code: string) => void
  /** Reservados para compatibilidad tipada del panel (no usados en ranking). */
  query?: CompetencyExplorerQueryState
}

export function ExplorerContent({
  mode,
  stats,
  allDomains,
  rankingResults,
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
  onSelectDomain,
}: Props) {
  if (mode === 'initial') {
    return (
      <ExplorerInitialState
        stats={stats}
        domains={allDomains}
        onSelectDomain={onSelectDomain}
      />
    )
  }

  return (
    <PeopleRanking
      results={rankingResults}
      domainCount={domainCount}
      specialtyCount={specialtyCount}
      skillCount={skillCount}
      matchMode={matchMode}
      sortMode={sortMode}
      onMatchModeChange={onMatchModeChange}
      onSortModeChange={onSortModeChange}
      skillCatalog={skillCatalog}
      specialtyCatalog={specialtyCatalog}
      domainCatalog={domainCatalog}
      restrictiveCriterion={restrictiveCriterion}
      onChangeToAny={onChangeToAny}
      onRemoveCriterion={onRemoveCriterion}
    />
  )
}
