import type { CompetencyExplorerDomain } from '../types/competencyExplorer.types'

type Props = {
  domain: CompetencyExplorerDomain
  onExplore?: (code: string) => void
}

/** Tarjeta compacta de dominio para el estado inicial. */
export function DomainPreviewCard({ domain, onExplore }: Props) {
  return (
    <button
      type="button"
      className="group flex w-full flex-col rounded-xl border border-cyan-400/12 bg-[#06111f]/55 p-3.5 text-left outline-none transition-colors hover:border-cyan-300/35 hover:bg-cyan-950/25 focus-visible:ring-2 focus-visible:ring-cyan-300/50"
      aria-label={`Explorar dominio ${domain.name}`}
      onClick={() => onExplore?.(domain.code)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-slate-100">
          {domain.name}
        </h3>
        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-cyan-300/70 transition-transform group-hover:translate-x-0.5"
        >
          <ChevronIcon />
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
        {domain.description}
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <div className="flex gap-1">
          <dt className="sr-only">Especialidades</dt>
          <dd>
            <span className="tabular-nums text-slate-300">
              {domain.specialtyCount}
            </span>{' '}
            especialidades
          </dd>
        </div>
        <div className="flex gap-1">
          <dt className="sr-only">Personas relacionadas</dt>
          <dd>
            <span className="tabular-nums text-slate-300">
              {domain.peopleCount}
            </span>{' '}
            personas
          </dd>
        </div>
      </dl>
    </button>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5 3.5 8.5 7 5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
