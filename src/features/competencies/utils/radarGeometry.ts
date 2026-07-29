/**
 * Geometría pura del radar de especialidades (heptágono / n-gon).
 * Coverage 0–1 → radio normalizado. No usa Strength ni Confidence.
 */

export const RADAR_START_ANGLE = -Math.PI / 2

/** viewBox sugerido: labels cerca del borde (~80–90 % del ancho útil). */
export const RADAR_VIEW_SIZE = 360
export const RADAR_CENTER = RADAR_VIEW_SIZE / 2
/** Radio máximo del polígono (~86 % del semieje útil antes de labels). */
export const RADAR_MAX_RADIUS = 130
/** Ancla de etiqueta, cerca del extremo del eje. */
export const RADAR_LABEL_RADIUS = 148
export const RADAR_HIT_RADIUS = 20
export const RADAR_POINT_RADIUS = 4.5

export type Point2D = { x: number; y: number }

export type SvgTextAnchor = 'start' | 'middle' | 'end'

/** Ángulo del eje `index` (0-based), primer eje arriba. */
export function axisAngle(
  index: number,
  totalAxes: number,
  startAngle: number = RADAR_START_ANGLE,
): number {
  if (totalAxes <= 0) return startAngle
  return startAngle + (index * 2 * Math.PI) / totalAxes
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleRad: number,
): Point2D {
  return {
    x: centerX + Math.cos(angleRad) * radius,
    y: centerY + Math.sin(angleRad) * radius,
  }
}

/**
 * Punto del polígono para un Coverage (0–1).
 * Coverage 0 → centro; Coverage 1 → radio máximo.
 */
export function coverageToPoint(
  centerX: number,
  centerY: number,
  maxRadius: number,
  angleRad: number,
  coverage: number,
): Point2D {
  const normalized = clamp01(coverage)
  return polarToCartesian(centerX, centerY, maxRadius * normalized, angleRad)
}

export function clamp01(value: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  if (n <= 0) return 0
  if (n >= 1) return 1
  return n
}

/** Coverage 0–1 → porcentaje 0–100 para etiquetas. */
export function coverageToPercent(coverage: number): number {
  return Math.round(clamp01(coverage) * 100)
}

export function buildAxisAngles(
  totalAxes: number,
  startAngle: number = RADAR_START_ANGLE,
): number[] {
  return Array.from({ length: totalAxes }, (_, i) =>
    axisAngle(i, totalAxes, startAngle),
  )
}

/** Anillos de referencia a 20…100 %. */
export function buildRingLevels(steps = 5): number[] {
  return Array.from({ length: steps }, (_, i) => (i + 1) / steps)
}

export function polygonPointsToPath(points: Point2D[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((p) => `L ${p.x} ${p.y}`),
    'Z',
  ].join(' ')
}

export function buildCoveragePolygon(
  centerX: number,
  centerY: number,
  maxRadius: number,
  coverages: number[],
  startAngle: number = RADAR_START_ANGLE,
): Point2D[] {
  const n = coverages.length
  return coverages.map((coverage, index) =>
    coverageToPoint(
      centerX,
      centerY,
      maxRadius,
      axisAngle(index, n, startAngle),
      coverage,
    ),
  )
}

export function buildRingPolygon(
  centerX: number,
  centerY: number,
  maxRadius: number,
  level: number,
  totalAxes: number,
  startAngle: number = RADAR_START_ANGLE,
): Point2D[] {
  return Array.from({ length: totalAxes }, (_, index) =>
    polarToCartesian(
      centerX,
      centerY,
      maxRadius * clamp01(level),
      axisAngle(index, totalAxes, startAngle),
    ),
  )
}

/**
 * Alineación de etiqueta según ángulo del eje.
 * Izquierda → end; derecha → start; arriba/abajo → middle.
 */
