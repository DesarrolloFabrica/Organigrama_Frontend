import { useEffect, useMemo, useState } from 'react'
import {
  useOrgPersonCompetencySpecialty,
  useOrgPersonProfessionalProfile,
} from '../../../lib/react-query/hooks'
import type { CompetencyProfessionalDomain } from '../types'
import {
  formatEvaluatedAt,
  formatPresentationStatus,
  partitionSpecialties,
  pickInitialSpecialtyCode,
} from '../utils/competencyFormat'
import {
  formatCdrClassificationLabel,
  formatQualificationLabel,
} from '../utils/qualificationLabels'
import { buildTrajectoryNarrative } from '../utils/trajectoryNarrative'
import { CompetencyRadar } from './CompetencyRadar'
import { DomainSelector } from './DomainSelector'
import {
  CompetenciesSkeleton,
  CompetenciesStateMessage,
} from './CompetenciesStateMessage'
import {
  SpecialtyDetailPanel,
  SpecialtyDetailSkeleton,
} from './SpecialtyDetailPanel'
import { Mc1PersonCompetenciesView } from './Mc1PersonCompetenciesView'

type Props = {
  personId: string
}

/**
 * Explorador de Competencias — MC1.4.x + piloto multidominio.
 * Selector de dominio solo si hay ≥2 dominios publicables.
 */
