import type { CompetencyProfessionalDomain } from '../types'
import { formatQualificationLabel } from '../utils/qualificationLabels'

type Props = {
  domains: CompetencyProfessionalDomain[]
  selectedDomainCode: string
  onSelect: (code: string) => void
}

/**
 * Selector compacto de dominios publicables.
 * Tabs accesibles; se oculta desde el padre cuando hay un solo dominio.
 */
export function DomainSelector({
  domains,
  selectedDomainCode,
  onSelect,
}: Props) {
  return (
    <div
      role="tablist"
      aria-label="Dominios profesionales evaluados"
      className="mc-domain-selector flex flex-wrap gap-1.5"
    >
      {domains.map((d) => {
        const selected = d.code === selectedDomainCode
        const qualLabel = formatQualificationLabel(d.qualification)
        return (
          <button
            key={d.code}
            type="button"
            role="tab"
            id={`domain-tab-${d.code}`}
            aria-selected={selected}
            aria-controls={`domain-panel-${d.code}`}
            tabIndex={selected ? 0 : -1}
            className={
              selected
                ? 'rounded-lg border border-cyan-300/45 bg-cyan-950/40 px-2.5 py-1.5 text-left text-[12px] font-medium text-cyan-50 outline-none ring-cyan-300/50 focus-visible:ring-2'
                : 'rounded-lg border border-slate-600/40 bg-transparent px-2.5 py-1.5 text-left text-[12px] text-slate-300 outline-none hover:border-slate-400/50 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400/60'
            }
            onClick={() => onSelect(d.code)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
              e.preventDefault()
              const idx = domains.findIndex((x) => x.code === selectedDomainCode)
              if (idx < 0) return
              const next =
                e.key === 'ArrowRight'
                  ? domains[(idx + 1) % domains.length]
                  : domains[(idx - 1 + domains.length) % domains.length]
              onSelect(next.code)
            }}
          >
            <span className="block leading-tight">{d.name}</span>
            <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
              {qualLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
