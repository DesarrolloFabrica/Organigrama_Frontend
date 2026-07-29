import { describe, expect, it } from 'vitest'
import type { CompetencySpecialtySummary } from '../types'
import {
  buildRadarAriaLabel,
  orderSpecialtiesForRadar,
  radarShortLabel,
  splitRadarLabel,
  SOFTWARE_RADAR_AXIS_ORDER,
} from './radarLabels'
import { camiloCompetencySummaryFixture } from '../fixtures/camiloSummary'
import { coverageToPercent } from './radarGeometry'

function spec(
  code: string,
  rank: number,
  status: 'ACTIVE' | 'EMERGENT' | 'HIDDEN' = 'ACTIVE',
): CompetencySpecialtySummary {
  return {
    code,
    name: code,
    presentationStatus: status,
    isDefault: code === 'SOFTWARE_FRONTEND',
    rank,
    warnings: [],
    metrics: {
      mappedSkillCount: 1,
      evidencedSkillCount: 1,
      coverage: 0.5,
      confidence: 0.5,
      strength: 10,
    },
  }
}

describe('radarLabels', () => {
  it('mantiene orden estable de 7 ejes (no por ranking)', () => {
    const shuffled = [
      spec('SOFTWARE_CLOUD_DEPLOY', 7, 'EMERGENT'),
      spec('SOFTWARE_FRONTEND', 1),
      spec('SOFTWARE_AI_APPLIED', 4),
      spec('SOFTWARE_BACKEND', 2),
      spec('SOFTWARE_DATA', 3),
      spec('SOFTWARE_ENGINEERING_QUALITY', 5),
      spec('SOFTWARE_API_INTEGRATION', 6, 'EMERGENT'),
      spec('SOFTWARE_HIDDEN_X', 99, 'HIDDEN'),
    ]
    const ordered = orderSpecialtiesForRadar(shuffled, 'SOFTWARE')
    expect(ordered.map((s) => s.code)).toEqual([...SOFTWARE_RADAR_AXIS_ORDER])
    expect(ordered).toHaveLength(7)
  })

  it('etiquetas cortas del radar', () => {
    expect(radarShortLabel('SOFTWARE_FRONTEND', 'X')).toBe('Frontend')
    expect(radarShortLabel('SOFTWARE_ENGINEERING_QUALITY', 'X')).toBe(
      'Ing. y calidad',
    )
    expect(splitRadarLabel('Ing. y calidad')).toEqual(['Ing. y', 'calidad'])
    expect(splitRadarLabel('Frontend')).toEqual(['Frontend'])
  })

  it('distingue principal y EMERGENT en datos de entrada', () => {
    const ordered = orderSpecialtiesForRadar(
      [
        spec('SOFTWARE_FRONTEND', 1),
        spec('SOFTWARE_API_INTEGRATION', 6, 'EMERGENT'),
      ],
      'SOFTWARE',
    )
    expect(ordered[0].isDefault).toBe(true)
    expect(
      ordered.find((s) => s.code === 'SOFTWARE_API_INTEGRATION')
        ?.presentationStatus,
    ).toBe('EMERGENT')
  })

  it('aria-label anuncia cobertura, no seniority', () => {
    const frontend = {
      ...spec('SOFTWARE_FRONTEND', 1),
      name: 'Desarrollo frontend',
      metrics: {
        mappedSkillCount: 11,
        evidencedSkillCount: 11,
        coverage: 1,
        confidence: 0.8,
        strength: 31,
      },
    }
    const label = buildRadarAriaLabel(frontend)
    expect(label).toContain('Desarrollo frontend')
    expect(label).toContain('principal')
    expect(label).toMatch(/cobertura 100 por ciento/)
    expect(label.toLowerCase()).not.toContain('seniority')
  })

  it('fixture Camilo mapea Coverage esperado en orden de radar', () => {
    const domain = camiloCompetencySummaryFixture.domains[0]
    const ordered = orderSpecialtiesForRadar(domain.specialties, 'SOFTWARE')
    expect(ordered.map((s) => coverageToPercent(s.metrics.coverage))).toEqual([
      100, 100, 75, 50, 67, 50, 38,
    ])
    expect(ordered[0].code).toBe('SOFTWARE_FRONTEND')
    expect(ordered[0].isDefault).toBe(true)
  })
})
