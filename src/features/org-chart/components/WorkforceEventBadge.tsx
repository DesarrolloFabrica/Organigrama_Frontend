import {
  getWorkforceEventBadge,
  type OrgNode,
  type WorkforceEventBadgeTone,
} from '../types'

type Size = 'xs' | 'sm' | 'md'
type Surface = 'dark' | 'light'

type Props = {
  node: Pick<OrgNode, 'current_workforce_event' | 'current_workforce_event_count'>
  size?: Size
  /** `dark` = nodos holográficos; `light` = tarjetas claras. */
  surface?: Surface
  className?: string
}

const darkToneClass: Record<WorkforceEventBadgeTone, string> = {
  health: 'border-rose-400/50 bg-rose-400/12 text-rose-300',
  leave: 'border-amber-400/45 bg-amber-400/12 text-amber-300',
  sanction: 'border-red-400/50 bg-red-500/15 text-red-300',
  remote: 'border-cyan-400/45 bg-cyan-400/12 text-cyan-300',
  other: 'border-slate-400/40 bg-slate-400/10 text-slate-300',
}

const lightToneClass: Record<WorkforceEventBadgeTone, string> = {
  health: 'border-rose-500/40 bg-rose-50 text-rose-700',
  leave: 'border-amber-500/40 bg-amber-50 text-amber-700',
  sanction: 'border-red-500/40 bg-red-50 text-red-700',
  remote: 'border-cyan-500/40 bg-cyan-50 text-cyan-700',
  other: 'border-slate-400/40 bg-slate-50 text-slate-600',
}

const darkDotClass: Record<WorkforceEventBadgeTone, string> = {
  health: 'bg-rose-400',
  leave: 'bg-amber-400',
  sanction: 'bg-red-400',
  remote: 'bg-cyan-400',
  other: 'bg-slate-400',
}

const lightDotClass: Record<WorkforceEventBadgeTone, string> = {
  health: 'bg-rose-500',
  leave: 'bg-amber-500',
  sanction: 'bg-red-500',
  remote: 'bg-cyan-500',
  other: 'bg-slate-500',
}

const sizeClass: Record<Size, { shell: string; dot: string }> = {
  xs: {
    shell: 'max-w-[11rem] gap-1 px-1.5 py-0.5 text-[8px] tracking-[0.12em]',
    dot: 'size-1',
  },
  sm: {
    shell: 'max-w-[13rem] gap-1 px-2 py-0.5 text-[9px] tracking-[0.14em]',
    dot: 'size-1.5',
  },
  md: {
    shell: 'max-w-[16rem] gap-1 px-2 py-0.5 text-[10px] tracking-[0.12em]',
    dot: 'size-1.5',
  },
}

/** Píldora de novedad vigente (incapacidad, licencia, permiso, etc.). */
export function WorkforceEventBadge({
  node,
  size = 'sm',
  surface = 'dark',
  className,
}: Props) {
  const badge = getWorkforceEventBadge(node)
  if (!badge) return null

  const sizing = sizeClass[size]
  const toneClass = surface === 'light' ? lightToneClass : darkToneClass
  const dotClass = surface === 'light' ? lightDotClass : darkDotClass

  return (
    <span
      className={[
        'inline-flex max-w-full items-center rounded-full border font-bold uppercase',
        toneClass[badge.tone],
        sizing.shell,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={badge.title}
    >
      <span
        className={['shrink-0 rounded-full', dotClass[badge.tone], sizing.dot].join(
          ' ',
        )}
        aria-hidden
      />
      <span className="min-w-0 truncate">{badge.label}</span>
    </span>
  )
}
