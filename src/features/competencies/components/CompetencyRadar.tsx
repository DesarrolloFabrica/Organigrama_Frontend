import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  useDebouncedValue,
  useOrgPersonCompetencySpecialty,
} from '../../../lib/react-query/hooks'
import type { CompetencySpecialtySummary } from '../types'
import {
  RADAR_CENTER,
  RADAR_HIT_RADIUS,
  RADAR_LABEL_RADIUS,
  RADAR_MAX_RADIUS,
  RADAR_POINT_RADIUS,
  RADAR_VIEW_SIZE,
  buildCoveragePolygon,
  buildRadarAxesGeometry,
  buildRingLevels,
  buildRingPolygon,
  coverageToPercent,
  placeTooltipInBounds,
  polygonPointsToPath,
  preferredTooltipSide,
} from '../utils/radarGeometry'
import {
  countUniqueSkillNames,
  pickTooltipSkillNames,
  radarPolygonDataKey,
  resolveRadarAxisVisualState,
  shouldShowRadarTooltip,
} from '../utils/radarInteraction'
import {
  buildRadarAriaLabel,
  orderSpecialtiesForRadar,
  radarShortLabel,
  splitRadarLabel,
} from '../utils/radarLabels'
import { CompetencyRadarHelp, CompetencyRadarLegend } from './CompetencyRadarHelp'
import { CompetencyRadarTooltip } from './CompetencyRadarTooltip'

type Props = {
  personId: string
  domainCode: string
  specialties: CompetencySpecialtySummary[]
  selectedCode: string | null
  onSelect: (code: string) => void
}

const VIEW = RADAR_VIEW_SIZE
const CX = RADAR_CENTER
const CY = RADAR_CENTER
const MAX_R = RADAR_MAX_RADIUS
const LABEL_R = RADAR_LABEL_RADIUS
const HIT_R = RADAR_HIT_RADIUS
const POINT_R = RADAR_POINT_RADIUS
const HOVER_DEBOUNCE_MS = 200

function readPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readPrefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(readCoarsePointer)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const onChange = () => setCoarse(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return coarse
}

/**
 * Radar SVG de Coverage por especialidad (heptágono).
 * Hover/focus → tooltip (puntero fino); clic/toque → selección.
 */
