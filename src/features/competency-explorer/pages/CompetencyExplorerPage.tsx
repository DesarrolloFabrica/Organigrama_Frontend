import { useMemo, useState } from 'react'
import { ActiveQueryBar } from '../components/ActiveQueryBar'
import { ExplorerContent } from '../components/ExplorerContent'
import { ExplorerHeader } from '../components/ExplorerHeader'
import { GlobalKnowledgeSearch } from '../components/GlobalKnowledgeSearch'
import { QueryBuilderPanel } from '../components/QueryBuilderPanel'
import { useCompetencyExplorerQuery } from '../hooks/useCompetencyExplorerQuery'
import {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
  MOCK_EXPLORER_STATS,
} from '../mocks/competencyExplorer.mock'
import { MOCK_EXPLORER_PEOPLE } from '../mocks/competencyExplorer.people.mock'
import type {
  CompetencyRankingQuery,
  MatchMode,
  PersonSortMode,
  RestrictiveCriterion,
} from '../types/competencyExplorer.types'
import {
  findMostRestrictiveCriterion,
  rankPeople,
} from '../utils/rankPeople'
import { userSelectionCodes } from '../utils/queryState'

/**
 * Explorador de Competencias — ranking progresivo desde dominio (Fase 3.1).
 */
export function CompetencyExplorerPage() {
  const [searchText, setSearchText] = useState('')
  const [matchMode, setMatchMode] = useState<MatchMode>('ANY')
  const [sortMode, setSortMode] = useState<PersonSortMode>('MATCH')
  const explorer = useCompetencyExplorerQuery()

  const domainNameByCode = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of explorer.domains) map.set(d.code, d.name)
    return map
  }, [explorer.domains])

  const rankingQuery: CompetencyRankingQuery = useMemo(
    () => ({
      domainCodes: userSelectionCodes(explorer.query.domains),
      specialtyCodes: userSelectionCodes(explorer.query.specialties),
      skillCodes: userSelectionCodes(explorer.query.skills),
    }),
    [explorer.query],
  )

  const hasExplicitCriteria =
    rankingQuery.domainCodes.length > 0 ||
    rankingQuery.specialtyCodes.length > 0 ||
    rankingQuery.skillCodes.length > 0

  const rankingResults = useMemo(
    () =>
      rankPeople(MOCK_EXPLORER_PEOPLE, rankingQuery, matchMode, sortMode),
    [rankingQuery, matchMode, sortMode],
  )

  const restrictiveCriterion = useMemo(
    () => findMostRestrictiveCriterion(MOCK_EXPLORER_PEOPLE, rankingQuery),
    [rankingQuery],
  )

  function onRemoveCriterion(criterion: RestrictiveCriterion) {
    if (criterion.type === 'DOMAIN') {
      explorer.onRemoveDomain(criterion.code)
      return
    }
    if (criterion.type === 'SPECIALTY') {
      explorer.onRemoveSpecialty(criterion.code)
      return
    }
    explorer.onRemoveSkill(criterion.code)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <ExplorerHeader
            search={
              <GlobalKnowledgeSearch
                value={searchText}
                onChange={setSearchText}
                onSelectHit={explorer.onSelectSearchHit}
              />
            }
          />

          <ActiveQueryBar
            query={explorer.query}
            domains={explorer.domains}
            specialties={MOCK_EXPLORER_SPECIALTIES}
            skills={MOCK_EXPLORER_SKILLS}
            matchMode={matchMode}
            resultCount={hasExplicitCriteria ? rankingResults.length : null}
            onRemoveDomain={explorer.onRemoveDomain}
            onRemoveSpecialty={explorer.onRemoveSpecialty}
            onRemoveSkill={explorer.onRemoveSkill}
            onClear={explorer.onClear}
          />

          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-0 lg:max-h-[calc(100dvh-2rem)]">
              <QueryBuilderPanel
                domains={explorer.domains}
                availableSpecialties={explorer.availableSpecialties}
                availableSkills={explorer.availableSkills}
                query={explorer.query}
                domainNameByCode={domainNameByCode}
                onToggleDomain={explorer.onToggleDomain}
                onToggleSpecialty={explorer.onToggleSpecialty}
                onToggleSkill={explorer.onToggleSkill}
              />
            </div>

            <section
              aria-label="Área de exploración"
              className="min-w-0 rounded-xl border border-cyan-400/12 bg-[#06111f]/40 px-4 py-5 sm:px-5 sm:py-6"
            >
              <ExplorerContent
                mode={explorer.contentMode}
                stats={MOCK_EXPLORER_STATS}
                allDomains={explorer.domains}
                rankingResults={rankingResults}
                domainCount={rankingQuery.domainCodes.length}
                specialtyCount={rankingQuery.specialtyCodes.length}
                skillCount={rankingQuery.skillCodes.length}
                matchMode={matchMode}
                sortMode={sortMode}
                onMatchModeChange={setMatchMode}
                onSortModeChange={setSortMode}
                skillCatalog={MOCK_EXPLORER_SKILLS}
                specialtyCatalog={MOCK_EXPLORER_SPECIALTIES}
                domainCatalog={MOCK_EXPLORER_DOMAINS}
                restrictiveCriterion={restrictiveCriterion}
                onChangeToAny={() => setMatchMode('ANY')}
                onRemoveCriterion={onRemoveCriterion}
                onSelectDomain={explorer.onSelectDomain}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
