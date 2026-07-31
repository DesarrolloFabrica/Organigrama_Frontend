import { describe, expect, it } from 'vitest'
import { MOCK_EXPLORER_PEOPLE } from '../mocks/competencyExplorer.people.mock'
import { MOCK_EXPLORER_SKILLS } from '../mocks/competencyExplorer.mock'
import {
  activeQueryPeopleLabel,
  matchDetailSummary,
  matchDetailToggleLabel,
  matchPercentageFormula,
  rankingCriteriaComposition,
  rankingSummaryText,
  resolveCatalogName,
} from './personMatchPresentation'
import { rankPeople } from './rankPeople'

describe('presentation progressive ranking', () => {
  it('encabezado usa criterios, no únicamente skills', () => {
    const text = rankingSummaryText(8, {
      domains: 1,
      specialties: 0,
      skills: 0,
    })
    expect(text).toMatch(/criterio/)
    expect(text).not.toMatch(/skills seleccionadas/)
    expect(
      rankingSummaryText(3, { domains: 1, specialties: 2, skills: 1 }),
    ).toContain('criterios')
    expect(
      rankingCriteriaComposition({ domains: 1, specialties: 2, skills: 1 }),
    ).toBe('1 dominio · 2 especialidades · 1 skill')
  })

  it('tarjeta sin skills no exige secciones de skills en el resultado', () => {
    const [result] = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      { domainCodes: ['SOFTWARE'], specialtyCodes: [], skillCodes: [] },
      'ANY',
      'MATCH',
    )
    expect(result).toBeTruthy()
    expect(result!.matchedSkillCodes).toEqual([])
    expect(result!.missingSkillCodes).toEqual([])
    expect(result!.matchedDomainCodes.length).toBeGreaterThan(0)
  })

  it('fórmula usa criterios', () => {
    expect(matchPercentageFormula(3, 4, 75)).toBe(
      '3 coincidencias ÷ 4 criterios = 75 %',
    )
    expect(matchDetailSummary(1, 1)).toContain('criterios seleccionados')
    expect(matchDetailToggleLabel(false)).toBe('Ver coincidencia')
  })

  it('ActiveQueryBar muestra personas con solo dominio', () => {
    const results = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      { domainCodes: ['SOFTWARE'], specialtyCodes: [], skillCodes: [] },
      'ANY',
      'MATCH',
    )
    expect(results.length).toBeGreaterThan(0)
    expect(activeQueryPeopleLabel(results.length)).toMatch(/persona/)
    expect(activeQueryPeopleLabel(0)).toBe('Sin coincidencias')
  })

  it('muestra nombres de catálogo, no codes', () => {
    const results = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      {
        domainCodes: [],
        specialtyCodes: [],
        skillCodes: ['SKILL_REACT'],
      },
      'ANY',
      'MATCH',
    )
    const name = resolveCatalogName(
      results[0]!.matchedSkillCodes[0]!,
      MOCK_EXPLORER_SKILLS,
    )
    expect(name).toBe('React')
  })
})
