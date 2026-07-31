import type {
  CompetencyExplorerDomain,
  CompetencyExplorerQueryState,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'
import { getSource, hasSelection } from '../utils/queryState'

type Props = {
  domains: CompetencyExplorerDomain[]
  availableSpecialties: CompetencyExplorerSpecialty[]
  availableSkills: CompetencyExplorerSkill[]
  query: CompetencyExplorerQueryState
  domainNameByCode: Map<string, string>
  onToggleDomain: (code: string) => void
  onToggleSpecialty: (code: string) => void
  onToggleSkill: (code: string) => void
}

/**
 * Constructor de consulta: dominios → especialidades → skills.
 * Selección múltiple; sin cascada silenciosa al deseleccionar.
 */
export function QueryBuilderPanel({
  domains,
  availableSpecialties,
  availableSkills,
  query,
  domainNameByCode,
  onToggleDomain,
  onToggleSpecialty,
  onToggleSkill,
}: Props) {
  const hasDomains = query.domains.length > 0
  const hasSpecialties = query.specialties.length > 0

  return (
    <aside
      aria-label="Constructor de consulta"
      className="flex h-full min-h-0 flex-col rounded-xl border border-cyan-400/12 bg-[#06111f]/55"
    >
      <div className="border-b border-slate-700/50 px-3.5 py-3">
        <h2 className="text-sm font-medium text-slate-100">Consulta</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Construya la búsqueda por conocimiento
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
        <section aria-labelledby="qb-domains-heading">
          <h3
            id="qb-domains-heading"
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"
          >
            1. Dominios
          </h3>
          <p className="mt-1 text-[12px] text-slate-500">
            Explore un área de conocimiento
          </p>
          <ul className="mt-2.5 space-y-1.5" role="listbox" aria-label="Dominios" aria-multiselectable="true">
            {domains.map((domain) => {
              const selected = hasSelection(query.domains, domain.code)
              const source = getSource(query.domains, domain.code)
              return (
                <li key={domain.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    className={
                      selected
                        ? 'flex w-full items-center justify-between gap-2 rounded-lg border border-cyan-300/40 bg-cyan-950/40 px-2.5 py-2 text-left text-[13px] text-cyan-50 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                        : 'flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[13px] text-slate-300 outline-none transition-colors hover:border-cyan-400/20 hover:bg-cyan-950/30 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                    }
                    onClick={() => onToggleDomain(domain.code)}
                  >
                    <span className="leading-snug">
                      {domain.name}
                      {source === 'CONTEXT' ? (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                          contexto
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-[10px] text-slate-500">
                      {domain.specialtyCount}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="qb-specialties-heading">
          <h3
            id="qb-specialties-heading"
            className={
              hasDomains
                ? 'text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400'
                : 'text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500'
            }
          >
            2. Especialidades
          </h3>
          {!hasDomains ? (
            <div
              className="mt-2 rounded-lg border border-dashed border-slate-700/70 bg-slate-950/30 px-3 py-3"
              role="status"
            >
              <p className="text-[12px] text-slate-500">
                Seleccione primero un dominio
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-[12px] text-slate-500">
                Filtradas por los dominios seleccionados
              </p>
              <ul
                className="mt-2.5 space-y-1.5"
                role="listbox"
                aria-label="Especialidades"
                aria-multiselectable="true"
              >
                {availableSpecialties.map((specialty) => {
                  const selected = hasSelection(
                    query.specialties,
                    specialty.code,
                  )
                  const source = getSource(query.specialties, specialty.code)
                  const domainLabel =
                    domainNameByCode.get(specialty.domainCode) ??
                    specialty.domainCode
                  return (
                    <li
                      key={specialty.code}
                      role="option"
                      aria-selected={selected}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        className={
                          selected
                            ? 'flex w-full flex-col gap-0.5 rounded-lg border border-cyan-300/40 bg-cyan-950/40 px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                            : 'flex w-full flex-col gap-0.5 rounded-lg border border-transparent px-2.5 py-2 text-left outline-none transition-colors hover:border-cyan-400/20 hover:bg-cyan-950/30 focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                        }
                        onClick={() => onToggleSpecialty(specialty.code)}
                      >
                        <span
                          className={
                            selected
                              ? 'text-[13px] leading-snug text-cyan-50'
                              : 'text-[13px] leading-snug text-slate-300'
                          }
                        >
                          {specialty.name}
                          {source === 'CONTEXT' ? (
                            <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                              contexto
                            </span>
                          ) : null}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {domainLabel}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="qb-skills-heading">
          <h3
            id="qb-skills-heading"
            className={
              hasSpecialties
                ? 'text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400'
                : 'text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500'
            }
          >
            3. Skills
          </h3>
          {!hasSpecialties ? (
            <div
              className="mt-2 rounded-lg border border-dashed border-slate-700/70 bg-slate-950/30 px-3 py-3"
              role="status"
            >
              <p className="text-[12px] text-slate-500">
                Seleccione primero una especialidad
              </p>
            </div>
          ) : availableSkills.length === 0 ? (
            <div
              className="mt-2 rounded-lg border border-dashed border-slate-700/70 bg-slate-950/30 px-3 py-3"
              role="status"
            >
              <p className="text-[12px] text-slate-500">
                No hay skills mock para las especialidades seleccionadas
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-[12px] text-slate-500">
                Filtradas por las especialidades seleccionadas
              </p>
              <ul
                className="mt-2.5 space-y-1.5"
                role="listbox"
                aria-label="Skills"
                aria-multiselectable="true"
              >
                {availableSkills.map((skill) => {
                  const selected = hasSelection(query.skills, skill.code)
                  return (
                    <li key={skill.code} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        className={
                          selected
                            ? 'flex w-full flex-col gap-0.5 rounded-lg border border-cyan-300/40 bg-cyan-950/40 px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                            : 'flex w-full flex-col gap-0.5 rounded-lg border border-transparent px-2.5 py-2 text-left outline-none transition-colors hover:border-cyan-400/20 hover:bg-cyan-950/30 focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                        }
                        onClick={() => onToggleSkill(skill.code)}
                      >
                        <span
                          className={
                            selected
                              ? 'text-[13px] leading-snug text-cyan-50'
                              : 'text-[13px] leading-snug text-slate-300'
                          }
                        >
                          {skill.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {skill.peopleCount} personas
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </aside>
  )
}
