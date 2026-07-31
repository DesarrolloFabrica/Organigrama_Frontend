import type {
  CompetencyExplorerSelection,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'
import { hasSelection } from '../utils/queryState'

type Props = {
  specialties: CompetencyExplorerSpecialty[]
  skills: CompetencyExplorerSkill[]
  selectedSkillCodes: CompetencyExplorerSelection[]
  domainNameByCode: Map<string, string>
  onToggleSkill: (code: string) => void
}

/** Vista exploratoria con especialidades seleccionadas: lista de skills. */
export function SpecialtyOverview({
  specialties,
  skills,
  selectedSkillCodes,
  domainNameByCode,
  onToggleSkill,
}: Props) {
  const peopleEstimate = specialties.reduce((sum, s) => sum + s.peopleCount, 0)

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
          {specialties.length === 1
            ? specialties[0].name
            : `${specialties.length} especialidades seleccionadas`}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          Seleccione una o varias skills para construir la consulta de
          conocimiento. El ranking de personas llegará en una fase posterior.
        </p>
        <p className="text-[12px] text-slate-500">
          <span className="tabular-nums text-slate-300">{skills.length}</span>{' '}
          skills ·{' '}
          <span className="tabular-nums text-slate-300">{peopleEstimate}</span>{' '}
          personas relacionadas
        </p>
      </div>

      {specialties.length > 1 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Especialidades en consulta">
          {specialties.map((s) => (
            <li
              key={s.code}
              className="rounded-lg border border-slate-600/40 px-2 py-1 text-[11px] text-slate-400"
            >
              {s.name}
              <span className="ml-1 text-slate-600">
                · {domainNameByCode.get(s.domainCode) ?? s.domainCode}
              </span>
            </li>
          ))}
        </ul>
      ) : specialties[0] ? (
        <p className="text-[12px] text-slate-500">
          {domainNameByCode.get(specialties[0].domainCode) ??
            specialties[0].domainCode}
        </p>
      ) : null}

      <section aria-labelledby="specialty-overview-skills" className="space-y-3">
        <h3
          id="specialty-overview-skills"
          className="text-sm font-medium text-slate-200"
        >
          Skills
        </h3>
        {skills.length === 0 ? (
          <p className="text-sm text-slate-500" role="status">
            No hay skills disponibles para estas especialidades.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => {
              const selected = hasSelection(selectedSkillCodes, skill.code)
              return (
                <li key={skill.code}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleSkill(skill.code)}
                    className={
                      selected
                        ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-300/40 bg-cyan-950/35 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50'
                        : 'flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-3.5 py-3 text-left outline-none transition-colors hover:border-cyan-300/30 focus-visible:ring-2 focus-visible:ring-cyan-300/50'
                    }
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-100">
                        {skill.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {domainNameByCode.get(skill.domainCode) ??
                          skill.domainCode}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[11px] text-slate-400">
                      {skill.peopleCount}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
