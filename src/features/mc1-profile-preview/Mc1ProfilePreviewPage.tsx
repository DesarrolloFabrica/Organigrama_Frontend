import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchPreviewCases, fetchPreviewPresentation } from './api'
import { Mc1DimensionRadar } from './Mc1DimensionRadar'
import type {
  PreviewAvailability,
  PreviewCaseSummary,
  PreviewField,
  PreviewPresentation,
} from './types'

function statusTone(a: PreviewAvailability): string {
  if (a === 'PROFILE_AVAILABLE')
    return 'bg-teal-500/15 text-teal-200 border-teal-400/40'
  if (a === 'PARTIAL_PROFILE')
    return 'bg-amber-500/15 text-amber-200 border-amber-400/40'
  if (a === 'PROCESSING_ERROR')
    return 'bg-rose-500/15 text-rose-200 border-rose-400/40'
  return 'bg-slate-500/20 text-slate-300 border-slate-400/30'
}

function roleLabel(role: 'PRIMARY' | 'SECONDARY'): string {
  return role === 'PRIMARY' ? 'Principal' : 'Secundario'
}

function evidenceVolumeLabel(
  volume: PreviewField['evidenceVolume'],
): string {
  if (volume === 'LOW') return 'Evidencia limitada'
  if (volume === 'MEDIUM') return 'Evidencia moderada'
  return 'Evidencia amplia'
}

const EVIDENCE_TOOLTIP =
  'Cantidad de evidencia profesional observada en el CV.'