export function CompetenciesExplorer({ personId }: Props) {
  const profileQuery = useOrgPersonProfessionalProfile(personId, true)
  const profile = profileQuery.data

  const [selectedDomainCode, setSelectedDomainCode] = useState<string | null>(
    null,
  )
  const [userSelectedSpecialty, setUserSelectedSpecialty] = useState<
    string | null
  >(null)

  useEffect(() => {
    setSelectedDomainCode(null)
    setUserSelectedSpecialty(null)
  }, [personId])

  useEffect(() => {
    if (!profile?.defaultDomainCode) return
    setSelectedDomainCode((prev) => {
      if (
        prev &&
        profile.evaluatedDomains.some((d) => d.code === prev)
      ) {
        return prev
      }
      return profile.defaultDomainCode
    })
  }, [profile])

  const domain: CompetencyProfessionalDomain | null = useMemo(() => {
    if (!profile?.evaluatedDomains.length) return null
    const code = selectedDomainCode ?? profile.defaultDomainCode
    return (
      profile.evaluatedDomains.find((d) => d.code === code) ??
      profile.evaluatedDomains[0] ??
      null
    )
  }, [profile, selectedDomainCode])

  useEffect(() => {
    setUserSelectedSpecialty(null)
  }, [domain?.code])

  const selectedSpecialtyCode = useMemo(() => {
    if (!domain) return null
    if (
      userSelectedSpecialty &&
      domain.specialties.some((s) => s.code === userSelectedSpecialty)
    ) {
      return userSelectedSpecialty
    }
    return pickInitialSpecialtyCode(
      domain.specialties,
      domain.defaultSpecialtyCode,
    )
  }, [domain, userSelectedSpecialty])

  const selectedSummary = useMemo(
    () =>
      domain?.specialties.find((s) => s.code === selectedSpecialtyCode) ?? null,
    [domain, selectedSpecialtyCode],
  )

  const specialtyQuery = useOrgPersonCompetencySpecialty(
    personId,
    domain?.code ?? null,
    selectedSpecialtyCode,
    Boolean(domain && selectedSpecialtyCode),
  )

  const partitions = useMemo(
    () =>
      domain
        ? partitionSpecialties(domain.specialties)
        : { active: [], emergent: [] },
    [domain],
  )

  if (profileQuery.isLoading && !profile) {
    return <CompetenciesSkeleton />
  }

  if (profileQuery.isError) {
    return (
      <CompetenciesStateMessage
        error={profileQuery.error}
        onRetry={() => void profileQuery.refetch()}
      />
    )
  }

  if (!profile) return null

  if (profile.mc1Profile?.status === 'AVAILABLE') {
    return <Mc1PersonCompetenciesView profile={profile.mc1Profile} />
  }

  if (
    profile.availabilityStatus !== 'AVAILABLE' &&
    profile.availabilityStatus !== 'STALE'
  ) {
    return (
      <CompetenciesStateMessage availability={profile.availabilityStatus} />
    )
  }

  if (!domain) {
    if (profile.availabilityStatus === 'STALE') {
      return <CompetenciesStateMessage availability="STALE" />
    }
    const mvp = profile.mvpCapabilities
    const hasMvp =
      !!mvp &&
      (mvp.consolidatedCapabilities.length > 0 ||
        mvp.complementaryCapabilities.length > 0 ||
        mvp.emergingCapabilities.length > 0 ||
        mvp.tools.length > 0 ||
        mvp.methodologies.length > 0)
    if (hasMvp && mvp) {
      return (
        <div className="mc-explorer flex flex-col gap-3 overflow-x-hidden pb-2">
          <header className="min-w-0 rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-3 py-3">
            <p className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
              Perfil profesional
            </p>
            <h3 className="entity-detail-title mt-1.5 text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
              Perfil profesional en proceso de clasificación
            </h3>
            <p className="entity-detail-subtitle mt-1.5 text-[12px] leading-relaxed text-slate-400">
              Hay competencias sustentadas por el CV. La clasificación por
              dominio profesional todavía no está completa.
            </p>
          </header>
          <MvpCapabilitiesSections mvp={mvp} />
        </div>
      )
    }
    return <CompetenciesStateMessage availability="NOT_EVALUATED" />
  }

  const showDomainSelector = profile.evaluatedDomains.length > 1
  const specialtyOptions = [...partitions.active, ...partitions.emergent]
  const hasActiveSpecialty = partitions.active.length > 0
  const primary =
    domain.specialties.find((s) => s.isDefault) ??
    domain.specialties.find((s) => s.code === domain.defaultSpecialtyCode) ??
    null
  const trajectory = buildTrajectoryNarrative({
    roleName: profile.person.role,
    domainName: domain.name,
    domainCode: domain.code,
    primarySpecialtyName: primary?.name ?? null,
    primarySpecialtyCode: primary?.code ?? domain.defaultSpecialtyCode,
  })
  const qualLabel = formatQualificationLabel(domain.qualification)

  return (
    <div className="mc-explorer flex flex-col gap-3 overflow-x-hidden pb-2">
      <header className="min-w-0 rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-3 py-3">
        <p className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
          Perfil profesional
        </p>

        {profile.crossDomainClassification ? (
          <p className="mt-1.5 text-[12px] text-slate-300">
            {formatCdrClassificationLabel(
              profile.crossDomainClassification.classification,
            )}
          </p>
        ) : null}

        {showDomainSelector ? (
          <div className="mt-2.5">
            <DomainSelector
              domains={profile.evaluatedDomains}
              selectedDomainCode={domain.code}
              onSelect={setSelectedDomainCode}
            />
          </div>
        ) : null}

        <div
          role="tabpanel"
          id={`domain-panel-${domain.code}`}
          aria-labelledby={
            showDomainSelector ? `domain-tab-${domain.code}` : undefined
          }
          className="mt-2.5"
        >
          <p className="text-[11px] font-medium text-cyan-100/85">
            {qualLabel}
            <span className="mx-1 text-slate-600" aria-hidden>
              ·
            </span>
            {domain.name}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            {domain.name}
          </h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
            {domain.summary}
          </p>
          <p className="mt-1.5 text-[12px] text-slate-400">
            {domain.activeSpecialtyCount} especialidades activas ·{' '}
            {domain.emergentSpecialtyCount} emergentes
          </p>
          {domain.evaluatedAt ? (
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              Evaluado: {formatEvaluatedAt(domain.evaluatedAt)}
            </p>
          ) : null}
          {trajectory && hasActiveSpecialty ? (
            <p className="mt-2 text-[12px] leading-relaxed text-slate-300/95">
              {trajectory}
            </p>
          ) : null}
        </div>
      </header>

      {!hasActiveSpecialty ? (
        <div
          role="status"
          className="rounded-lg border border-slate-500/25 bg-slate-900/40 px-3 py-2.5 text-[12px] leading-snug text-slate-300"
        >
          Se identificaron señales profesionales en este dominio, pero todavía
          no hay una especialidad consolidada.
          {partitions.emergent.length > 0 ? (
            <span className="mt-1 block text-slate-400">
              Puede revisar las capacidades emergentes listadas abajo.
            </span>
          ) : null}
        </div>
      ) : null}

      {specialtyOptions.length > 0 ? (
        <>
          <CompetencyRadar
            personId={personId}
            domainCode={domain.code}
            specialties={domain.specialties}
            selectedCode={selectedSpecialtyCode}
            onSelect={setUserSelectedSpecialty}
          />

          {selectedSummary ? (
            <div className="min-w-0 px-0.5">
              <p className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {selectedSummary.presentationStatus === 'EMERGENT'
                  ? 'Capacidad emergente'
                  : 'Especialidad seleccionada'}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold leading-snug text-slate-50">
                {selectedSummary.name}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                <span>
                  {formatPresentationStatus(selectedSummary.presentationStatus)}
                </span>
                <span className="mx-1 text-slate-600" aria-hidden>
                  ·
                </span>
                <span>Posición #{selectedSummary.rank}</span>
              </p>
            </div>
          ) : null}

          <div className="min-w-0">
            <label htmlFor="competency-specialty-select" className="sr-only">
              Cambiar especialidad seleccionada
            </label>
            <select
              id="competency-specialty-select"
              className="w-full min-w-0 rounded-md border border-slate-600/35 bg-transparent px-2.5 py-1.5 text-[12px] text-slate-300"
              value={selectedSpecialtyCode ?? ''}
              onChange={(e) =>
                setUserSelectedSpecialty(e.target.value || null)
              }
              aria-label="Cambiar especialidad seleccionada"
            >
              {specialtyOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                  {s.presentationStatus === 'EMERGENT' ? ' (emergente)' : ''}
                  {s.isDefault ? ' (principal)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="mc-explorer__detail min-w-0">
            {specialtyQuery.isLoading && !specialtyQuery.data ? (
              <SpecialtyDetailSkeleton />
            ) : specialtyQuery.isError ? (
              <CompetenciesStateMessage
                error={specialtyQuery.error}
                onRetry={() => void specialtyQuery.refetch()}
              />
            ) : specialtyQuery.data ? (
              <SpecialtyDetailPanel
                detail={specialtyQuery.data}
                loading={specialtyQuery.isFetching && !specialtyQuery.isLoading}
                compactHeader
              />
            ) : (
              <p className="rounded-xl border border-dashed border-cyan-400/15 px-3 py-6 text-center text-sm text-slate-400">
                Seleccione una especialidad para ver el detalle.
              </p>
            )}
          </div>
        </>
      ) : null}

      {profile.mvpCapabilities ? (
        <MvpCapabilitiesSections mvp={profile.mvpCapabilities} />
      ) : null}
    </div>
  )
}

function MvpCapabilitiesSections({
  mvp,
}: {
  mvp: NonNullable<
    import('../types').CompetencyProfessionalProfile['mvpCapabilities']
  >
}) {
  const evidenceLabel = (level: string) => {
    if (level === 'STRONG') return 'Evidencia fuerte'
    if (level === 'MODERATE') return 'Evidencia moderada'
    if (level === 'WEAK') return 'Evidencia limitada'
    return 'Capacidad emergente'
  }

  const CapList = ({
    title,
    items,
  }: {
    title: string
    items: Array<{
      label: string
      evidenceLevel: string
      sourceCount: number
    }>
  }) => {
    if (!items.length) return null
    return (
      <section className="min-w-0 rounded-xl border border-cyan-400/10 bg-[#06111f]/40 px-3 py-3">
        <p className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={`${title}-${item.label}`}
              className="flex min-w-0 items-baseline justify-between gap-2 text-[13px] text-slate-200"
            >
              <span className="min-w-0 truncate font-medium">{item.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-slate-500">
                {evidenceLabel(item.evidenceLevel)}
                {item.sourceCount > 1 ? ` · ${item.sourceCount}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const ToolList = ({
    title,
    items,
  }: {
    title: string
    items: Array<{ label: string; hasProfessionalContext: boolean }>
  }) => {
    if (!items.length) return null
    return (
      <section className="min-w-0 rounded-xl border border-slate-500/15 bg-slate-950/30 px-3 py-3">
        <p className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={`${title}-${item.label}`}
              className="rounded-md border border-slate-600/30 px-2 py-1 text-[12px] text-slate-300"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const hasAny =
    mvp.consolidatedCapabilities.length > 0 ||
    mvp.complementaryCapabilities.length > 0 ||
    mvp.emergingCapabilities.length > 0 ||
    mvp.tools.length > 0 ||
    mvp.methodologies.length > 0

  if (!hasAny) return null

  return (
    <div className="flex flex-col gap-2.5">
      <CapList
        title="Competencias consolidadas"
        items={mvp.consolidatedCapabilities}
      />
      <CapList
        title="Competencias complementarias"
        items={mvp.complementaryCapabilities}
      />
      <ToolList title="Herramientas" items={mvp.tools} />
      <ToolList title="Metodologías" items={mvp.methodologies} />
      <CapList
        title="Capacidades emergentes"
        items={mvp.emergingCapabilities}
      />
    </div>
  )
}
