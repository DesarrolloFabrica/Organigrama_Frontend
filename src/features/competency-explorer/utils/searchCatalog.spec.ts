import { describe, expect, it } from 'vitest'
import {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
} from '../mocks/competencyExplorer.mock'
import { searchKnowledgeCatalog } from './searchCatalog'

describe('searchKnowledgeCatalog', () => {
  it('encuentra Power BI como skill', () => {
    const hits = searchKnowledgeCatalog(
      'Power BI',
      MOCK_EXPLORER_DOMAINS,
      MOCK_EXPLORER_SPECIALTIES,
      MOCK_EXPLORER_SKILLS,
    )
    expect(hits.some((h) => h.code === 'SKILL_POWER_BI')).toBe(true)
    expect(hits.every((h) => h.type !== undefined)).toBe(true)
  })

  it('encuentra Registro Calificado', () => {
    const hits = searchKnowledgeCatalog(
      'Registro Calificado',
      MOCK_EXPLORER_DOMAINS,
      MOCK_EXPLORER_SPECIALTIES,
      MOCK_EXPLORER_SKILLS,
    )
    expect(hits[0]?.type).toBe('skill')
    expect(hits[0]?.code).toBe('SKILL_REGISTRO_CALIFICADO')
  })

  it('no busca con menos de 2 caracteres', () => {
    expect(
      searchKnowledgeCatalog(
        'P',
        MOCK_EXPLORER_DOMAINS,
        MOCK_EXPLORER_SPECIALTIES,
        MOCK_EXPLORER_SKILLS,
      ),
    ).toEqual([])
  })
})
