import { describe, expect, it } from 'vitest'
import {
  RADAR_LABEL_RADIUS,
  RADAR_MAX_RADIUS,
  RADAR_VIEW_SIZE,
  RADAR_ZERO_VISUAL_FLOOR_RATIO,
  RADAR_START_ANGLE,
  axisAngle,
  buildCoverageClosedPath,
  buildCoveragePolygon,
  clamp01,
  coverageToPercent,
  coverageToPoint,
  coverageToRenderRatio,
  labelTextAnchor,
  placeTooltipInBounds,
  polygonPointsToPath,
  preferredTooltipSide,
  radarUsefulWidthRatio,
  resolveRadarDisplayCoverage,
  samePoint,
} from './radarGeometry'

function assertClosedNGon(coverages: number[]) {
  const cx = 230
  const cy = 230
  const maxR = 118
  const points = buildCoveragePolygon(cx, cy, maxR, coverages)
  expect(points).toHaveLength(coverages.length)
  const path = polygonPointsToPath(points)
  expect(path.startsWith('M ')).toBe(true)
  expect(path.trim().endsWith('Z')).toBe(true)
  const lCount = (path.match(/ L /g) ?? []).length
  expect(lCount).toBe(coverages.length - 1)
  // Ceros: cerca del centro en su eje, no colapsados al mismo punto
  const zeroIdx = coverages
    .map((c, i) => (c === 0 ? i : -1))
    .filter((i) => i >= 0)
  for (const i of zeroIdx) {
    const dist = Math.hypot(points[i].x - cx, points[i].y - cy)
    expect(dist).toBeCloseTo(maxR * RADAR_ZERO_VISUAL_FLOOR_RATIO, 5)
    expect(coverageToPercent(coverages[i])).toBe(0)
  }
  if (zeroIdx.length >= 2) {
    expect(samePoint(points[zeroIdx[0]], points[zeroIdx[1]])).toBe(false)
  }
  return { points, path, closed: buildCoverageClosedPath(cx, cy, maxR, coverages) }
}

describe('radarGeometry', () => {
  it('uses backend displayCoverage and falls back safely for historical profiles', () => {
    expect(resolveRadarDisplayCoverage(82.3, 86.9)).toBe(86.9)
    expect(resolveRadarDisplayCoverage(32.4, undefined)).toBe(32.4)
    expect(resolveRadarDisplayCoverage(50, 0)).toBe(0)
  })

  it('genera siete ejes con primer ángulo arriba (-90°)', () => {
    expect(axisAngle(0, 7)).toBeCloseTo(RADAR_START_ANGLE, 10)
    expect(axisAngle(1, 7) - axisAngle(0, 7)).toBeCloseTo((2 * Math.PI) / 7, 10)
  })

  it('Coverage 0 usa floor visual (no centro exacto) y tooltip 0%', () => {
    expect(coverageToRenderRatio(0)).toBe(RADAR_ZERO_VISUAL_FLOOR_RATIO)
    expect(coverageToPercent(0)).toBe(0)
    const p = coverageToPoint(100, 100, 80, 0, 0)
    expect(p.x).toBeCloseTo(100 + 80 * RADAR_ZERO_VISUAL_FLOOR_RATIO, 5)
    expect(p.y).toBeCloseTo(100, 5)
  })

  it('no aplica floor a valores bajos no-cero', () => {
    expect(coverageToRenderRatio(0.05)).toBe(0.05)
    expect(coverageToRenderRatio(0.01)).toBe(0.01)
    expect(coverageToPercent(0.05)).toBe(5)
  })

  it('mantiene N vértices incluyendo ceros', () => {
    const coverages = [1, 0, 0.5, 0, 0.2]
    const points = buildCoveragePolygon(100, 100, 80, coverages)
    expect(points).toHaveLength(5)
    expect(samePoint(points[1], points[3])).toBe(false)
  })

  describe('polígono cerrado con zero visual floor (casos A–E)', () => {
    it('A: [100,60,0,45,0,90,80]', () => {
      const r = assertClosedNGon([1, 0.6, 0, 0.45, 0, 0.9, 0.8])
      expect(r.path.endsWith('Z')).toBe(true)
    })

    it('B: [0,0,100,0,0,0,0]', () => {
      const r = assertClosedNGon([0, 0, 1, 0, 0, 0, 0])
      expect(r.points).toHaveLength(7)
    })

    it('C: todos 0', () => {
      const r = assertClosedNGon([0, 0, 0, 0, 0, 0, 0])
      expect(r.points).toHaveLength(7)
      // heptágono pequeño alrededor del centro
      for (let i = 1; i < r.points.length; i += 1) {
        expect(samePoint(r.points[i], r.points[0])).toBe(false)
      }
    })

    it('D: todos 100', () => {
      assertClosedNGon([1, 1, 1, 1, 1, 1, 1])
    })

    it('E: [5,0,8,0,12,0,3]', () => {
      assertClosedNGon([0.05, 0, 0.08, 0, 0.12, 0, 0.03])
    })
  })

  it('fixture Santiago Visual Design: path único cerrado, ceros ≠ centro', () => {
    const coverages = [0.709, 0.709, 0, 0.709, 0, 1, 1]
    const { points, path } = assertClosedNGon(coverages)
    expect(path.split(/(?=M )/g).filter(Boolean)).toHaveLength(1)
    expect(coverageToPercent(coverages[2])).toBe(0)
    expect(coverageToPercent(coverages[4])).toBe(0)
    expect(points[3].y).toBeGreaterThan(230) // Interfaz de producto abajo-derecha
  })

  it('Coverage 1 llega al radio máximo', () => {
    const p = coverageToPoint(50, 50, 40, 0, 1)
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

  it('aprovecha ~80–90 % del ancho útil con labels', () => {
    const ratio = radarUsefulWidthRatio(RADAR_LABEL_RADIUS, RADAR_VIEW_SIZE)
    expect(ratio).toBeGreaterThanOrEqual(0.8)
    expect(ratio).toBeLessThanOrEqual(0.9)
    expect(RADAR_MAX_RADIUS).toBeLessThan(RADAR_LABEL_RADIUS)
  })

  it('alinea etiquetas según posición angular', () => {
    expect(labelTextAnchor(axisAngle(0, 7))).toBe('middle')
    expect(labelTextAnchor(axisAngle(1, 7))).toBe('start')
    expect(labelTextAnchor(axisAngle(5, 7))).toBe('end')
    expect(labelTextAnchor(axisAngle(6, 7))).toBe('end')
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
