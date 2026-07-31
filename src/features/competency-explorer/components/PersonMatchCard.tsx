import { useId, useState } from 'react'
import type {
  CompetencyExplorerDomain,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  PersonMatchResult,
} from '../types/competencyExplorer.types'
import {
  fullMatchCoverageMessage,
  matchDetailSummary,
  matchDetailToggleLabel,
  matchPercentageFormula,
  missingSkillsHeading,
  missingSkillsLabel,
  personInitials,
  resolveCatalogName,
  visibleItemsWithOverflow,
} from '../utils/personMatchPresentation'

export type PersonMatchCardProps = {
  result: PersonMatchResult
  skillCatalog: CompetencyExplorerSkill[]
  specialtyCatalog: CompetencyExplorerSpecialty[]
  domainCatalog: CompetencyExplorerDomain[]
}

/**
 * Tarjeta adaptativa según profundidad de la consulta USER.
 * Varias tarjetas pueden estar abiertas (estado local).
 */
export function PersonMatchCard({
  result,
  skillCatalog,
  specialtyCatalog,
  domainCatalog,
}: PersonMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const panelId = useId()
  const {
    person,
    matchPercentage,
    matchedDomainCodes,
    missingDomainCodes,
    matchedSpecialtyCodes,
    missingSpecialtyCodes,
    matchedSkillCodes,
    missingSkillCodes,
    selectedCriterionCount,
    matchedCriterionCount,
  } = result

  const hasDomainCriteria =
    matchedDomainCodes.length + missingDomainCodes.length > 0
  const hasSpecialtyCriteria =
    matchedSpecialtyCodes.length + missingSpecialtyCodes.length > 0
  const hasSkillCriteria =
    matchedSkillCodes.length + missingSkillCodes.length > 0

  const initials = personInitials(person.fullName)
  const primaryDomain = resolveCatalogName(
    person.primaryDomainCode,
    domainCatalog,
  )

  const matchedDomainNames = matchedDomainCodes.map((code) =>
    resolveCatalogName(code, domainCatalog),
  )
  const missingDomainNames = missingDomainCodes.map((code) =>
    resolveCatalogName(code, domainCatalog),
  )
  const matchedSpecialtyNames = matchedSpecialtyCodes.map((code) =>
    resolveCatalogName(code, specialtyCatalog),
  )
  const missingSpecialtyNames = missingSpecialtyCodes.map((code) =>
    resolveCatalogName(code, specialtyCatalog),
  )
  const matchedSkillNames = matchedSkillCodes.map((code) =>
    resolveCatalogName(code, skillCatalog),
  )
  const missingSkillNames = missingSkillCodes.map((code) =>
    resolveCatalogName(code, skillCatalog),
  )

  const skillsVisible = visibleItemsWithOverflow(matchedSkillNames, 4)
  const specialtiesVisible = visibleItemsWithOverflow(matchedSpecialtyNames, 3)
  const domainsVisible = visibleItemsWithOverflow(matchedDomainNames, 3)
  const missingSkillCompact = missingSkillsLabel(missingSkillCodes.length)
  const toggleLabel = matchDetailToggleLabel(isExpanded)

  return (
    <article
      className="rounded-xl border border-cyan-400/12 bg-[#06111f]/70 p-4"
      aria-label={`${person.fullName}, coincidencia ${matchPercentage} por ciento`}
    >
      <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-950/50 text-sm font-semibold text-cyan-100"
          aria-hidden={person.photoUrl ? undefined : true}
        >
          {person.photoUrl ? (
            <img
              src={person.photoUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-medium text-slate-50">
                {person.fullName}
              </h3>
              <p className="mt-0.5 text-[12px] text-slate-400">{primaryDomain}</p>
            </div>

            <div className="text-right">
              <p
                className="text-2xl font-semibold tabular-nums tracking-tight text-cyan-50"
                aria-label={`${matchPercentage} por ciento de coincidencia`}
              >
                {matchPercentage} %
              </p>
              <p className="text-[11px] text-slate-400">
                {matchedCriterionCount} de {selectedCriterionCount} criterios
              </p>
            </div>
          </div>

          <div
            className="h-1.5 overflow-hidden rounded-full bg-slate-800/90"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-cyan-400/70"
              style={{
                width: `${Math.min(100, Math.max(0, matchPercentage))}%`,
              }}
            />
          </div>

          {hasDomainCriteria && domainsVisible.visible.length > 0 ? (
            <ChipSection
              title="Dominios coincidentes"
              items={domainsVisible.visible}
              overflow={domainsVisible.overflow}
              tone="slate"
            />
          ) : null}

          {hasSpecialtyCriteria && specialtiesVisible.visible.length > 0 ? (
            <ChipSection
              title="Especialidades coincidentes"
              items={specialtiesVisible.visible}
              overflow={specialtiesVisible.overflow}
              tone="slate"
            />
          ) : null}

          {hasSkillCriteria ? (
            <div>
              {skillsVisible.visible.length > 0 ? (
                <ChipSection
                  title="Skills coincidentes"
                  items={skillsVisible.visible}
                  overflow={skillsVisible.overflow}
                  tone="cyan"
                />
              ) : null}
              {missingSkillCompact ? (
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {missingSkillCompact}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/50 pt-3">
            <p className="text-[11px] text-slate-500">
              Evidencia{' '}
              <span className="tabular-nums text-slate-400">
                {result.evidenceStrength} %
              </span>
            </p>
            <button
              type="button"
              className="rounded-lg border border-cyan-400/30 bg-cyan-950/30 px-2.5 py-1.5 text-[12px] text-cyan-50 outline-none transition-colors hover:border-cyan-300/45 hover:bg-cyan-950/50 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => setIsExpanded((v) => !v)}
            >
              {toggleLabel}
            </button>
          </div>

          {isExpanded ? (
            <div
              id={panelId}
              className="space-y-4 rounded-lg border border-cyan-400/15 bg-[#020617]/55 px-3.5 py-3.5"
            >
              <section aria-labelledby={`${panelId}-summary`}>
                <h4
                  id={`${panelId}-summary`}
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
                >
                  Resumen
                </h4>
                <p className="mt-1 text-sm text-slate-200">
                  {matchDetailSummary(
                    matchedCriterionCount,
                    selectedCriterionCount,
                  )}
                </p>
              </section>

              {hasDomainCriteria ? (
                <CriterionLists
                  panelId={panelId}
                  kind="domains"
                  matched={matchedDomainNames}
                  missing={missingDomainNames}
                />
              ) : null}

              {hasSpecialtyCriteria ? (
                <CriterionLists
                  panelId={panelId}
                  kind="specialties"
                  matched={matchedSpecialtyNames}
                  missing={missingSpecialtyNames}
                />
              ) : null}

              {hasSkillCriteria ? (
                <CriterionLists
                  panelId={panelId}
                  kind="skills"
                  matched={matchedSkillNames}
                  missing={missingSkillNames}
                />
              ) : null}

              {!hasDomainCriteria &&
              !hasSpecialtyCriteria &&
              !hasSkillCriteria ? null : matchedCriterionCount ===
                  selectedCriterionCount && selectedCriterionCount > 0 ? (
                <p className="text-sm text-slate-300">
                  {fullMatchCoverageMessage()}
                </p>
              ) : null}

              <section aria-labelledby={`${panelId}-formula`}>
                <h4
                  id={`${panelId}-formula`}
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
                >
                  Explicación del porcentaje
                </h4>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                  El porcentaje se calcula dividiendo los criterios coincidentes
                  entre los criterios explícitos seleccionados.
                </p>
                <p className="mt-1.5 break-words text-sm text-slate-200">
                  {matchPercentageFormula(
                    matchedCriterionCount,
                    selectedCriterionCount,
                    matchPercentage,
                  )}
                </p>
              </section>

              <section aria-labelledby={`${panelId}-evidence`}>
                <h4
                  id={`${panelId}-evidence`}
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
                >
                  Fuerza de evidencia
                </h4>
                <p className="mt-1 text-sm text-slate-300">
                  Fuerza de evidencia mock:{' '}
                  <span className="tabular-nums">
                    {result.evidenceStrength} %
                  </span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Este valor se utiliza solo como criterio secundario en esta
                  versión.
                </p>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ChipSection({
  title,
  items,
  overflow,
  tone,
}: {
  title: string
  items: string[]
  overflow: number
  tone: 'cyan' | 'slate'
}) {
  const chipClass =
    tone === 'cyan'
      ? 'rounded-md border border-cyan-400/25 bg-cyan-950/30 px-2 py-0.5 text-[11px] text-cyan-50'
      : 'rounded-md border border-slate-600/40 bg-slate-950/40 px-2 py-0.5 text-[11px] text-slate-300'

  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((name) => (
          <li key={name} className={chipClass}>
            {name}
          </li>
        ))}
        {overflow > 0 ? (
          <li className="rounded-md px-2 py-0.5 text-[11px] text-slate-500">
            +{overflow} más
          </li>
        ) : null}
      </ul>
    </div>
  )
}

function CriterionLists({
  panelId,
  kind,
  matched,
  missing,
}: {
  panelId: string
  kind: 'domains' | 'specialties' | 'skills'
  matched: string[]
  missing: string[]
}) {
  const matchedTitle =
    kind === 'domains'
      ? 'Dominios coincidentes'
      : kind === 'specialties'
        ? 'Especialidades coincidentes'
        : 'Skills coincidentes'
  const missingTitle =
    kind === 'domains'
      ? 'Dominios sin coincidencia'
      : kind === 'specialties'
        ? 'Especialidades sin coincidencia'
        : 'Skills sin coincidencia'

  return (
    <>
      {matched.length > 0 ? (
        <section aria-labelledby={`${panelId}-${kind}-matched`}>
          <h4
            id={`${panelId}-${kind}-matched`}
            className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
          >
            {matchedTitle}
          </h4>
          <ul className="mt-1.5 space-y-1">
            {matched.map((name) => (
              <li key={name} className="flex gap-2 text-sm text-slate-200">
                <span aria-hidden="true" className="text-cyan-300">
                  ✓
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {missing.length > 0 ? (
        <section aria-labelledby={`${panelId}-${kind}-missing`}>
          <h4
            id={`${panelId}-${kind}-missing`}
            className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
          >
            {missingTitle}
          </h4>
          {kind === 'skills' ? (
            <p className="mt-1 text-[12px] text-slate-400">
              {missingSkillsHeading()}
            </p>
          ) : null}
          <ul className="mt-1.5 space-y-1">
            {missing.map((name) => (
              <li key={name} className="flex gap-2 text-sm text-slate-300">
                <span aria-hidden="true" className="text-slate-500">
                  —
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
