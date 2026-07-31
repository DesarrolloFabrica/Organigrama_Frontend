import { describe, expect, it } from 'vitest'
import { MOCK_EXPLORER_PEOPLE } from '../mocks/competencyExplorer.people.mock'
import type {
  CompetencyExplorerPerson,
  CompetencyRankingQuery,
} from '../types/competencyExplorer.types'
import {
  findMostRestrictiveCriterion,
  findMostRestrictiveSkill,
  rankPeople,
  uniquePreserveOrder,
} from './rankPeople'

function person(
  partial: Partial<CompetencyExplorerPerson> &
    Pick<CompetencyExplorerPerson, 'id' | 'fullName'>,
): CompetencyExplorerPerson {
  return {
    primaryDomainCode: 'SOFTWARE',
    specialtyCodes: [],
    skillCodes: [],
    evidenceStrength: 50,
    ...partial,
  }
}

function q(
  partial: Partial<CompetencyRankingQuery> = {},
): CompetencyRankingQuery {
  return {
    domainCodes: [],
    specialtyCodes: [],
    skillCodes: [],
    ...partial,
  }
}

describe('rankPeople progressive', () => {
  it('solo dominio produce resultados', () => {
    const ranked = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ domainCodes: ['SOFTWARE'] }),
      'ANY',
      'MATCH',
    )
    expect(ranked.length).toBeGreaterThan(0)
    expect(
      ranked.every((r) => r.matchedDomainCodes.includes('SOFTWARE')),
    ).toBe(true)
  })

  it('solo especialidad produce resultados', () => {
    const ranked = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ specialtyCodes: ['SOFTWARE_FRONTEND'] }),
      'ANY',
      'MATCH',
    )
    expect(ranked.length).toBeGreaterThan(0)
  })

  it('solo skill produce resultados', () => {
    const ranked = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ skillCodes: ['SKILL_REACT'] }),
      'ANY',
      'MATCH',
    )
    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked.every((r) => r.matchedSkillCodes.includes('SKILL_REACT'))).toBe(
      true,
    )
  })

  it('dominio + especialidad reduce resultados', () => {
    const byDomain = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ domainCodes: ['SOFTWARE'] }),
      'ANY',
      'MATCH',
    )
    const byBoth = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({
        domainCodes: ['SOFTWARE'],
        specialtyCodes: ['SOFTWARE_FRONTEND'],
      }),
      'ANY',
      'MATCH',
    )
    expect(byBoth.length).toBeLessThanOrEqual(byDomain.length)
    expect(byBoth.length).toBeGreaterThan(0)
  })

  it('dominio + especialidad + skill reduce resultados', () => {
    const mid = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({
        domainCodes: ['SOFTWARE'],
        specialtyCodes: ['SOFTWARE_FRONTEND'],
      }),
      'ANY',
      'MATCH',
    )
    const deep = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({
        domainCodes: ['SOFTWARE'],
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT'],
      }),
      'ANY',
      'MATCH',
    )
    expect(deep.length).toBeLessThanOrEqual(mid.length)
  })

  it('CONTEXT no filtra: query solo con skills USER implícitas en rankingQuery vacío de dominio', () => {
    // Simula rankingQuery construido solo con USER: skill sin dominio USER
    const onlySkill = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ skillCodes: ['SKILL_REACT'] }),
      'ANY',
      'MATCH',
    )
    expect(onlySkill.length).toBeGreaterThan(0)
    // No exige dominio aunque personas tengan otros dominios
    expect(onlySkill.some((r) => r.matchedDomainCodes.length === 0)).toBe(true)
  })

  it('USER sí filtra por dominio', () => {
    const ranked = rankPeople(
      MOCK_EXPLORER_PEOPLE,
      q({ domainCodes: ['AUDIOVISUAL_PRODUCTION'] }),
      'ANY',
      'MATCH',
    )
    expect(ranked.length).toBeGreaterThan(0)
    expect(
      ranked.every((r) =>
        r.matchedDomainCodes.includes('AUDIOVISUAL_PRODUCTION'),
      ),
    ).toBe(true)
  })

  it('porcentaje incluye dominio, especialidad y skill', () => {
    const people = [
      person({
        id: 'a',
        fullName: 'Ana',
        primaryDomainCode: 'SOFTWARE',
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT'],
      }),
    ]
    const ranked = rankPeople(
      people,
      q({
        domainCodes: ['SOFTWARE'],
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT', 'SKILL_TYPESCRIPT'],
      }),
      'ANY',
      'MATCH',
    )
    // 3 de 4 criterios
    expect(ranked[0]?.matchPercentage).toBe(75)
    expect(ranked[0]?.selectedCriterionCount).toBe(4)
    expect(ranked[0]?.matchedCriterionCount).toBe(3)
  })

  it('ANY funciona dentro de cada grupo', () => {
    const people = [
      person({
        id: 'a',
        fullName: 'Ana',
        primaryDomainCode: 'SOFTWARE',
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT'],
      }),
    ]
    const ranked = rankPeople(
      people,
      q({
        domainCodes: ['SOFTWARE', 'VISUAL_DESIGN'],
        specialtyCodes: ['SOFTWARE_FRONTEND', 'VISUAL_GRAPHIC'],
        skillCodes: ['SKILL_REACT', 'SKILL_FIGMA'],
      }),
      'ANY',
      'MATCH',
    )
    expect(ranked).toHaveLength(1)
  })

  it('ALL exige todos los elementos dentro de cada grupo', () => {
    const people = [
      person({
        id: 'a',
        fullName: 'Ana',
        primaryDomainCode: 'SOFTWARE',
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT'],
      }),
    ]
    const ranked = rankPeople(
      people,
      q({
        domainCodes: ['SOFTWARE', 'VISUAL_DESIGN'],
        specialtyCodes: ['SOFTWARE_FRONTEND'],
        skillCodes: ['SKILL_REACT'],
      }),
      'ALL',
      'MATCH',
    )
    expect(ranked).toHaveLength(0)
  })

  it('sin criterios devuelve lista vacía', () => {
    expect(
      rankPeople(MOCK_EXPLORER_PEOPLE, q(), 'ANY', 'MATCH'),
    ).toEqual([])
  })

  it('2 de 3 skills produce 67 cuando solo hay skills', () => {
    const people = [
      person({
        id: 'a',
        fullName: 'Ana',
        skillCodes: ['SKILL_REACT', 'SKILL_TYPESCRIPT'],
      }),
    ]
    const ranked = rankPeople(
      people,
      q({
        skillCodes: ['SKILL_REACT', 'SKILL_TYPESCRIPT', 'SKILL_NESTJS'],
      }),
      'ANY',
      'MATCH',
    )
    expect(ranked[0]?.matchPercentage).toBe(67)
  })

  it('MATCH ordena por porcentaje', () => {
    const people = [
      person({
        id: 'low',
        fullName: 'Zeta',
        skillCodes: ['SKILL_REACT'],
        evidenceStrength: 99,
      }),
      person({
        id: 'high',
        fullName: 'Ana',
        skillCodes: ['SKILL_REACT', 'SKILL_TYPESCRIPT'],
        evidenceStrength: 10,
      }),
    ]
    const ranked = rankPeople(
      people,
      q({ skillCodes: ['SKILL_REACT', 'SKILL_TYPESCRIPT'] }),
      'ANY',
      'MATCH',
    )
    expect(ranked.map((r) => r.person.id)).toEqual(['high', 'low'])
  })

  it('evita duplicados y no muta entradas', () => {
    const dup = person({
      id: 'a',
      fullName: 'Ana',
      skillCodes: ['SKILL_REACT', 'SKILL_REACT'],
    })
    const people = [dup, dup]
    const selected = ['SKILL_REACT', 'SKILL_REACT']
    const query = q({ skillCodes: selected })
    const beforePeople = JSON.stringify(people)
    const beforeQuery = JSON.stringify(query)
    const ranked = rankPeople(people, query, 'ANY', 'MATCH')
    expect(ranked).toHaveLength(1)
    expect(JSON.stringify(people)).toBe(beforePeople)
    expect(JSON.stringify(query)).toBe(beforeQuery)
  })

  it('skill inexistente produce cero resultados', () => {
    expect(
      rankPeople(
        MOCK_EXPLORER_PEOPLE,
        q({ skillCodes: ['SKILL_DOES_NOT_EXIST'] }),
        'ANY',
        'MATCH',
      ),
    ).toEqual([])
  })
})

