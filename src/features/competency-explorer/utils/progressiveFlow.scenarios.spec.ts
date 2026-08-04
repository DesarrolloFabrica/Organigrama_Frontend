import { describe, expect, it } from 'vitest'
import {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
} from '../mocks/competencyExplorer.mock'
import { MOCK_EXPLORER_PEOPLE } from '../mocks/competencyExplorer.people.mock'
import type { CompetencyExplorerQueryState } from '../types/competencyExplorer.types'
import {
  clearQuery,
  EMPTY_QUERY,
  removeSkillCriterion,
  removeSpecialtyCriterion,
  resolveExplorerContentMode,
  selectDomainAsUser,
  toggleSkill,
  toggleSpecialty,
  userSelectionCodes,
} from './queryState'
import { rankPeople } from './rankPeople'

function rankingQueryFrom(q: CompetencyExplorerQueryState) {
  return {
    domainCodes: userSelectionCodes(q.domains),
    specialtyCodes: userSelectionCodes(q.specialties),
    skillCodes: userSelectionCodes(q.skills),
  }
}

describe('Validación escenarios A–F (flujo progresivo)', () => {
  it('A→F: dominio → especialidad → skill → retirar → limpiar', () => {
    const soft = MOCK_EXPLORER_DOMAINS.find((d) =>
      d.name.includes('Software'),
    )!
    const front = MOCK_EXPLORER_SPECIALTIES.find((s) =>
      s.name.toLowerCase().includes('frontend'),
    )!
    const react = MOCK_EXPLORER_SKILLS.find((s) => s.name === 'React')!

    // A — solo dominio
    let q = selectDomainAsUser(EMPTY_QUERY, soft.code)
    let rq = rankingQueryFrom(q)
    let r = rankPeople(MOCK_EXPLORER_PEOPLE, rq, 'ANY', 'MATCH')
    expect(resolveExplorerContentMode(q)).toBe('ranking')
    expect(r.length).toBeGreaterThan(0)
    const countA = r.length

    // B — + especialidad
    q = toggleSpecialty(q, front)
    rq = rankingQueryFrom(q)
    r = rankPeople(MOCK_EXPLORER_PEOPLE, rq, 'ANY', 'MATCH')
    expect(r.length).toBeGreaterThan(0)
    expect(r.length).toBeLessThanOrEqual(countA)
    expect(r.every((x) => x.matchedSpecialtyCodes.length > 0)).toBe(true)
    const countB = r.length

    // C — + React
    q = toggleSkill(q, react)
    rq = rankingQueryFrom(q)
    r = rankPeople(MOCK_EXPLORER_PEOPLE, rq, 'ANY', 'MATCH')
    expect(r.length).toBeGreaterThan(0)
    expect(r.length).toBeLessThanOrEqual(countB)
    expect(
      r.every(
        (x) =>
          x.matchedSkillCodes.length + x.missingSkillCodes.length === 1,
      ),
    ).toBe(true)

    // D — retirar React
    q = removeSkillCriterion(q, react.code)
    rq = rankingQueryFrom(q)
    r = rankPeople(MOCK_EXPLORER_PEOPLE, rq, 'ANY', 'MATCH')
    expect(rq.skillCodes).toHaveLength(0)
    expect(r.length).toBe(countB)
    expect(resolveExplorerContentMode(q)).toBe('ranking')

    // E — retirar especialidad
    q = removeSpecialtyCriterion(q, front.code)
    rq = rankingQueryFrom(q)
    r = rankPeople(MOCK_EXPLORER_PEOPLE, rq, 'ANY', 'MATCH')
    expect(r.length).toBe(countA)
    expect(rq.domainCodes).toEqual([soft.code])

    // F — limpiar
    q = clearQuery()
    expect(resolveExplorerContentMode(q)).toBe('initial')
    expect(
      rankPeople(
        MOCK_EXPLORER_PEOPLE,
        { domainCodes: [], specialtyCodes: [], skillCodes: [] },
        'ANY',
        'MATCH',
      ),
    ).toHaveLength(0)
  })
})
