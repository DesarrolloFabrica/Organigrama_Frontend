import { useId, useMemo, useState } from 'react'
import {
  RADAR_POINT_RADIUS,
  buildCoverageClosedPath,
  buildRadarAxesGeometry,
  buildRingLevels,
  buildRingPolygon,
  coverageToPercent,
  polygonPointsToPath,
  resolveRadarDisplayCoverage,
  type RadarAxisGeometry,
} from '../competencies/utils/radarGeometry'
import {
  inferRadarEvidenceState,
  radarEvidenceStateLabel,
  type RadarEvidenceState,
} from '../competencies/utils/radarEvidenceState'

type Axis = {
  dimensionCode: string
  label: string
  relativeCoverage: number
  displayCoverage?: number
  rawScore?: number
  evidenceState?: RadarEvidenceState
}

type Props = {
  axes: Axis[]
  debug?: boolean
}

/** ViewBox ampliado para labels multilínea sin recorte. */
const VIEW = 460
const CX = VIEW / 2
const CY = VIEW / 2
/** Polígono más grande relativo al viewBox; deja margen exterior para texto. */
const MAX_R = 118
const LABEL_R = 168
const LINE_HEIGHT = 12
const MAX_CHARS_PER_LINE = 14

function wrapLabel(label: string, maxChars = MAX_CHARS_PER_LINE): string[] {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return [label]
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
      continue
    }
    if (current) lines.push(current)
    if (word.length > maxChars) {
      let rest = word
      while (rest.length > maxChars) {
        lines.push(rest.slice(0, maxChars))
        rest = rest.slice(maxChars)
      }
      current = rest
    } else {
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

function labelBlockDy(lineCount: number, baseDy: number): number {
  return baseDy - ((lineCount - 1) * LINE_HEIGHT) / 2
}

/**
 * Radar de Competency Dimensions (preview MC1).
 * Solo presentación; scores/fórmula intactos.
 *
 * Un único path cerrado (fill+stroke). Coverage 0 usa floor visual en
 * coordenadas SVG; tooltips/aria siguen mostrando 0%.
 */
export function Mc1DimensionRadar({ axes, debug = false }: Props) {
  const gradId = useId().replace(/:/g, '')
  const [active, setActive] = useState<string | null>(null)
  const coverages = useMemo(
    () =>
      axes.map(
        (a) =>
          Math.max(
            0,
            Math.min(
              100,
              resolveRadarDisplayCoverage(
                a.relativeCoverage,
                a.displayCoverage,
              ),
            ),
          ) / 100,
      ),
    [axes],
  )

  const geometry = useMemo(
    () =>
      buildRadarAxesGeometry({
        centerX: CX,
        centerY: CY,
        maxRadius: MAX_R,
        labelRadius: LABEL_R,
        coverages,
      }),
    [coverages],
  )

  const polygon = useMemo(
    () => buildCoverageClosedPath(CX, CY, MAX_R, coverages),
    [coverages],
  )

  const rings = useMemo(() => {
    const levels = buildRingLevels(5)
    return levels.map((level: number) =>
      polygonPointsToPath(buildRingPolygon(CX, CY, MAX_R, level, axes.length)),
    )
  }, [axes.length])

  if (!axes.length) {
    return (
      <p className="text-sm text-slate-400">
        Sin ejes de cobertura observada para este campo.
      </p>
    )
  }

  const activeAxis = axes.find((a) => a.dimensionCode === active)
  const activeDisplayCoverage = activeAxis
    ? resolveRadarDisplayCoverage(
        activeAxis.relativeCoverage,
        activeAxis.displayCoverage,
      )
    : null

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="entity-detail-dimension-radar h-auto w-full overflow-visible"
        role="img"
        aria-label="Mapa relativo de competencias por dimensión"
        data-radar="mc1-dimension"
      >
        <defs>
          <linearGradient
            id={`mc1RadarFill-${gradId}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="rgba(45,212,191,0.35)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.22)" />
          </linearGradient>
        </defs>

        <g data-radar-layer="grid">
          {rings.map((d, i) => (
            <path
              key={`ring-${i}`}
              d={d}
              fill="none"
              stroke="rgba(148,163,184,0.28)"
              strokeWidth={1}
            />
          ))}

          {geometry.map((g: RadarAxisGeometry) => (
            <line
              key={`spoke-${g.index}`}
              x1={CX}
              y1={CY}
              x2={g.tip.x}
              y2={g.tip.y}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth={1}
              data-radar-spoke={g.index}
            />
          ))}
        </g>

        <g data-radar-series="primary">
          <path
            d={polygon}
            fill={`url(#mc1RadarFill-${gradId})`}
            stroke="rgba(45,212,191,0.95)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fillRule="nonzero"
            data-radar-series-part="closed"
          />
        </g>

        <g data-radar-layer="points">
          {geometry.map((g: RadarAxisGeometry, i: number) => {
            const axis = axes[i]
            const selected = active === axis.dimensionCode
            const lines = wrapLabel(axis.label)
            const startDy = labelBlockDy(lines.length, g.labelDy)
            const semanticPct = coverageToPercent(coverages[i])
            const state = inferRadarEvidenceState(
              axis.relativeCoverage,
              axis.evidenceState,
            )
            const pointFill =
              state === 'WEAK_EVIDENCE'
                ? selected
                  ? '#fcd34d'
                  : '#fbbf24'
                : selected
                  ? '#5eead4'
                  : '#2dd4bf'
            return (
              <g key={axis.dimensionCode} data-radar-axis={axis.dimensionCode}>
                <circle
                  cx={g.valuePoint.x}
                  cy={g.valuePoint.y}
                  r={selected ? RADAR_POINT_RADIUS + 1.5 : RADAR_POINT_RADIUS}
                  fill={pointFill}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  data-value={semanticPct}
                  data-evidence-state={state}
                  data-selected={selected || undefined}
                  onMouseEnter={() => setActive(axis.dimensionCode)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(axis.dimensionCode)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${axis.label}: ${radarEvidenceStateLabel(state)}, representación en el mapa ${semanticPct} por ciento`}
                />
                <text
                  x={g.labelAnchor.x}
                  y={g.labelAnchor.y}
                  textAnchor={g.textAnchor}
                  className="fill-slate-200"
                  style={{ fontSize: 11 }}
                >
                  {lines.map((line, li) => (
                    <tspan
                      key={`${axis.dimensionCode}-l${li}`}
                      x={g.labelAnchor.x}
                      dy={li === 0 ? startDy : LINE_HEIGHT}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {activeAxis ? (
        <div className="mt-2 rounded-lg border border-teal-500/30 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
          <div className="entity-detail-accent-text font-medium text-teal-200">{activeAxis.label}</div>
          <div>
            {radarEvidenceStateLabel(
              inferRadarEvidenceState(
                activeAxis.relativeCoverage,
                activeAxis.evidenceState,
              ),
            )}
          </div>
          <div>
            Representación en el mapa: {Math.round(activeDisplayCoverage ?? 0)}%
          </div>
          {debug ? (
            <div className="text-xs text-slate-400">
              relativeCoverage: {activeAxis.relativeCoverage}
            </div>
          ) : null}
          {debug && activeAxis.rawScore != null ? (
            <div className="text-xs text-slate-400">
              rawScore: {activeAxis.rawScore}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
