import { describe, expect, it } from 'vitest'
import { camiloCompetencySummaryFixture } from '../fixtures/camiloSummary'
import {
  formatConfidencePercent,
  formatCoveragePercent,
  formatStrength,
  partitionSpecialties,
  pickInitialSpecialtyCode,
} from '../utils/competencyFormat'

describe('Camilo fixture (MC1.3.5)', () => {
  const domain = camiloCompetencySummaryFixture.domains[0]

  it('Frontend es principal y default', () => {
    expect(domain.defaultSpecialtyCode).toBe('SOFTWARE_FRONTEND')
    expect(
      pickInitialSpecialtyCode(domain.specialties, domain.defaultSpecialtyCode),
    ).toBe('SOFTWARE_FRONTEND')
  })

  it('separa 5 activas y 2 emergentes', () => {
    const { active, emergent } = partitionSpecialties(domain.specialties)
    expect(active).toHaveLength(5)
    expect(emergent).toHaveLength(2)
    expect(domain.activeSpecialtyCount).toBe(5)
    expect(domain.emergentSpecialtyCount).toBe(2)
  })

  it('orden por ranking esperado', () => {
    expect(domain.specialties.map((s) => s.code)).toEqual([
      'SOFTWARE_FRONTEND',
      'SOFTWARE_BACKEND',
      'SOFTWARE_DATA',
      'SOFTWARE_AI_APPLIED',
      'SOFTWARE_ENGINEERING_QUALITY',
      'SOFTWARE_API_INTEGRATION',
      'SOFTWARE_CLOUD_DEPLOY',
    ])
  })

  it('métricas Frontend coherentes', () => {
    const fe = domain.specialties[0]
    expect(formatCoveragePercent(fe.metrics.coverage)).toBe('100 %')
    expect(formatConfidencePercent(fe.metrics.confidence)).toBe('83.07 %')
    expect(formatStrength(fe.metrics.strength)).toBe('31')
    expect(fe.metrics.mappedSkillCount).toBe(11)
    expect(fe.metrics.evidencedSkillCount).toBe(11)
  })
})
