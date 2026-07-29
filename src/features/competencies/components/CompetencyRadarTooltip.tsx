import type { CSSProperties } from 'react'
import type { CompetencySpecialtySummary } from '../types'
import {
  formatCoveragePercent,
  formatPresentationStatus,
} from '../utils/competencyFormat'
import { coverageToPercent } from '../utils/radarGeometry'

type Props = {
  specialty: CompetencySpecialtySummary
  skillNames: string[] | null
  skillsTotal: number | null
  skillsLoading: boolean
  style: CSSProperties
}

export function CompetencyRadarTooltip({
  specialty,
  skillNames,
  skillsTotal,
  skillsLoading,
  style,
}: Props) {
  const preview = skillNames ?? []
  const remaining =
    skillsTotal != null && skillsTotal > preview.length
      ? skillsTotal - preview.length
      : 0
  const statusLabel = formatPresentationStatus(specialty.presentationStatus)

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 w-[min(100%,15.5rem)] rounded-lg border border-cyan-400/25 bg-[#041018]/97 px-3 py-2.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)] backdrop-blur-sm"
      style={style}
    >
      <p className="text-[13px] font-semibold leading-snug text-slate-50">
        {specialty.name}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-slate-400">
        {specialty.isDefault ? (
          <span className="text-cyan-200/90">Especialidad principal</span>
        ) : null}
        {specialty.isDefault ? (
          <span className="mx-1 text-slate-600" aria-hidden>
            ·
          </span>
        ) : null}
        <span>{statusLabel}</span>
        <span className="mx-1 text-slate-600" aria-hidden>
          ·
        </span>
        <span>Posición #{specialty.rank}</span>
      </p>

      <div className="mt-2.5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-500">
          Cobertura
        </p>
        <p className="text-[18px] font-semibold tabular-nums leading-none text-cyan-100">
          {formatCoveragePercent(specialty.metrics.coverage)}
          <span className="sr-only">
            ({coverageToPercent(specialty.metrics.coverage)} por ciento)
          </span>
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {specialty.metrics.evidencedSkillCount} de{' '}
          {specialty.metrics.mappedSkillCount} skills con evidencia
        </p>
      </div>

      <div className="mt-2.5 border-t border-cyan-400/10 pt-2">
        <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-slate-500">
          Skills principales
        </p>
        {skillsLoading ? (
          <p className="mt-1 text-[11px] text-slate-500">Cargando skills…</p>
        ) : preview.length > 0 ? (
          <ul className="mt-1 space-y-0.5">
            {preview.map((name) => (
              <li key={name} className="text-[12px] text-slate-300">
                {name}
              </li>
            ))}
            {remaining > 0 ? (
              <li className="text-[11px] text-slate-500">+{remaining} más</li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-1 text-[11px] text-slate-500">
            Sin skills cargadas aún.
          </p>
        )}
      </div>
    </div>
  )
}
