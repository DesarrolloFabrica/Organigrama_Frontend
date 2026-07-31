import { describe, expect, it } from 'vitest'
import type {
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'
import {
  EMPTY_QUERY,
  applySearchHit,
  clearQuery,
  removeDomainCriterion,
  resolveExplorerContentMode,
  selectSkillAsUser,
  toggleDomain,
  toggleSpecialty,
} from './queryState'

const specialty: CompetencyExplorerSpecialty = {
  code: 'EM_ACADEMIC_QUALITY',
  domainCode: 'EDUCATION_MANAGEMENT',
  name: 'Calidad Académica',
  description: 'test',
  skillCount: 4,
  peopleCount: 18,
}

const skill: CompetencyExplorerSkill = {
  code: 'SKILL_REGISTRO_CALIFICADO',
  specialtyCode: 'EM_ACADEMIC_QUALITY',
  domainCode: 'EDUCATION_MANAGEMENT',
  name: 'Registro Calificado',
  peopleCount: 9,
}

describe('queryState', () => {
  it('toggleDomain no elimina especialidades hijas', () => {
    let q = toggleDomain(EMPTY_QUERY, 'EDUCATION_MANAGEMENT')
    q = toggleSpecialty(q, specialty)
    q = toggleDomain(q, 'EDUCATION_MANAGEMENT')
    expect(q.domains).toHaveLength(0)
    expect(q.specialties).toHaveLength(1)
  })

  it('selectSkillAsUser agrega CONTEXT y activa ranking', () => {
    const q = selectSkillAsUser(EMPTY_QUERY, skill)
    expect(q.skills[0]?.source).toBe('USER')
    expect(q.domains[0]?.source).toBe('CONTEXT')
    expect(resolveExplorerContentMode(q)).toBe('ranking')
  })

  it('applySearchHit de skill usa catálogos', () => {
    const q = applySearchHit(
      EMPTY_QUERY,
      {
        type: 'skill',
        code: skill.code,
        name: skill.name,
        contextLabel: 'x',
      },
      new Map([[specialty.code, specialty]]),
      new Map([[skill.code, skill]]),
    )
    expect(q.skills).toHaveLength(1)
  })

  it('clearQuery vacía todo', () => {
    let q = selectSkillAsUser(EMPTY_QUERY, skill)
    q = clearQuery()
    expect(q).toEqual(EMPTY_QUERY)
  })

  it('removeDomainCriterion no toca skills', () => {
    let q = selectSkillAsUser(EMPTY_QUERY, skill)
    q = removeDomainCriterion(q, 'EDUCATION_MANAGEMENT')
    expect(q.domains).toHaveLength(0)
    expect(q.skills).toHaveLength(1)
  })
})
