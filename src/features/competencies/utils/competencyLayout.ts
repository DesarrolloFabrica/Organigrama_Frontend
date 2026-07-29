/**
 * Breakpoints del Explorador según ancho del CONTENEDOR (no del viewport).
 * La ficha lateral suele ser ~360–420 px; dos columnas solo tienen sentido ≥560 px.
 */
export const COMPETENCY_SPLIT_MIN_PX = 560
export const COMPETENCY_METRICS_2COL_MIN_PX = 420
export const COMPETENCY_METRICS_3COL_MIN_PX = 640

export type CompetencyLayoutMode = 'stack' | 'split'
export type CompetencyMetricsColumns = 1 | 2 | 3

export function resolveCompetencyLayout(containerWidthPx: number): {
  mode: CompetencyLayoutMode
  metricsColumns: CompetencyMetricsColumns
} {
  const w = Number.isFinite(containerWidthPx) ? containerWidthPx : 0
  return {
    mode: w >= COMPETENCY_SPLIT_MIN_PX ? 'split' : 'stack',
    metricsColumns:
      w >= COMPETENCY_METRICS_3COL_MIN_PX
        ? 3
        : w >= COMPETENCY_METRICS_2COL_MIN_PX
          ? 2
          : 1,
  }
}

/** Valor de fuerza con escala explícita (no seniority). */
export function formatStrengthScale(strength: number): string {
  const n = Number(strength)
  if (!Number.isFinite(n)) return '—'
  const rounded = Math.round(n * 100) / 100
  return `${rounded} / 100`
}
