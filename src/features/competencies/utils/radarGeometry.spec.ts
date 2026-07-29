import { describe, expect, it } from 'vitest'
import {
  RADAR_LABEL_RADIUS,
  RADAR_MAX_RADIUS,
  RADAR_VIEW_SIZE,
  axisAngle,
  buildCoveragePolygon,
  clamp01,
  coverageToPercent,
  coverageToPoint,
  labelTextAnchor,
  placeTooltipInBounds,
  polygonPointsToPath,
  preferredTooltipSide,
  radarUsefulWidthRatio,
  RADAR_START_ANGLE,
} from './radarGeometry'

describe('radarGeometry', () => {
  it('genera siete ejes con primer ángulo arriba (-90°)', () => {
    expect(axisAngle(0, 7)).toBeCloseTo(RADAR_START_ANGLE, 10)
    expect(axisAngle(1, 7) - axisAngle(0, 7)).toBeCloseTo((2 * Math.PI) / 7, 10)
  })

  it('Coverage 0 queda en el centro', () => {
    const p = coverageToPoint(100, 100, 80, 0, 0)
    expect(p.x).toBeCloseTo(100, 5)
    expect(p.y).toBeCloseTo(100, 5)
  })

  it('Coverage 1 llega al radio máximo', () => {
    const angle = 0
    const p = coverageToPoint(50, 50, 40, angle, 1)
    expect(p.x).toBeCloseTo(50 + 40, 5)
    expect(p.y).toBeCloseTo(50, 5)
  })

  it('calcula polígono de 7 puntos para coverages', () => {
    const coverages = [1, 1, 0.75, 0.5, 0.6667, 0.5, 0.38]
    const points = buildCoveragePolygon(100, 100, 80, coverages)
    expect(points).toHaveLength(7)
    expect(coverageToPercent(1)).toBe(100)
    expect(coverageToPercent(0.38)).toBe(38)
    expect(clamp01(1.5)).toBe(1)
    const path = polygonPointsToPath(points)
    expect(path.startsWith('M ')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('no interpreta Coverage como seniority (solo 0–1 geométrico)', () => {
    const a = coverageToPoint(0, 0, 10, 0, 0.5)
    const b = coverageToPoint(0, 0, 10, 0, 0.5)
    expect(a).toEqual(b)
  })

  it('aprovecha ~80–90 % del ancho útil con labels', () => {
    const ratio = radarUsefulWidthRatio(RADAR_LABEL_RADIUS, RADAR_VIEW_SIZE)
    expect(ratio).toBeGreaterThanOrEqual(0.8)
    expect(ratio).toBeLessThanOrEqual(0.9)
    expect(RADAR_MAX_RADIUS).toBeLessThan(RADAR_LABEL_RADIUS)
  })

  it('alinea etiquetas según posición angular', () => {
    expect(labelTextAnchor(axisAngle(0, 7))).toBe('middle') // Frontend arriba
    expect(labelTextAnchor(axisAngle(1, 7))).toBe('start') // Backend derecha
    expect(labelTextAnchor(axisAngle(5, 7))).toBe('end') // APIs izquierda
    expect(labelTextAnchor(axisAngle(6, 7))).toBe('end') // Cloud izquierda
  })

  it('tooltip permanece dentro del panel', () => {
    const pos = placeTooltipInBounds({
      anchorX: 340,
      anchorY: 40,
      tipW: 240,
      tipH: 160,
      containerW: 360,
      containerH: 360,
      preferredSide: preferredTooltipSide(axisAngle(1, 7)),
    })
    expect(pos.left).toBeGreaterThanOrEqual(8)
    expect(pos.top).toBeGreaterThanOrEqual(8)
    expect(pos.left + 240).toBeLessThanOrEqual(360 - 8)
    expect(pos.top + 160).toBeLessThanOrEqual(360 - 8)
  })
})
