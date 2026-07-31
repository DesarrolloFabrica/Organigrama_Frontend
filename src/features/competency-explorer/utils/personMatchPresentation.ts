/**
 * Presentación pura del ranking (sin React).
 * Facilita pruebas sin testing-library.
 */

export function personInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  const first = parts[0]![0] ?? ''
  const last = parts[parts.length - 1]![0] ?? ''
  return `${first}${last}`.toUpperCase()
}

export function matchModeLabel(mode: 'ANY' | 'ALL'): string {
  return mode === 'ANY' ? 'Coincidencia amplia' : 'Coincidencia exacta'
}

export function visibleItemsWithOverflow<T>(
  items: T[],
  maxVisible: number,
): { visible: T[]; overflow: number } {
  if (items.length <= maxVisible) {
    return { visible: items, overflow: 0 }
  }
  return {
    visible: items.slice(0, maxVisible),
    overflow: items.length - maxVisible,
  }
}

export function resolveCatalogName(
  code: string,
  catalog: ReadonlyArray<{ code: string; name: string }>,
): string {
  return catalog.find((item) => item.code === code)?.name ?? code
}

export function matchDetailToggleLabel(isExpanded: boolean): string {
  return isExpanded ? 'Ocultar detalle' : 'Ver coincidencia'
}

export type RankingCriterionCounts = {
  domains: number
  specialties: number
  skills: number
}

function pluralPart(
  count: number,
  singular: string,
  plural: string,
): string | null {
  if (count <= 0) return null
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

/** Composición compacta: "1 dominio · 2 especialidades · 1 skill" */
export function rankingCriteriaComposition(
  counts: RankingCriterionCounts,
): string {
  return [
    pluralPart(counts.domains, 'dominio', 'dominios'),
    pluralPart(counts.specialties, 'especialidad', 'especialidades'),
    pluralPart(counts.skills, 'skill', 'skills'),
  ]
    .filter(Boolean)
    .join(' · ')
}

export function rankingSummaryText(
  peopleCount: number,
  counts: RankingCriterionCounts,
): string {
  const people =
    peopleCount === 1
      ? '1 persona coincide'
      : `${peopleCount} personas coinciden`
  const total = counts.domains + counts.specialties + counts.skills
  if (total === 0) return `${people} con la consulta`
  const criteria =
    total === 1 ? '1 criterio seleccionado' : `${total} criterios seleccionados`
  return `${people} con ${criteria}`
}

export function matchDetailSummary(
  matchedCount: number,
  selectedCount: number,
): string {
  return `Coincide con ${matchedCount} de ${selectedCount} criterios seleccionados.`
}

export function matchPercentageFormula(
  matchedCount: number,
  selectedCount: number,
  matchPercentage: number,
): string {
  return `${matchedCount} coincidencias ÷ ${selectedCount} criterios = ${matchPercentage} %`
}

export function fullMatchCoverageMessage(): string {
  return 'Coincide con todos los criterios seleccionados.'
}

export function missingSkillsLabel(count: number): string {
  if (count <= 0) return ''
  return count === 1 ? 'Falta 1 skill' : `Faltan ${count} skills`
}

export function missingSkillsHeading(): string {
  return 'No se encontró coincidencia con'
}

export function activeQueryPeopleLabel(
  resultCount: number | null,
): string | null {
  if (resultCount == null) return null
  if (resultCount === 0) return 'Sin coincidencias'
  return `${resultCount} persona${resultCount === 1 ? '' : 's'}`
}

export function restrictiveCriterionTypeLabel(
  type: 'DOMAIN' | 'SPECIALTY' | 'SKILL',
): string {
  if (type === 'DOMAIN') return 'Dominio más restrictivo'
  if (type === 'SPECIALTY') return 'Especialidad más restrictiva'
  return 'Skill más restrictiva'
}
