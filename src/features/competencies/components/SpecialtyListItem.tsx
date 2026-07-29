import type { CompetencySpecialtySummary } from '../types'
import {
  formatCoveragePercent,
  formatPresentationStatus,
} from '../utils/competencyFormat'

type Props = {
  specialty: CompetencySpecialtySummary
  selected: boolean
  onSelect: (code: string) => void
}

/** Ítem compacto de lista: nombre, estado/principal, skills, coverage. */
export function SpecialtyListItem({ specialty, selected, onSelect }: Props) {
  const statusLabel = formatPresentationStatus(specialty.presentationStatus)
  const isActive = specialty.presentationStatus === 'ACTIVE'
  const statusShort = specialty.isDefault
    ? `Principal · ${statusLabel}`
    : statusLabel

  return (
    <button
      type="button"
      onClick={() => onSelect(specialty.code)}
      aria-current={selected ? 'true' : undefined}
      title={specialty.name}
      className={[
        'w-full min-w-0 rounded-lg border px-2.5 py-2 text-left transition',
        selected
          ? 'border-cyan-400/40 bg-cyan-500/15'
          : 'border-transparent bg-cyan-950/25 hover:border-cyan-400/20 hover:bg-cyan-500/10',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-semibold leading-snug text-slate-100">
          {specialty.name}
        </p>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-500">
          #{specialty.rank}
        </span>
      </div>
      <p
        className={[
          'mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide',
          isActive ? 'text-slate-400' : 'text-slate-500',
        ].join(' ')}
      >
        {statusShort}
      </p>
      <p className="mt-1 text-[10px] leading-snug text-slate-500">
        {specialty.metrics.evidencedSkillCount}/
        {specialty.metrics.mappedSkillCount} ·{' '}
        {formatCoveragePercent(specialty.metrics.coverage)}
      </p>
    </button>
  )
}