function FieldBlock({
  field,
  debug,
}: {
  field: PreviewField
  debug: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Campo profesional
          </p>
          <h2 className="text-2xl font-semibold text-slate-50">
            {field.fieldLabel}
          </h2>
          {field.derivedPresentationLabel ? (
            <p className="mt-1 text-sm text-cyan-300/90">
              {field.derivedPresentationLabel}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-slate-400">
            <span
              className={
                field.role === 'PRIMARY' ? 'text-teal-300' : 'text-sky-300'
              }
            >
              {roleLabel(field.role)}
            </span>
            {debug && field.r1Confidence != null
              ? ` · conf ${field.r1Confidence}`
              : null}
          </p>
        </div>
        <div
          className="rounded-full border border-slate-600/60 px-3 py-1 text-xs text-slate-300"
          title={EVIDENCE_TOOLTIP}
        >
          {evidenceVolumeLabel(field.evidenceVolume)}
          {debug ? ` · units ${field.evidenceUnitCount}` : ''}
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">
          Especialidades
        </h3>
        <div className="flex flex-wrap gap-2">
          {field.specialties.length ? (
            field.specialties.map((s) => (
              <span
                key={s.specialtyCode}
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-100"
                title={debug ? `conf ${s.confidence}` : undefined}
              >
                {s.name}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              Catálogo de especialidades pendiente para este campo.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Skills
        </h3>
        <div className="space-y-4">
          {field.skillsBySpecialty.map((group) => (
            <div key={group.specialtyCode}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {group.specialtyName}
              </p>
              <ul className="space-y-1.5">
                {group.skills.map((sk) => (
                  <li
                    key={sk.skillCode}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-sm text-slate-100"
                  >
                    {sk.name}
                    {debug ? (
                      <span className="mt-1 block text-xs text-slate-500">
                        {sk.skillCode} · conf {sk.confidence} · evid{' '}
                        {sk.supportingEvidenceUnitIds.length}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!field.skillsBySpecialty.some((g) => g.skills.length) ? (
            <p className="text-sm text-slate-500">Sin skills observadas.</p>
          ) : null}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">
          Tools / Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {field.toolsTechnologies.length ? (
            field.toolsTechnologies.map((t) => (
              <span
                key={t}
                className="rounded-md border border-slate-600/50 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300"
              >
                {t}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sin herramientas listadas.</p>
          )}
        </div>
      </section>

      {field.radar.axes.some(
        (a) => (a.displayCoverage ?? a.relativeCoverage) > 0,
      ) ? (
        <section>
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wide text-slate-400">
            Mapa de competencias
          </h3>
          <p className="mb-3 text-xs text-slate-500">
            Mapa relativo de competencias basado en la evidencia disponible en
            el perfil. No representa un porcentaje absoluto de dominio.
          </p>
          <Mc1DimensionRadar axes={field.radar.axes} debug={debug} />
        </section>
      ) : (
        <section>
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wide text-slate-400">
            Mapa de competencias
          </h3>
          <p className="text-sm text-slate-500">
            Radar no disponible: sin skills observadas para este campo.
          </p>
        </section>
      )}

      {debug ? (
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100/90">
          <p className="mb-2 font-semibold uppercase tracking-wide">
            Debug · Skill → Dimension
          </p>
          <ul className="space-y-1">
            {field.skillDimensionMappings.map((m) => (
              <li key={m.skillCode}>
                <span className="text-amber-200">{m.skillCode}</span> →{' '}
                {m.dimensionCodes.join(', ') || '(none)'}
                <span className="block text-amber-100/60">
                  {m.mappingJustification}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export function Mc1ProfilePreviewPage() {
  const [params, setParams] = useSearchParams()
  const debug = params.get('debug') === '1'
  const caseId = params.get('caseId') ?? 'snap-1'

  const [cases, setCases] = useState<PreviewCaseSummary[]>([])
  const [presentation, setPresentation] = useState<PreviewPresentation | null>(
    null,
  )
  const [activeField, setActiveField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchPreviewCases()
        if (!cancelled) setCases(list)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'No se pudo cargar el listado de casos',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const data = await fetchPreviewPresentation({ caseId, debug })
        if (cancelled) return
        setPresentation(data)
        const primary =
          data.fields.find((f) => f.role === 'PRIMARY')?.fieldCode ??
          data.fields[0]?.fieldCode ??
          null
        setActiveField(primary)
      } catch (e) {
        if (!cancelled) {
          setPresentation(null)
          setError(
            e instanceof Error ? e.message : 'No se pudo cargar el perfil',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [caseId, debug])

  const selectedField = useMemo(
    () => presentation?.fields.find((f) => f.fieldCode === activeField) ?? null,
    [presentation, activeField],
  )

  const artifactCases = cases.filter((c) => c.kind === 'ARTIFACT_SNAPSHOT')
  const personCasesB = cases.filter(
    (c) => c.kind === 'REAL_PERSON' && (c.cohortGroup ?? 'B') === 'B',
  )
  const personCasesC = cases.filter(
    (c) => c.kind === 'REAL_PERSON' && c.cohortGroup === 'C',
  )

  const selectCase = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('caseId', id)
    setParams(next, { replace: true })
  }

  const toggleDebug = () => {
    const next = new URLSearchParams(params)
    if (debug) next.delete('debug')
    else next.set('debug', '1')
    setParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-400/80">
              Dev · MC1 Profile Preview
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Vista previa de competencias
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Revisión visual local de perfiles MC1. No escribe en Cloud ni en el
              perfil productivo.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDebug}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-400/50 hover:text-teal-200"
          >
            {debug ? 'Ocultar debug' : 'Mostrar debug (?debug=1)'}
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grupo A · snapshots
              </p>
              <ul className="space-y-1">
                {artifactCases.map((c) => (
                  <li key={c.caseId}>
                    <button
                      type="button"
                      onClick={() => selectCase(c.caseId)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        caseId === c.caseId
                          ? 'border-teal-400/50 bg-teal-500/10 text-teal-50'
                          : 'border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="block font-medium">{c.label}</span>
                      {debug ? (
                        <span className="mt-0.5 block text-[11px] text-slate-500">
                          {c.fieldCodes.join(' · ') || '—'}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grupo B · personas reales
              </p>
              <ul className="space-y-1">
                {personCasesB.map((c) => (
                  <li key={c.caseId}>
                    <button
                      type="button"
                      onClick={() => selectCase(c.caseId)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        caseId === c.caseId
                          ? 'border-sky-400/50 bg-sky-500/10 text-sky-50'
                          : 'border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="block font-medium leading-snug">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {c.availability === 'PIPELINE_NOT_READY'
                          ? 'Pendiente de procesamiento'
                          : c.availability}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grupo C · software cohort
              </p>
              <ul className="space-y-1">
                {personCasesC.map((c) => (
                  <li key={c.caseId}>
                    <button
                      type="button"
                      onClick={() => selectCase(c.caseId)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        caseId === c.caseId
                          ? 'border-violet-400/50 bg-violet-500/10 text-violet-50'
                          : 'border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="block font-medium leading-snug">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {c.availability === 'PIPELINE_NOT_READY'
                          ? 'Pendiente de procesamiento'
                          : c.availability}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-[0_0_40px_rgba(15,23,42,0.45)] md:p-7">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando perfil…</p>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
                <p className="mt-2 text-xs text-rose-200/70">
                  Asegura el backend local en :3000 con la preview habilitada
                  (no-production).
                </p>
              </div>
            ) : null}

            {presentation && !loading ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-800 text-lg font-semibold text-slate-200">
                    {presentation.photoUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}${presentation.photoUrl}`}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      presentation.label
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() ?? '')
                        .join('')
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-50">
                      {presentation.label}
                    </h2>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs ${statusTone(presentation.availability)}`}
                    >
                      {presentation.mc1StatusLabel}
                    </span>
                    {debug && presentation.r1FieldResolutionStatus ? (
                      <p className="mt-1 text-xs text-slate-500">
                        R1: {presentation.r1FieldResolutionStatus}
                      </p>
                    ) : null}
                  </div>
                </div>

                {presentation.availability === 'PIPELINE_NOT_READY' ? (
                  <div className="rounded-xl border border-slate-600/50 bg-slate-900/50 p-4 text-sm text-slate-300">
                    <p className="font-medium text-slate-100">
                      Perfil aún no procesado
                    </p>
                    <p className="mt-1 text-slate-400">
                      No hay ensamblaje MC1 disponible para esta persona. No se
                      fabrican resultados. Procesar el CV en una fase posterior
                      antes de la revisión visual.
                    </p>
                    {debug ? (
                      <p className="mt-2 font-mono text-[11px] text-slate-500">
                        PIPELINE_NOT_READY
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {presentation.fields.length > 1 ? (
                  <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                    {presentation.fields.map((f) => (
                      <button
                        key={f.fieldCode}
                        type="button"
                        onClick={() => setActiveField(f.fieldCode)}
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          activeField === f.fieldCode
                            ? 'bg-teal-500/20 text-teal-100'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.fieldLabel}
                        <span className="ml-1.5 text-[10px] opacity-70">
                          {roleLabel(f.role)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedField ? (
                  <FieldBlock field={selectedField} debug={debug} />
                ) : presentation.availability !== 'PIPELINE_NOT_READY' ? (
                  <p className="text-sm text-slate-400">
                    Sin campos para mostrar.
                  </p>
                ) : null}

                {debug && presentation.debug ? (
                  <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 font-mono text-[11px] leading-relaxed text-slate-400">
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Debug local
                    </p>
                    <p>snapshotId: {presentation.debug.snapshotId}</p>
                    <p>packDir: {presentation.debug.packDir}</p>
                    <p>producedAt: {presentation.debug.producedAt}</p>
                    <p>formula: {presentation.debug.formulaVersion}</p>
                    <p>semantics: {presentation.debug.radarSemantics}</p>
                    <p>
                      provenance.r1:{' '}
                      {String(presentation.debug.provenance.r1PackDir)}
                    </p>
                    <p>
                      provenance.p3:{' '}
                      {String(presentation.debug.provenance.p3PackDir)}
                    </p>
                    <p>
                      provenance.p4:{' '}
                      {String(presentation.debug.provenance.p4PackDir)}
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {presentation.debug.warnings.map((w) => (
                        <li key={w.code}>
                          [{w.severity}] {w.code}: {w.messageSafe}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}
