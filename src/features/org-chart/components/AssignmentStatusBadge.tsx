import {
  getAssignmentBadge,
  type OrgNode,
} from '../types'

type Size = 'xs' | 'sm' | 'md'
type Surface = 'dark' | 'light'

type Props = {
  node: Pick<OrgNode, 'assignment_status'>
  size?: Size
  /** `dark` = nodos holográficos; `light` = tarjetas claras. */
  surface?: Surface
  className?: string
}

type Tone = NonNullable<ReturnType<typeof getAssignmentBadge>>['tone']

const darkToneClass: Record<Tone, string> = {
  temporal: 'border-amber-400/45 bg-amber-400/12 text-amber-300',
  maternity: 'border-pink-400/50 bg-pink-400/12 text-pink-300',
}

const lightToneClass: Record<Tone, string> = {
  temporal: 'border-amber-500/40 bg-amber-50 text-amber-700',
  maternity: 'border-pink-500/40 bg-pink-50 text-pink-700',
}

const darkDotClass: Record<Tone, string> = {
  temporal: 'bg-amber-400',
  maternity: 'bg-pink-400',
}

const lightDotClass: Record<Tone, string> = {
  temporal: 'bg-amber-500',
  maternity: 'bg-pink-500',
}

const sizeClass: Record<Size, { shell: string; dot: string }> = {
  xs: {
    shell: 'gap-1 px-1.5 py-0.5 text-[8px] tracking-[0.14em]',
    dot: 'size-1',
  },
  sm: {
    shell: 'gap-1 px-2 py-0.5 text-[9px] tracking-[0.16em]',
    dot: 'size-1.5',
  },
  md: {
    shell: 'gap-1 px-2 py-0.5 text-[10px] tracking-[0.14em]',
    dot: 'size-1.5',
  },
}

/** Píldora de estado de asignación (TEMPORAL / licencia de maternidad). */
export function AssignmentStatusBadge({
  node,
  size = 'sm',
  surface = 'dark',
  className,
}: Props) {
  const badge = getAssignmentBadge(node)
  if (!badge) return null

  const sizing = sizeClass[size]
  const toneClass = surface === 'light' ? lightToneClass : darkToneClass
  const dotClass = surface === 'light' ? lightDotClass : darkDotClass

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-bold uppercase',
        toneClass[badge.tone],
        sizing.shell,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={badge.title}
    >
      <span
        className={['rounded-full', dotClass[badge.tone], sizing.dot].join(' ')}
        aria-hidden
      />
      {badge.label}
    </span>
  )
}
