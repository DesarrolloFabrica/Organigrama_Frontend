import type { ReactNode } from 'react'
import type { CompetencyAvailability } from '../types'
import { CompetencyApiError } from '../api/competenciesApi'

type Props = {
  availability?: CompetencyAvailability | null
  error?: unknown
  onRetry?: () => void
}

export function CompetenciesStateMessage({
  availability,
  error,
  onRetry,
}: Props) {
  if (error instanceof CompetencyApiError && error.status === 403) {
    return (
      <StateCard tone="warn">
        No tienes permiso para consultar las competencias de esta persona.
      </StateCard>
    )
  }

  if (error) {
    return (
      <StateCard tone="warn">
        <p>No fue posible cargar las competencias.</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center rounded-lg border border-cyan-400/25 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
          >
            Reintentar
          </button>
        ) : null}
      </StateCard>
    )
  }

  if (availability === 'NOT_EVALUATED') {
    return (
      <StateCard tone="info">
        Aún no hay una evaluación de competencias disponible para esta persona.
      </StateCard>
    )
  }

  if (availability === 'STALE') {
    return (
      <StateCard tone="warn">
        Hay una evaluación histórica, pero no es compatible con el catálogo de
        competencias vigente. Requiere reevaluación bajo el catálogo activo.
      </StateCard>
    )
  }

  if (availability === 'FAILED') {
    return (
      <StateCard tone="warn">
        La evaluación de competencias no pudo completarse.
      </StateCard>
    )
  }

  return null
}

function StateCard({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'info' | 'warn'
}) {
  const toneClass =
    tone === 'warn'
      ? 'border-amber-400/25 bg-amber-950/20 text-amber-100/90'
      : 'border-cyan-400/15 bg-cyan-950/25 text-slate-300'

  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-5 text-sm leading-relaxed ${toneClass}`}
    >
      {children}
    </div>
  )
}

export function CompetenciesSkeleton() {
  return (
    <div
      className="mc-explorer animate-pulse space-y-3"
      aria-busy="true"
      aria-label="Cargando competencias"
    >
      <div className="h-16 rounded-xl border border-cyan-400/10 bg-cyan-950/30" />
      <div className="mx-auto aspect-square w-full max-w-[280px] rounded-full border border-cyan-400/10 bg-cyan-950/25" />
      <div className="h-8 rounded-lg bg-cyan-950/40" />
      <div className="h-48 rounded-xl bg-cyan-950/30" />
    </div>
  )
}
