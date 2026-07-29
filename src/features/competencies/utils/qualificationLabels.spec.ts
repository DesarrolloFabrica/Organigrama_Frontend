import { describe, expect, it } from 'vitest'
import {
  formatCdrClassificationLabel,
  formatQualificationLabel,
} from './qualificationLabels'

describe('qualificationLabels', () => {
  it('traduce qualifications sin códigos crudos', () => {
    expect(formatQualificationLabel('PRIMARY_MATCH')).toBe(
      'Práctica profesional principal',
    )
    expect(formatQualificationLabel('SECONDARY_SIGNAL')).toBe(
      'Capacidades profesionales complementarias',
    )
    expect(formatQualificationLabel('OUTSIDE')).toBe('Fuera de práctica')
    expect(formatQualificationLabel('INSUFFICIENT_EVIDENCE')).toBe(
      'Evidencia profesional en construcción',
    )
  })

  it('traduce CDR persistido sin inventar reglas', () => {
    expect(formatCdrClassificationLabel('PRIMARY_WITH_COMPLEMENTARY')).toBe(
      'Práctica principal con capacidades complementarias',
    )
    expect(formatCdrClassificationLabel('HYBRID_PRACTICE')).toBe(
      'Perfil profesional híbrido',
    )
    expect(formatCdrClassificationLabel('DOMINANT_PRACTICE')).toBe(
      'Práctica profesional predominante',
    )
  })
})
