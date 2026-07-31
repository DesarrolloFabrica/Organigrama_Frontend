import {
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
} from '../mocks/competencyExplorer.mock'
import type {
  CompetencyExplorerPerson,
  CompetencyRankingQuery,
  MatchMode,
  PersonMatchResult,
  PersonSortMode,
  RestrictiveCriterion,
} from '../types/competencyExplorer.types'
import {
  resolvePersonEffectiveDomains,
  resolvePersonEffectiveSpecialties,
} from './personKnowledge'
import { uniquePreserveOrder } from './uniquePreserveOrder'

export { uniquePreserveOrder } from './uniquePreserveOrder'

export function isRankingQueryEmpty(query: CompetencyRankingQuery): boolean {
  return (
    query.domainCodes.length === 0 &&
    query.specialtyCodes.length === 0 &&
    query.skillCodes.length === 0
  )
}

export function normalizeRankingQuery(
  query: CompetencyRankingQuery,
): CompetencyRankingQuery {
  return {
    domainCodes: uniquePreserveOrder(query.domainCodes),
    specialtyCodes: uniquePreserveOrder(query.specialtyCodes),
    skillCodes: uniquePreserveOrder(query.skillCodes),
  }
}

function groupPasses(
  matchedCount: number,
  selectedCount: number,
  matchMode: MatchMode,
): boolean {
  if (selectedCount === 0) return true
  if (matchMode === 'ANY') return matchedCount >= 1
  return matchedCount === selectedCount
}

function buildMatchResult(
  person: CompetencyExplorerPerson,
  query: CompetencyRankingQuery,
): PersonMatchResult {
  const effectiveDomains = new Set(
    resolvePersonEffectiveDomains(
      person,
      MOCK_EXPLORER_SKILLS,
      MOCK_EXPLORER_SPECIALTIES,
    ),
  )
  const effectiveSpecialties = new Set(
    resolvePersonEffectiveSpecialties(person, MOCK_EXPLORER_SKILLS),
  )
  const personSkills = new Set(uniquePreserveOrder(person.skillCodes))

  const matchedDomainCodes = query.domainCodes.filter((c) =>
    effectiveDomains.has(c),
  )
  const missingDomainCodes = query.domainCodes.filter(
    (c) => !effectiveDomains.has(c),
  )

  const matchedSpecialtyCodes = query.specialtyCodes.filter((c) =>
    effectiveSpecialties.has(c),
  )
  const missingSpecialtyCodes = query.specialtyCodes.filter(
    (c) => !effectiveSpecialties.has(c),
  )

  const matchedSkillCodes = query.skillCodes.filter((c) => personSkills.has(c))
  const missingSkillCodes = query.skillCodes.filter((c) => !personSkills.has(c))

  const selectedCriterionCount =
    query.domainCodes.length +
    query.specialtyCodes.length +
    query.skillCodes.length
  const matchedCriterionCount =
    matchedDomainCodes.length +
    matchedSpecialtyCodes.length +
    matchedSkillCodes.length

  const matchPercentage =
    selectedCriterionCount === 0
      ? 0
      : Math.round((matchedCriterionCount / selectedCriterionCount) * 100)

  return {
    person,
    selectedCriterionCount,
    matchedCriterionCount,
    matchedDomainCodes,
    missingDomainCodes,
    matchedSpecialtyCodes,
    missingSpecialtyCodes,
    matchedSkillCodes,
    missingSkillCodes,
    matchPercentage,
    evidenceStrength: person.evidenceStrength,
  }
}

function personPassesGroups(
  result: PersonMatchResult,
  query: CompetencyRankingQuery,
  matchMode: MatchMode,
): boolean {
  const domainOk = groupPasses(
    result.matchedDomainCodes.length,
    query.domainCodes.length,
    matchMode,
  )
  const specialtyOk = groupPasses(
    result.matchedSpecialtyCodes.length,
    query.specialtyCodes.length,
    matchMode,
  )
  const skillOk = groupPasses(
    result.matchedSkillCodes.length,
    query.skillCodes.length,
    matchMode,
  )
  return domainOk && specialtyOk && skillOk
}

function compareByName(a: PersonMatchResult, b: PersonMatchResult): number {
  return a.person.fullName.localeCompare(b.person.fullName, 'es', {
    sensitivity: 'base',
  })
}