export function labelTextAnchor(angleRad: number): SvgTextAnchor {
  const cos = Math.cos(angleRad)
  if (Math.abs(cos) < 0.38) return 'middle'
  return cos > 0 ? 'start' : 'end'
}

/** Desplazamiento vertical sutil del label según hemisferio. */
export function labelDy(angleRad: number): number {
  const sin = Math.sin(angleRad)
  if (sin < -0.55) return -2
  if (sin > 0.55) return 4
  return 0
}

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

/** Lado preferido del tooltip: opuesto al eje para no tapar el punto. */
export function preferredTooltipSide(angleRad: number): TooltipSide {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  if (Math.abs(sin) >= Math.abs(cos)) {
    return sin < 0 ? 'bottom' : 'top'
  }
  return cos > 0 ? 'left' : 'right'
}

export function placeTooltipInBounds(params: {
  anchorX: number
  anchorY: number
  tipW: number
  tipH: number
  containerW: number
  containerH: number
  preferredSide: TooltipSide
  gap?: number
  margin?: number
}): { left: number; top: number } {
  const {
    anchorX,
    anchorY,
    tipW,
    tipH,
    containerW,
    containerH,
    preferredSide,
    gap = 10,
    margin = 8,
  } = params

  const candidates: TooltipSide[] = [
    preferredSide,
    ...(['top', 'bottom', 'left', 'right'] as TooltipSide[]).filter(
      (s) => s !== preferredSide,
    ),
  ]

  const trySide = (side: TooltipSide): { left: number; top: number } => {
    switch (side) {
      case 'right':
        return { left: anchorX + gap, top: anchorY - tipH / 2 }
      case 'left':
        return { left: anchorX - tipW - gap, top: anchorY - tipH / 2 }
      case 'bottom':
        return { left: anchorX - tipW / 2, top: anchorY + gap }
      case 'top':
      default:
        return { left: anchorX - tipW / 2, top: anchorY - tipH - gap }
    }
  }

  const fits = (pos: { left: number; top: number }) =>
    pos.left >= margin &&
    pos.top >= margin &&
    pos.left + tipW <= containerW - margin &&
    pos.top + tipH <= containerH - margin

  for (const side of candidates) {
    const pos = trySide(side)
    if (fits(pos)) return pos
  }

  const fallback = trySide(preferredSide)
  return {
    left: Math.min(
      Math.max(margin, fallback.left),
      Math.max(margin, containerW - tipW - margin),
    ),
    top: Math.min(
      Math.max(margin, fallback.top),
      Math.max(margin, containerH - tipH - margin),
    ),
  }
}

/** Fracción del diámetro de labels respecto al viewBox (objetivo ~0.80–0.90). */
export function radarUsefulWidthRatio(
  labelRadius: number,
  viewSize: number,
): number {
  if (viewSize <= 0) return 0
  return (2 * labelRadius) / viewSize
}

export type RadarAxisGeometry = {
  index: number
  angle: number
  tip: Point2D
  valuePoint: Point2D
  labelAnchor: Point2D
  textAnchor: SvgTextAnchor
  labelDy: number
}

export function buildRadarAxesGeometry(params: {
  centerX: number
  centerY: number
  maxRadius: number
  labelRadius: number
  coverages: number[]
  startAngle?: number
}): RadarAxisGeometry[] {
  const {
    centerX,
    centerY,
    maxRadius,
    labelRadius,
    coverages,
    startAngle = RADAR_START_ANGLE,
  } = params
  const n = coverages.length
  return coverages.map((coverage, index) => {
    const angle = axisAngle(index, n, startAngle)
    return {
      index,
      angle,
      tip: polarToCartesian(centerX, centerY, maxRadius, angle),
      valuePoint: coverageToPoint(
        centerX,
        centerY,
        maxRadius,
        angle,
        coverage,
      ),
      labelAnchor: polarToCartesian(centerX, centerY, labelRadius, angle),
      textAnchor: labelTextAnchor(angle),
      labelDy: labelDy(angle),
    }
  })
}
