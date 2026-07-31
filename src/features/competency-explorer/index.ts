export type {
  CompetencyExplorerDomain,
  CompetencyExplorerPerson,
  CompetencyExplorerQueryState,
  CompetencyExplorerSelection,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  CompetencyExplorerStats,
  CompetencyRankingQuery,
  ExplorerContentMode,
  KnowledgeSearchHit,
  MatchMode,
  PersonMatchResult,
  PersonSortMode,
  QuerySelectionSource,
  RestrictiveCriterion,
  RestrictiveCriterionType,
} from './types/competencyExplorer.types'

export { CompetencyExplorerPage } from './pages/CompetencyExplorerPage'

export { ExplorerHeader } from './components/ExplorerHeader'
export { GlobalKnowledgeSearch } from './components/GlobalKnowledgeSearch'
export { QueryBuilderPanel } from './components/QueryBuilderPanel'
export { ExplorerInitialState } from './components/ExplorerInitialState'
export { ExplorerContent } from './components/ExplorerContent'
export { ExplorerStats } from './components/ExplorerStats'
export { DomainPreviewCard } from './components/DomainPreviewCard'
export { DomainOverview } from './components/DomainOverview'
export { SpecialtyOverview } from './components/SpecialtyOverview'
export { SkillsSelectedState } from './components/SkillsSelectedState'
export { PeopleRanking } from './components/PeopleRanking'
export { PersonMatchCard } from './components/PersonMatchCard'
export { NoPeopleResults } from './components/NoPeopleResults'
export { ActiveQueryBar } from './components/ActiveQueryBar'

export { useCompetencyExplorerQuery } from './hooks/useCompetencyExplorerQuery'

export {
  rankPeople,
  findMostRestrictiveSkill,
  findMostRestrictiveCriterion,
} from './utils/rankPeople'

export {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
  MOCK_EXPLORER_STATS,
} from './mocks/competencyExplorer.mock'

export { MOCK_EXPLORER_PEOPLE } from './mocks/competencyExplorer.people.mock'