function sortResults(
  results: PersonMatchResult[],
  sortMode: PersonSortMode,
): PersonMatchResult[] {
  const sorted = [...results]
  sorted.sort((a, b) => {
    if (sortMode === 'NAME') return compareByName(a, b)

    if (sortMode === 'EVIDENCE_STRENGTH') {
      if (b.evidenceStrength !== a.evidenceStrength) {
        return b.evidenceStrength - a.evidenceStrength
      }
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage
      }
      return compareByName(a, b)
    }

    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage
    }
    if (b.matchedCriterionCount !== a.matchedCriterionCount) {
      return b.matchedCriterionCount - a.matchedCriterionCount
    }
    if (b.evidenceStrength !== a.evidenceStrength) {
      return b.evidenceStrength - a.evidenceStrength
    }
    return compareByName(a, b)
  })
  return sorted
}

/**
 * Ranking progresivo por criterios USER (dominio ∧ especialidad ∧ skill).
 * ANY/ALL aplica dentro de cada grupo, no entre grupos.
 */
export function rankPeople(
  people: CompetencyExplorerPerson[],
  query: CompetencyRankingQuery,
  matchMode: MatchMode,
  sortMode: PersonSortMode,
): PersonMatchResult[] {
  const normalized = normalizeRankingQuery(query)
  if (isRankingQueryEmpty(normalized)) return []

  const uniquePeople: CompetencyExplorerPerson[] = []
  const seenPersonIds = new Set<string>()
  for (const person of people) {
    if (seenPersonIds.has(person.id)) continue
    seenPersonIds.add(person.id)
    uniquePeople.push(person)
  }

  const matched: PersonMatchResult[] = []
  for (const person of uniquePeople) {
    const result = buildMatchResult(person, normalized)
    if (personPassesGroups(result, normalized, matchMode)) {
      matched.push(result)
    }
  }

  return sortResults(matched, sortMode)
}

/**
 * @deprecated Preferir findMostRestrictiveCriterion.
 * Conservado para compatibilidad de imports; delega en skills del query.
 */
export function findMostRestrictiveSkill(
  people: CompetencyExplorerPerson[],
  selectedSkillCodes: string[],
): string | null {
  const hit = findMostRestrictiveCriterion(people, {
    domainCodes: [],
    specialtyCodes: [],
    skillCodes: selectedSkillCodes,
  })
  return hit?.type === 'SKILL' ? hit.code : null
}

function countPeopleMatchingSingleCriterion(
  people: CompetencyExplorerPerson[],
  type: RestrictiveCriterion['type'],
  code: string,
): number {
  let count = 0
  for (const person of people) {
    if (type === 'DOMAIN') {
      const domains = resolvePersonEffectiveDomains(
        person,
        MOCK_EXPLORER_SKILLS,
        MOCK_EXPLORER_SPECIALTIES,
      )
      if (domains.includes(code)) count += 1
    } else if (type === 'SPECIALTY') {
      const specialties = resolvePersonEffectiveSpecialties(
        person,
        MOCK_EXPLORER_SKILLS,
      )
      if (specialties.includes(code)) count += 1
    } else if (person.skillCodes.includes(code)) {
      count += 1
    }
  }
  return count
}

/**
 * Criterio USER con menor cobertura entre personas.
 * Empate: orden dominios → especialidades → skills (deduplicados).
 */
export function findMostRestrictiveCriterion(
  people: CompetencyExplorerPerson[],
  query: CompetencyRankingQuery,
): RestrictiveCriterion | null {
  const normalized = normalizeRankingQuery(query)
  const candidates: RestrictiveCriterion[] = []

  for (const code of normalized.domainCodes) {
    candidates.push({
      type: 'DOMAIN',
      code,
      matchCount: countPeopleMatchingSingleCriterion(people, 'DOMAIN', code),
    })
  }
  for (const code of normalized.specialtyCodes) {
    candidates.push({
      type: 'SPECIALTY',
      code,
      matchCount: countPeopleMatchingSingleCriterion(people, 'SPECIALTY', code),
    })
  }
  for (const code of normalized.skillCodes) {
    candidates.push({
      type: 'SKILL',
      code,
      matchCount: countPeopleMatchingSingleCriterion(people, 'SKILL', code),
    })
  }

  if (candidates.length === 0) return null

  let best = candidates[0]!
  for (let i = 1; i < candidates.length; i += 1) {
    const next = candidates[i]!
    if (next.matchCount < best.matchCount) best = next
  }
  return best
}
