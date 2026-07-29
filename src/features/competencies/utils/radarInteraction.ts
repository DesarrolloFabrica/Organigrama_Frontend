import type { CompetencySkill } from '../types'

const TOOLTIP_SKILL_LIMIT = 5

/**
 * Prioriza skills PRIMARY y completa con SECONDARY.
 * No usa el orden crudo de la respuesta como criterio único.
 */
export function pickTooltipSkillNames(
  skills: CompetencySkill[],
  limit = TOOLTIP_SKILL_LIMIT,
): string[] {
  const primary: string[] = []
  const secondary: string[] = []
  const seen = new Set<string>()

  for (const skill of skills) {
    const name = skill.name?.trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    if (skill.mapping.role === 'PRIMARY') primary.push(name)
    else secondary.push(name)
  }

  return [...primary, ...secondary].slice(0, Math.max(0, limit))
}

export function tooltipSkillOverflowCount(
  totalUnique: number,
  shown: number,
): number {
  return Math.max(0, totalUnique - shown)
}

export function countUniqueSkillNames(skills: CompetencySkill[]): number {
  const seen = new Set<string>()
  for (const skill of skills) {
    const name = skill.name?.trim()
    if (name) seen.add(name)
  }
  return seen.size
}

/**
 * Clave de datos del polígono: solo cambia al montar / persona / dominio / coverages.
 * La selección de eje no debe invalidar esta clave (ni re-animar el polígono).
 */
export function radarPolygonDataKey(
  personId: string,
  domainCode: string,
  coverages: number[],
): string {
  return `${personId}|${domainCode}|${coverages.map((c) => Number(c) || 0).join(',')}`
}

/** Estados visuales independientes: default ≠ selected ≠ hovered. */
export type RadarAxisVisualState = {
  isSelected: boolean
  isDefault: boolean
  isHovered: boolean
}

export function resolveRadarAxisVisualState(params: {
  code: string
  selectedCode: string | null
  hoveredCode: string | null
  isDefault: boolean
}): RadarAxisVisualState {
  return {
    isSelected: params.code === params.selectedCode,
    isDefault: params.isDefault,
    isHovered: params.code === params.hoveredCode,
  }
}

/** En puntero grueso/táctil el detalle inferior sustituye al tooltip flotante. */
export function shouldShowRadarTooltip(params: {
  hoveredCode: string | null
  pointerType: string | null
  coarsePointer: boolean
}): boolean {
  if (!params.hoveredCode) return false
  if (params.coarsePointer) return false
  if (params.pointerType === 'touch') return false
  return true
}