describe('findMostRestrictiveCriterion', () => {
  it('puede ser skill', () => {
    const hit = findMostRestrictiveCriterion(MOCK_EXPLORER_PEOPLE, {
      domainCodes: ['SOFTWARE'],
      specialtyCodes: [],
      skillCodes: ['SKILL_RAG'],
    })
    expect(hit?.type).toBe('SKILL')
    expect(hit?.code).toBe('SKILL_RAG')
  })

  it('puede ser dominio', () => {
    const hit = findMostRestrictiveCriterion(MOCK_EXPLORER_PEOPLE, {
      domainCodes: ['AUDIOVISUAL_PRODUCTION', 'SOFTWARE'],
      specialtyCodes: [],
      skillCodes: [],
    })
    expect(hit?.type).toBe('DOMAIN')
    expect(hit?.code).toBe('AUDIOVISUAL_PRODUCTION')
  })

  it('puede ser especialidad', () => {
    const hit = findMostRestrictiveCriterion(MOCK_EXPLORER_PEOPLE, {
      domainCodes: [],
      specialtyCodes: ['AV_POST', 'SOFTWARE_FRONTEND'],
      skillCodes: [],
    })
    expect(hit?.type).toBe('SPECIALTY')
    expect(hit?.code).toBe('AV_POST')
  })

  it('findMostRestrictiveSkill sigue funcionando', () => {
    expect(
      findMostRestrictiveSkill(MOCK_EXPLORER_PEOPLE, [
        'SKILL_REACT',
        'SKILL_RAG',
      ]),
    ).toBe('SKILL_RAG')
  })
})

describe('uniquePreserveOrder', () => {
  it('elimina duplicados conservando orden', () => {
    expect(uniquePreserveOrder(['b', 'a', 'b', 'c'])).toEqual(['b', 'a', 'c'])
  })
})
