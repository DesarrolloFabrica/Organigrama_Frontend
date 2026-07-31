import type {
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'

type Props = {
  skills: CompetencyExplorerSkill[]
  specialties: CompetencyExplorerSpecialty[]
  domainNameByCode: Map<string, string>
  specialtyNameByCode: Map<string, string>
  onToggleSkill: (code: string) => void
}

/**
 * Estado cuando hay skills en la consulta.
 * Sin ranking de personas (Fase 3+).
 */
export function SkillsSelectedState({
  skills,
  specialties,
  domainNameByCode,
  specialtyNameByCode,
  onToggleSkill,
}: Props) {
  const peopleHint = skills.reduce((sum, s) => sum + s.peopleCount, 0)

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
          Consulta de skills lista
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          Ha seleccionado conocimiento demostrado. El ranking de personas se
          implementará en la siguiente fase; por ahora puede ajustar skills,
          especialidades y dominios.
        </p>
        <p className="text-[12px] text-slate-500">
          <span className="tabular-nums text-slate-300">{skills.length}</span>{' '}
          skill{skills.length === 1 ? '' : 's'} · estimación ilustrativa{' '}
          <span className="tabular-nums text-slate-300">{peopleHint}</span>{' '}
          personas (sin ranking)
        </p>
      </div>

      {specialties.length > 0 ? (
        <p className="text-[12px] text-slate-500">
          Especialidades relacionadas:{' '}
          {specialties.map((s) => s.name).join(', ')}
        </p>
      ) : null}

      <section aria-labelledby="skills-selected-list" className="space-y-3">
        <h3
          id="skills-selected-list"
          className="text-sm font-medium text-slate-200"
        >
          Skills en la consulta
        </h3>
        <ul className="space-y-2">
          {skills.map((skill) => (
            <li
              key={skill.code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/20 bg-cyan-950/25 px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-cyan-50">{skill.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {domainNameByCode.get(skill.domainCode) ?? skill.domainCode}
                  {' · '}
                  {specialtyNameByCode.get(skill.specialtyCode) ??
                    skill.specialtyCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSkill(skill.code)}
                className="rounded-lg border border-slate-600/50 px-2.5 py-1 text-[11px] text-slate-300 outline-none hover:border-slate-400/50 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                aria-label={`Quitar skill ${skill.name}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
