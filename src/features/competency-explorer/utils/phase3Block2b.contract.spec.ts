import { describe, expect, it, vi } from 'vitest'
import { MOCK_EXPLORER_PEOPLE } from '../mocks/competencyExplorer.people.mock'
import { MOCK_EXPLORER_SKILLS } from '../mocks/competencyExplorer.mock'
import {
  activeQueryPeopleLabel,
  fullMatchCoverageMessage,
  matchDetailSummary,
  matchPercentageFormula,
  resolveCatalogName,
} from './personMatchPresentation'
import {
  findMostRestrictiveCriterion,
  rankPeople,
} from './rankPeople'

describe('Fase 3.1 — contratos detalle / empty', () => {
  it('detalle resume criterios', () => {
    expect(matchDetailSummary(2, 3)).toContain('criterios seleccionados')
    expect(matchPercentageFormula(2, 3, 67)).toContain('criterios')
  })

  it('cobertura total', () => {
    expect(fullMatchCoverageMessage()).toContain('criterios')
  })

  it('retirar criterio restrictivo usa callback tipado', () => {
    const restrictive = findMostRestrictiveCriterion(MOCK_EXPLORER_PEOPLE, {
      domainCodes: ['SOFTWARE'],
      specialtyCodes: [],
      skillCodes: ['SKILL_RAG'],
    })
    const onRemove = vi.fn()
    expect(restrictive).toBeTruthy()
    onRemove(restrictive!)
    expect(onRemove).toHaveBeenCalledWith(restrictive)
  })

  it('ActiveQueryBar sin coincidencias', () => {
    expect(activeQueryPeopleLabel(0)).toBe('Sin coincidencias')
  })

  it('nombres de skills no codes', () => {
    const [result] = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      {
        domainCodes: [],
        specialtyCodes: [],
        skillCodes: ['SKILL_POWER_BI'],
      },
      'ANY',
      'MATCH',
    )
    expect(
      resolveCatalogName(result!.matchedSkillCodes[0]!, MOCK_EXPLORER_SKILLS),
    ).toBe('Power BI')
  })

  it('no hay cargo en personas', () => {
    for (const p of MOCK_EXPLORER_PEOPLE) {
      expect(p).not.toHaveProperty('cargo')
      expect(p).not.toHaveProperty('dependencia')
    }
  })
})
