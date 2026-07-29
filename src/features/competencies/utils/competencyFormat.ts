import type {
  CompetencyPresentationStatus,
  CompetencySpecialtySummary,
} from '../types'

/** Coverage 0–1 → porcentaje entero redondeado. */
export function formatCoveragePercent(coverage: number): string {
  const pct = Math.round(Number(coverage) * 100)
  return `${pct} %`
}

/** Confidence 0–1 → porcentaje con hasta 2 decimales. */
export function formatConfidencePercent(confidence: number): string {
  const n = Number(confidence)
  if (!Number.isFinite(n)) return '—'
  const pct = Math.round(n * 10000) / 100
  return `${pct} %`
}

/** Strength 0–100 sin reinterpretar como seniority. */
export function formatStrength(strength: number): string {
  const n = Number(strength)
  if (!Number.isFinite(n)) return '—'
  return String(Math.round(n * 100) / 100)
}

export function formatEvidenceLevel(level: string): string {
  switch (level.toUpperCase()) {
    case 'STRONG':
      return 'Evidencia fuerte'
    case 'MODERATE':
      return 'Evidencia moderada'
    case 'WEAK':
      return 'Evidencia débil'
    case 'NONE':
      return 'Sin evidencia'
    default:
      return level
  }
}

export function formatPresentationStatus(
  status: CompetencyPresentationStatus,
): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activa'
    case 'EMERGENT':
      return 'Emergente'
    case 'HIDDEN':
      return 'Oculta'
    default:
      return status
  }
}

export function formatSourceType(sourceType: string): string {
  const map: Record<string, string> = {
    SKILLS_SECTION: 'Sección de habilidades',
    WORK_EXPERIENCE: 'Experiencia laboral',
    PROFILE_SUMMARY: 'Resumen del perfil',
    EDUCATION: 'Formación',
    OTHER: 'Otra procedencia',
  }
  return map[sourceType] ?? sourceType.replace(/_/g, ' ').toLowerCase()
}

/**
 * Traduce reasons del motor a lenguaje legible.
 * No modifica códigos del backend: solo presentación.
 */
export function translateReason(raw: string): string {
  const lower = raw.toLowerCase()

  if (
    lower.includes('active_with_caution') ||
    lower.includes('strongevidencelowcardinalityoverride') ||
    lower.includes('strong_evidence_low_cardinality')
  ) {
    return 'La evidencia es fuerte, aunque se concentra en pocas skills.'
  }
  if (lower.includes('low_cardinality') || lower.includes('low cardinality')) {
    return 'La especialidad tiene pocas skills asociadas.'
  }
  if (
    lower.startsWith('active:') ||
    (lower.includes('coverage') && lower.includes('>='))
  ) {
    return 'Cobertura suficiente para considerarse una especialidad activa.'
  }
  if (lower.startsWith('emergent:') && lower.includes('coverage')) {
    return 'La cobertura aún no alcanza el umbral de especialidad activa.'
  }
  if (lower.includes('mappedskillcount') && lower.includes('<')) {
    return 'Hay pocas skills mapeadas a esta especialidad.'
  }
  if (lower.includes('evidencedskillcount') && lower.includes('<')) {
    return 'Hay pocas skills con evidencia en esta especialidad.'
  }
  if (lower.includes('dominance') || lower.includes('single-skill')) {
    return 'El resultado se concentra en pocas skills dominantes.'
  }
  if (lower.includes('mappedskillcount') && lower.includes('>=')) {
    return 'Cantidad de skills mapeadas dentro del umbral esperado.'
  }
  if (lower.includes('evidencedskillcount') && lower.includes('>=')) {
    return 'Cantidad de skills con evidencia dentro del umbral esperado.'
  }

  // Fallback: limpiar prefijos técnicos sin inventar significado.
  return raw
    .replace(/^ACTIVE:\s*/i, '')
    .replace(/^EMERGENT:\s*/i, '')
    .replace(/^ACTIVE_WITH_CAUTION:\s*/i, '')
}

export function translateWarning(raw: string): string {
  const upper = raw.toUpperCase()
  if (upper.includes('LOW_CARDINALITY_STRONG_EVIDENCE')) {
    return 'La evidencia encontrada es fuerte, pero está concentrada en pocas skills.'
  }
  if (upper.includes('STALE_')) {
    return 'Este resultado puede estar desactualizado respecto a la hoja de vida actual.'
  }
  return raw.replace(/_/g, ' ').toLowerCase()
}

/** Especialidades visibles (sin HIDDEN). */
export function visibleSpecialties(
  specialties: CompetencySpecialtySummary[],
): CompetencySpecialtySummary[] {
  return specialties.filter((s) => s.presentationStatus !== 'HIDDEN')
}

export function partitionSpecialties(specialties: CompetencySpecialtySummary[]): {
  active: CompetencySpecialtySummary[]
  emergent: CompetencySpecialtySummary[]
} {
  const visible = visibleSpecialties(specialties)
  return {
    active: visible.filter((s) => s.presentationStatus === 'ACTIVE'),
    emergent: visible.filter((s) => s.presentationStatus === 'EMERGENT'),
  }
}

/**
 * Selección inicial: default → primera ACTIVE → primera EMERGENT.
 */
export function pickInitialSpecialtyCode(
  specialties: CompetencySpecialtySummary[],
  defaultSpecialtyCode: string | null | undefined,
): string | null {
  const visible = visibleSpecialties(specialties)
  if (visible.length === 0) return null

  if (defaultSpecialtyCode) {
    const found = visible.find((s) => s.code === defaultSpecialtyCode)
    if (found) return found.code
  }

  const firstActive = visible.find((s) => s.presentationStatus === 'ACTIVE')
  if (firstActive) return firstActive.code

  return visible[0]?.code ?? null
}

export function formatEvaluatedAt(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Solo desarrollo local: no forzar auditoría en producción. */
export function shouldIncludeCompetencyAudit(): boolean {
  return Boolean(import.meta.env.DEV)
}
