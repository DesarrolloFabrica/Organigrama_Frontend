import type { CompetencySpecialtySummary } from '../types'
import { visibleSpecialties } from './competencyFormat'

/**
 * Orden estable de ejes del radar por dominio.
 * Sentido horario desde arriba. No depende del ranking dinámico.
 */
export const SOFTWARE_RADAR_AXIS_ORDER = [
  'SOFTWARE_FRONTEND',
  'SOFTWARE_BACKEND',
  'SOFTWARE_DATA',
  'SOFTWARE_AI_APPLIED',
  'SOFTWARE_ENGINEERING_QUALITY',
  'SOFTWARE_API_INTEGRATION',
  'SOFTWARE_CLOUD_DEPLOY',
] as const

export const VISUAL_DESIGN_RADAR_AXIS_ORDER = [
  'VISUAL_GRAPHIC',
  'VISUAL_IDENTITY',
  'VISUAL_EDITORIAL',
  'VISUAL_DIGITAL_ASSETS',
  'VISUAL_UI',
] as const

export type SoftwareRadarAxisCode = (typeof SOFTWARE_RADAR_AXIS_ORDER)[number]

const RADAR_AXIS_ORDER_BY_DOMAIN: Record<string, readonly string[]> = {
  SOFTWARE: SOFTWARE_RADAR_AXIS_ORDER,
  VISUAL_DESIGN: VISUAL_DESIGN_RADAR_AXIS_ORDER,
}

const SHORT_LABELS: Record<string, string> = {
  SOFTWARE_FRONTEND: 'Frontend',
  SOFTWARE_BACKEND: 'Backend',
  SOFTWARE_DATA: 'Bases de datos',
  SOFTWARE_AI_APPLIED: 'IA aplicada',
  SOFTWARE_ENGINEERING_QUALITY: 'Ing. y calidad',
  SOFTWARE_API_INTEGRATION: 'APIs',
  SOFTWARE_CLOUD_DEPLOY: 'Cloud',
  VISUAL_GRAPHIC: 'Gráfico',
  VISUAL_IDENTITY: 'Identidad',
  VISUAL_EDITORIAL: 'Editorial',
  VISUAL_DIGITAL_ASSETS: 'Recursos digitales',
  VISUAL_UI: 'Interfaces',
}

export function radarAxisOrderForDomain(domainCode?: string | null): readonly string[] {
  if (!domainCode) return []
  return RADAR_AXIS_ORDER_BY_DOMAIN[domainCode.toUpperCase()] ?? []
}

export function radarShortLabel(code: string, fallbackName: string): string {
  return SHORT_LABELS[code] ?? fallbackName
}

/**
 * Dos líneas solo en nombres largos; el resto en una sola.
 */
export function splitRadarLabel(short: string): string[] {
  const TWO_LINE: Record<string, [string, string]> = {
    'Bases de datos': ['Bases de', 'datos'],
    'Ing. y calidad': ['Ing. y', 'calidad'],
    'IA aplicada': ['IA', 'aplicada'],
    'Recursos digitales': ['Recursos', 'digitales'],
  }
  return TWO_LINE[short] ?? [short]
}

/**
 * Ordena especialidades visibles según el orden canónico del dominio.
 * Si el dominio no tiene orden registrado, usa rank y luego code.
 */
export function orderSpecialtiesForRadar(
  specialties: CompetencySpecialtySummary[],
  domainCode?: string | null,
): CompetencySpecialtySummary[] {
  const visible = visibleSpecialties(specialties)
  const byCode = new Map(visible.map((s) => [s.code, s]))
  const ordered: CompetencySpecialtySummary[] = []
  const axisOrder = radarAxisOrderForDomain(domainCode)

  for (const code of axisOrder) {
    const hit = byCode.get(code)
    if (hit) {
      ordered.push(hit)
      byCode.delete(code)
    }
  }

  const rest = [...byCode.values()].sort((a, b) => {
    const rankDiff = (a.rank ?? 0) - (b.rank ?? 0)
    if (rankDiff !== 0) return rankDiff
    return a.code.localeCompare(b.code)
  })
  return [...ordered, ...rest]
}

export function buildRadarAriaLabel(specialty: CompetencySpecialtySummary): string {
  const status =
    specialty.presentationStatus === 'ACTIVE' ? 'activa' : 'emergente'
  const principal = specialty.isDefault ? ' y principal' : ''
  const pct = Math.round(Number(specialty.metrics.coverage) * 100)
  return (
    `${specialty.name}, especialidad ${status}${principal}, ` +
    `cobertura ${pct} por ciento, ` +
    `${specialty.metrics.evidencedSkillCount} de ${specialty.metrics.mappedSkillCount} skills respaldadas.`
  )
}