export function CompetencyRadar({
  personId,
  domainCode,
  specialties,
  selectedCode,
  onSelect,
}: Props) {
  const titleId = useId()
  const reducedMotion = usePrefersReducedMotion()
  const coarsePointer = useCoarsePointer()
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointerTypeRef = useRef<string | null>(null)

  const axes = useMemo(
    () => orderSpecialtiesForRadar(specialties, domainCode),
    [specialties, domainCode],
  )

  const coverages = useMemo(
    () => axes.map((s) => Number(s.metrics.coverage) || 0),
    [axes],
  )

  const polygonKey = useMemo(
    () => radarPolygonDataKey(personId, domainCode, coverages),
    [personId, domainCode, coverages],
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

  const polygonPoints = useMemo(
    () => buildCoveragePolygon(CX, CY, MAX_R, coverages),
    [coverages],
  )

  const polygonPath = useMemo(
    () => polygonPointsToPath(polygonPoints),
    [polygonPoints],
  )

  const rings = useMemo(() => buildRingLevels(5), [])

  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [pointerType, setPointerType] = useState<string | null>(null)
  const debouncedHover = useDebouncedValue(hoveredCode, HOVER_DEBOUNCE_MS)
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({
    left: 8,
    top: 8,
  })

  const hoverQuery = useOrgPersonCompetencySpecialty(
    personId,
    domainCode,
    debouncedHover,
    Boolean(debouncedHover) && debouncedHover === hoveredCode,
  )

  const hoveredSpecialty = axes.find((s) => s.code === hoveredCode) ?? null

  const skillNames = useMemo(() => {
    if (!hoverQuery.data || hoverQuery.data.code !== debouncedHover) return null
    return pickTooltipSkillNames(hoverQuery.data.skills)
  }, [hoverQuery.data, debouncedHover])

  const skillsTotal = useMemo(() => {
    if (!hoverQuery.data || hoverQuery.data.code !== debouncedHover) return null
    return countUniqueSkillNames(hoverQuery.data.skills)
  }, [hoverQuery.data, debouncedHover])

  const showTooltip = shouldShowRadarTooltip({
    hoveredCode,
    pointerType,
    coarsePointer,
  })

  const placeTooltip = useCallback(
    (code: string) => {
      const idx = axes.findIndex((s) => s.code === code)
      if (idx < 0 || !wrapRef.current) return
      const g = geometry[idx]
      const wrap = wrapRef.current
      const rect = wrap.getBoundingClientRect()
      const scale = rect.width / VIEW
      const tipW = Math.min(rect.width - 16, 248)
      const tipH = 176
      const pos = placeTooltipInBounds({
        anchorX: g.labelAnchor.x * scale,
        anchorY: g.labelAnchor.y * scale,
        tipW,
        tipH,
        containerW: rect.width,
        containerH: Math.max(rect.height, tipH + 24),
        preferredSide: preferredTooltipSide(g.angle),
      })
      setTooltipStyle({ left: pos.left, top: pos.top, width: tipW })
    },
    [axes, geometry],
  )

  const openHover = useCallback(
    (code: string, type: string | null) => {
      pointerTypeRef.current = type
      setPointerType(type)
      setHoveredCode(code)
      if (
        shouldShowRadarTooltip({
          hoveredCode: code,
          pointerType: type,
          coarsePointer,
        })
      ) {
        placeTooltip(code)
      }
    },
    [coarsePointer, placeTooltip],
  )

  const closeHover = useCallback(() => {
    setHoveredCode(null)
    setPointerType(null)
    pointerTypeRef.current = null
  }, [])

  useEffect(() => {
    if (!hoveredCode) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeHover()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hoveredCode, closeHover])

  const onAxisKeyDown = (e: KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(code)
    }
  }

  const onAxisPointerDown = (
    e: ReactPointerEvent,
    code: string,
  ) => {
    pointerTypeRef.current = e.pointerType
    setPointerType(e.pointerType)
    if (e.pointerType === 'touch' || coarsePointer) {
      onSelect(code)
      closeHover()
    }
  }

  if (axes.length === 0) {
    return null
  }

  return (
    <section
      className="min-w-0 rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-1.5 py-3 sm:px-2"
      aria-labelledby={titleId}
    >
      <header className="px-1.5">
        <h4
          id={titleId}
          className="text-[13px] font-semibold tracking-tight text-slate-100"
        >
          Mapa de cobertura por especialidad
        </h4>
      </header>

      <div
        ref={wrapRef}
        className="relative mx-auto mt-1 w-full max-w-none min-w-0 overflow-visible"
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="mc-radar-svg block h-auto w-full overflow-visible"
          role="img"
          aria-labelledby={titleId}
        >
          {rings.map((level) => {
            const pts = buildRingPolygon(CX, CY, MAX_R, level, axes.length)
            return (
              <polygon
                key={level}
                points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(148,163,184,0.14)"
                strokeWidth={1}
              />
            )
          })}

          {geometry.map((g) => {
            const code = axes[g.index]?.code
            const isSelected = code === selectedCode
            const isHovered = code === hoveredCode
            return (
              <line
                key={`axis-${g.index}`}
                x1={CX}
                y1={CY}
                x2={g.tip.x}
                y2={g.tip.y}
                stroke={
                  isSelected
                    ? 'rgba(103,232,249,0.55)'
                    : isHovered
                      ? 'rgba(148,163,184,0.45)'
                      : 'rgba(148,163,184,0.32)'
                }
                strokeWidth={isSelected ? 1.75 : 1}
              />
            )
          })}

          <g data-radar-series="primary">
            <path
              key={polygonKey}
              d={polygonPath}
              className={reducedMotion ? undefined : 'mc-radar-polygon-enter'}
              fill="rgba(34,211,238,0.14)"
              stroke="rgb(34,211,238)"
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
              fillRule="nonzero"
              data-radar-series-part="closed"
            />
          </g>

          {axes.map((specialty, index) => {
            const g = geometry[index]
            const visual = resolveRadarAxisVisualState({
              code: specialty.code,
              selectedCode,
              hoveredCode,
              isDefault: specialty.isDefault,
            })
            const { isSelected, isDefault, isHovered } = visual
            const isEmergent = specialty.presentationStatus === 'EMERGENT'
            const short = radarShortLabel(specialty.code, specialty.name)
            const parts = splitRadarLabel(short)
            const showPct = isSelected || isHovered
            const pct = coverageToPercent(specialty.metrics.coverage)
            const pointR =
              isSelected || isHovered ? POINT_R + 1.25 : POINT_R

            return (
              <g key={specialty.code}>
                <circle
                  cx={g.valuePoint.x}
                  cy={g.valuePoint.y}
                  r={HIT_R}
                  fill="transparent"
                  className="mc-radar-hit cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={buildRadarAriaLabel(specialty)}
                  aria-pressed={isSelected}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelect(specialty.code)}
                  onKeyDown={(e) => onAxisKeyDown(e, specialty.code)}
                  onPointerDown={(e) => onAxisPointerDown(e, specialty.code)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'touch' || coarsePointer) return
                    openHover(specialty.code, e.pointerType)
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'touch') return
                    closeHover()
                  }}
                  onFocus={() => openHover(specialty.code, 'keyboard')}
                  onBlur={closeHover}
                />

                {/* Punto visual */}
                <circle
                  cx={g.valuePoint.x}
                  cy={g.valuePoint.y}
                  r={pointR}
                  fill={isEmergent ? 'transparent' : 'rgb(34,211,238)'}
                  stroke="rgb(34,211,238)"
                  strokeWidth={isEmergent ? 1.75 : isSelected ? 2 : 1.25}
                  opacity={isEmergent ? 0.8 : 1}
                  pointerEvents="none"
                  className={
                    isSelected ? 'mc-radar-point-selected' : undefined
                  }
                />

                {/* Anillo de selección (persistente, animable) */}
                {isSelected ? (
                  <circle
                    cx={g.valuePoint.x}
                    cy={g.valuePoint.y}
                    r={10}
                    fill="none"
                    stroke="rgba(103,232,249,0.85)"
                    strokeWidth={1.75}
                    pointerEvents="none"
                    className={
                      reducedMotion ? undefined : 'mc-radar-selection-ring'
                    }
                  />
                ) : null}

                {/* Indicador DEFAULT (principal), independiente de selected */}
                {isDefault ? (
                  <circle
                    cx={g.valuePoint.x}
                    cy={g.valuePoint.y}
                    r={isSelected ? 14 : 8.5}
                    fill="none"
                    stroke="rgba(34,211,238,0.4)"
                    strokeWidth={1}
                    strokeDasharray="2.5 2"
                    pointerEvents="none"
                  />
                ) : null}

                {/* Cápsula sutil detrás del label seleccionado */}
                {isSelected ? (
                  <rect
                    x={
                      g.textAnchor === 'end'
                        ? g.labelAnchor.x - 52
                        : g.textAnchor === 'start'
                          ? g.labelAnchor.x - 4
                          : g.labelAnchor.x - 28
                    }
                    y={g.labelAnchor.y + g.labelDy - (parts.length > 1 ? 14 : 9)}
                    width={56}
                    height={parts.length > 1 ? 28 : 18}
                    rx={4}
                    fill="rgba(34,211,238,0.1)"
                    stroke="rgba(34,211,238,0.22)"
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                ) : null}

                <text
                  x={g.labelAnchor.x}
                  y={g.labelAnchor.y + g.labelDy}
                  textAnchor={g.textAnchor}
                  dominantBaseline="middle"
                  className="cursor-pointer select-none"
                  fill={
                    isSelected
                      ? 'rgb(207,250,254)'
                      : isHovered
                        ? 'rgb(226,232,240)'
                        : 'rgb(148,163,184)'
                  }
                  fontSize={isSelected || isHovered ? 11 : 10}
                  fontWeight={isSelected ? 600 : 500}
                  onClick={() => onSelect(specialty.code)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'touch' || coarsePointer) return
                    openHover(specialty.code, e.pointerType)
                  }}
                  onPointerLeave={closeHover}
                >
                  {parts.length > 1 ? (
                    <>
                      <tspan x={g.labelAnchor.x} dy="-0.4em">
                        {parts[0]}
                      </tspan>
                      <tspan x={g.labelAnchor.x} dy="1.15em">
                        {parts[1]}
                      </tspan>
                    </>
                  ) : (
                    short
                  )}
                </text>

                {showPct ? (
                  <text
                    x={g.valuePoint.x}
                    y={g.valuePoint.y - (isSelected ? 16 : 14)}
                    textAnchor="middle"
                    className="select-none"
                    fill="rgb(165,243,252)"
                    fontSize={9}
                    fontWeight={600}
                    pointerEvents="none"
                  >
                    {pct} %
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>

        {showTooltip && hoveredSpecialty ? (
          <CompetencyRadarTooltip
            specialty={hoveredSpecialty}
            skillNames={
              debouncedHover === hoveredSpecialty.code ? skillNames : null
            }
            skillsTotal={
              debouncedHover === hoveredSpecialty.code ? skillsTotal : null
            }
            skillsLoading={
              debouncedHover === hoveredSpecialty.code &&
              hoverQuery.isFetching &&
              !hoverQuery.data
            }
            style={tooltipStyle}
          />
        ) : null}
      </div>

      <div className="mt-1.5 space-y-1 px-1.5">
        <CompetencyRadarLegend />
        <CompetencyRadarHelp />
        <p className="flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-wide text-slate-600">
          <span>● Activa</span>
          <span>○ Emergente</span>
          <span>- - Principal</span>
        </p>
      </div>
    </section>
  )
}
