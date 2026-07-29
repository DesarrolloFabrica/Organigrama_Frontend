import type { CompetencyDomainQualification } from '../types'

/** Etiquetas de presentación — no exponer códigos crudos al usuario. */
export function formatQualificationLabel(
  qualification: CompetencyDomainQualification,
): string {
  switch (qualification) {
    case 'PRIMARY_MATCH':
      return 'Práctica profesional principal'
    case 'SECONDARY_SIGNAL':
      return 'Capacidades profesionales complementarias'
    case 'OUTSIDE':
      return 'Fuera de práctica'
    case 'INSUFFICIENT_EVIDENCE':
      return 'Evidencia profesional en construcción'
    default:
      return 'Resultado profesional'
  }
}

export function formatCdrClassificationLabel(classification: string): string {
  switch (classification.toUpperCase()) {
    case 'DOMINANT_PRACTICE':
      return 'Práctica profesional predominante'
    case 'PRIMARY_WITH_COMPLEMENTARY':
      return 'Práctica principal con capacidades complementarias'
    case 'HYBRID_PRACTICE':
      return 'Perfil profesional híbrido'
    case 'AMBIGUOUS_SECONDARY':
      return 'Señales secundarias sin práctica dominante'
    default:
      return classification.replace(/_/g, ' ').toLowerCase()
  }
}
