import { describe, expect, it } from 'vitest'
import {
  COMPETENCY_METRICS_2COL_MIN_PX,
  COMPETENCY_METRICS_3COL_MIN_PX,
  COMPETENCY_SPLIT_MIN_PX,
  formatStrengthScale,
  resolveCompetencyLayout,
} from './competencyLayout'

describe('resolveCompetencyLayout', () => {
  it('usa una columna (stack) en contenedor estrecho', () => {
    expect(resolveCompetencyLayout(360).mode).toBe('stack')
    expect(resolveCompetencyLayout(480).mode).toBe('stack')
    expect(resolveCompetencyLayout(COMPETENCY_SPLIT_MIN_PX - 1).mode).toBe(
      'stack',
    )
  })

  it('usa dos columnas solo cuando hay espacio (≥560)', () => {
    expect(resolveCompetencyLayout(COMPETENCY_SPLIT_MIN_PX).mode).toBe('split')
    expect(resolveCompetencyLayout(640).mode).toBe('split')
    expect(resolveCompetencyLayout(800).mode).toBe('split')
  })

  it('métricas: 1 / 2 / 3 según ancho del contenedor', () => {
    expect(resolveCompetencyLayout(360).metricsColumns).toBe(1)
    expect(
      resolveCompetencyLayout(COMPETENCY_METRICS_2COL_MIN_PX).metricsColumns,
    ).toBe(2)
    expect(resolveCompetencyLayout(480).metricsColumns).toBe(2)
    expect(
      resolveCompetencyLayout(COMPETENCY_METRICS_3COL_MIN_PX).metricsColumns,
    ).toBe(3)
    expect(resolveCompetencyLayout(800).metricsColumns).toBe(3)
  })

  it('formato de fuerza con escala 0–100', () => {
    expect(formatStrengthScale(31)).toBe('31 / 100')
  })
})
