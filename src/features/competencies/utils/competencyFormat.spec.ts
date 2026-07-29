import { describe, expect, it } from 'vitest'
import type { CompetencySpecialtySummary } from '../types'
import {
  formatConfidencePercent,
  formatCoveragePercent,
  formatEvidenceLevel,
  formatStrength,
  partitionSpecialties,
  pickInitialSpecialtyCode,
  translateReason,
  translateWarning,
  visibleSpecialties,
} from './competencyFormat'

function specialty(
  partial: Partial<CompetencySpecialtySummary> & {
    code: string
    presentationStatus: CompetencySpecialtySummary['presentationStatus']
  },
): CompetencySpecialtySummary {
  return {
    name: partial.name ?? partial.code,
    isDefault: partial.isDefault ?? false,
    rank: partial.rank ?? 1,
    warnings: [],
    metrics: {
      mappedSkillCount: 11,
      evidencedSkillCount: 11,
      coverage: 1,
      confidence: 0.8307,
      strength: 31,
      ...partial.metrics,
    },
    ...partial,
  }
}

describe('competencyFormat', () => {
  it('muestra Coverage como porcentaje', () => {
    expect(formatCoveragePercent(1)).toBe('100 %')
    expect(formatCoveragePercent(0.75)).toBe('75 %')
  })

  it('muestra Confidence correctamente (0–1 → %)', () => {
    expect(formatConfidencePercent(0.8307)).toBe('83.07 %')
  })

  it('muestra Strength en 0–100 sin seniority', () => {
    expect(formatStrength(31)).toBe('31')
    expect(formatEvidenceLevel('STRONG')).not.toMatch(/experto|avanzado|básico/i)
  })

  it('traduce reasons y warnings', () => {
    expect(
      translateReason('ACTIVE: coverage 1 >= 0.55'),
    ).toMatch(/Cobertura suficiente/i)
    expect(
      translateReason('ACTIVE_WITH_CAUTION: strongEvidenceLowCardinalityOverride'),
    ).toMatch(/pocas skills/i)
    expect(
      translateWarning('LOW_CARDINALITY_STRONG_EVIDENCE: especialidad activa'),
    ).toMatch(/concentrada en pocas skills/i)
  })

  it('selecciona default automáticamente (Camilo Frontend)', () => {
    const list = [
      specialty({
        code: 'SOFTWARE_FRONTEND',
        presentationStatus: 'ACTIVE',
        isDefault: true,
        rank: 1,
      }),
      specialty({
        code: 'SOFTWARE_BACKEND',
        presentationStatus: 'ACTIVE',
        rank: 2,
      }),
      specialty({
        code: 'SOFTWARE_API_INTEGRATION',
        presentationStatus: 'EMERGENT',
        rank: 6,
      }),
      specialty({
        code: 'SOFTWARE_HIDDEN_X',
        presentationStatus: 'HIDDEN',
        rank: 99,
      }),
    ]
    expect(pickInitialSpecialtyCode(list, 'SOFTWARE_FRONTEND')).toBe(
      'SOFTWARE_FRONTEND',
    )
    expect(visibleSpecialties(list)).toHaveLength(3)
    const parts = partitionSpecialties(list)
    expect(parts.active).toHaveLength(2)
    expect(parts.emergent).toHaveLength(1)
    expect(parts.active.every((s) => s.presentationStatus !== 'HIDDEN')).toBe(
      true,
    )
  })

  it('fallback a primera ACTIVE si no hay default', () => {
    const list = [
      specialty({
        code: 'SOFTWARE_CLOUD_DEPLOY',
        presentationStatus: 'EMERGENT',
        rank: 2,
      }),
      specialty({
        code: 'SOFTWARE_BACKEND',
        presentationStatus: 'ACTIVE',
        rank: 1,
      }),
    ]
    expect(pickInitialSpecialtyCode(list, null)).toBe('SOFTWARE_BACKEND')
  })
})
