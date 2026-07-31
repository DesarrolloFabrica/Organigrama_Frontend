import { describe, expect, it } from 'vitest'
import {
  hasUserCriteria,
  resolveExplorerContentMode,
  selectSkillAsUser,
  toggleDomain,
  EMPTY_QUERY,
} from './queryState'
import type { CompetencyExplorerSkill } from '../types/competencyExplorer.types'

const skill: CompetencyExplorerSkill = {
  code: 'SKILL_REGISTRO_CALIFICADO',
  specialtyCode: 'EM_ACADEMIC_QUALITY',
  domainCode: 'EDUCATION_MANAGEMENT',
  name: 'Registro Calificado',
  peopleCount: 9,
}

describe('queryState progressive ranking mode', () => {
  it('sin criterios USER → initial', () => {
    expect(resolveExplorerContentMode(EMPTY_QUERY)).toBe('initial')
  })

  it('dominio USER → ranking', () => {
    const q = toggleDomain(EMPTY_QUERY, 'SOFTWARE')
    expect(hasUserCriteria(q)).toBe(true)
    expect(resolveExplorerContentMode(q)).toBe('ranking')
  })

  it('skill USER con CONTEXT no cuenta CONTEXT como activación exclusiva', () => {
    const q = selectSkillAsUser(EMPTY_QUERY, skill)
    expect(q.skills[0]?.source).toBe('USER')
    expect(q.domains[0]?.source).toBe('CONTEXT')
    expect(resolveExplorerContentMode(q)).toBe('ranking')
  })
})
