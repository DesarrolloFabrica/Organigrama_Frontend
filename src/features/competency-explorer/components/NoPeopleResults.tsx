import type {
  CompetencyExplorerDomain,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  MatchMode,
  RestrictiveCriterion,
} from '../types/competencyExplorer.types'
import {
  resolveCatalogName,
  restrictiveCriterionTypeLabel,
} from '../utils/personMatchPresentation'

export type NoPeopleResultsProps = {
  matchMode: MatchMode
  restrictiveCriterion: RestrictiveCriterion | null
  domainCatalog: CompetencyExplorerDomain[]
  specialtyCatalog: CompetencyExplorerSpecialty[]
  skillCatalog: CompetencyExplorerSkill[]
  onChangeToAny: () => void
  onRemoveCriterion: (criterion: RestrictiveCriterion) => void
}

export function NoPeopleResults({
  matchMode,
  restrictiveCriterion,
  domainCatalog,
  specialtyCatalog,
  skillCatalog,
  onChangeToAny,
  onRemoveCriterion,
}: NoPeopleResultsProps) {
  const restrictiveName = restrictiveCriterion
    ? resolveCatalogName(
        restrictiveCriterion.code,
        restrictiveCriterion.type === 'DOMAIN'
          ? domainCatalog
          : restrictiveCriterion.type === 'SPECIALTY'
            ? specialtyCatalog
            : skillCatalog,
      )
    : null

  const title =
    matchMode === 'ALL'
      ? 'No encontramos personas con todos los criterios seleccionados'
      : 'No encontramos personas relacionadas con los criterios seleccionados'

  const description =
    matchMode === 'ALL'
      ? 'La combinación actual es demasiado restrictiva para los datos disponibles.'
      : 'Ninguna persona mock cumple estos criterios.'

  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-slate-600/55 bg-slate-950/35 px-4 py-5 sm:px-5"
    >
      <h3 className="text-base font-medium text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      {restrictiveCriterion && restrictiveName ? (
        <div className="mt-4 rounded-lg border border-slate-700/60 bg-[#06111f]/60 px-3.5 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
            {restrictiveCriterionTypeLabel(restrictiveCriterion.type)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-200">
            {restrictiveName}
          </p>
          {restrictiveCriterion.matchCount === 0 ? (
            <p className="mt-1 text-[12px] text-slate-500">
              No aparece en ningún perfil simulado.
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-slate-500">
              Presente en {restrictiveCriterion.matchCount} perfil
              {restrictiveCriterion.matchCount === 1 ? '' : 'es'} simulado
              {restrictiveCriterion.matchCount === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {matchMode === 'ALL' ? (
          <button
            type="button"
            onClick={onChangeToAny}
            className="rounded-lg border border-cyan-400/35 bg-cyan-950/35 px-3 py-2 text-[13px] text-cyan-50 outline-none hover:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
          >
            Cambiar a coincidencia amplia
          </button>
        ) : null}

        {restrictiveCriterion ? (
          <button
            type="button"
            onClick={() => onRemoveCriterion(restrictiveCriterion)}
            className="rounded-lg border border-slate-600/55 px-3 py-2 text-[13px] text-slate-200 outline-none hover:border-slate-400/55 hover:text-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
          >
            Retirar el criterio más restrictivo
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function buildPeopleSkillOwnerCounts(
  people: ReadonlyArray<{ skillCodes: string[] }>,
  skillCodes: string[],
): Map<string, number> {
  const map = new Map<string, number>()
  for (const code of skillCodes) {
    let count = 0
    for (const person of people) {
      if (person.skillCodes.includes(code)) count += 1
    }
    map.set(code, count)
  }
  return map
}
