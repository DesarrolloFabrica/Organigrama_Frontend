import { useMemo, useState } from 'react'
import { Mc1DimensionRadar } from '../../mc1-profile-preview/Mc1DimensionRadar'
import type { Mc1PersonCompetenciesPresentation } from '../types'

type Props = {
  profile: Mc1PersonCompetenciesPresentation
}

function roleLabel(role: 'PRIMARY' | 'SECONDARY'): string {
  return role === 'PRIMARY' ? 'Principal' : 'Secundario'
}

function evidenceLabel(v: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  if (v === 'LOW') return 'Evidencia limitada'
  if (v === 'MEDIUM') return 'Evidencia moderada'
  return 'Evidencia amplia'
}

/**
 * FASE 9F — Vista MC1 en Competencias de PersonDetail.
 * Reemplaza el legacy cuando hay Profile Assembly AVAILABLE.
 */
export function Mc1PersonCompetenciesView({ profile }: Props) {
  const fields = profile.fields
  const [activeCode, setActiveCode] = useState(
    () => fields.find((f) => f.role === 'PRIMARY')?.code ?? fields[0]?.code ?? '',
  )

  const field = useMemo(
    () => fields.find((f) => f.code === activeCode) ?? fields[0] ?? null,
    [fields, activeCode],
  )

  if (!field) {
    return (
      <p className="text-sm text-slate-400">Sin campos MC1 disponibles.</p>
    )
  }

  const showTabs = fields.length > 1
  const hasRadar = field.competencyMap.dimensions.some(
    (d) => d.relativeCoverage > 0,
  )

  return (
    <div className="mc-explorer flex flex-col gap-4 overflow-x-visible pb-2">
      <header className="min-w-0 rounded-xl border border-teal-400/20 bg-[#06111f]/55 px-3 py-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/80">
          Perfil MC1
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Ensamblaje local ARTIFACT_ONLY · no Cloud
        </p>
      </header>

      {showTabs ? (
        <div className="flex flex-wrap gap-2">
          {fields.map((f) => (
            <button
              key={f.code}
              type="button"
              onClick={() => setActiveCode(f.code)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                f.code === field.code
                  ? 'border-teal-400/50 bg-teal-500/15 text-teal-50'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <section className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Campo profesional
        </p>
        <h3 className="text-lg font-semibold text-slate-50">{field.label}</h3>
        {field.derivedPresentationLabel ? (
          <p className="text-sm text-cyan-300/90">
            {field.derivedPresentationLabel}
          </p>
        ) : null}
        <p className="text-sm text-slate-400">
          <span
            className={
              field.role === 'PRIMARY' ? 'text-teal-300' : 'text-sky-300'
            }
          >
            {roleLabel(field.role)}
          </span>
          <span className="mx-2 text-slate-600">·</span>
          <span title="Cantidad de evidencia profesional observada en el CV.">
            {evidenceLabel(field.evidenceVolume)}
          </span>
        </p>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Especialidades
        </h4>
        <div className="flex flex-wrap gap-2">
          {field.specialties.length ? (
            field.specialties.map((s) => (
              <span
                key={s.code}
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-100"
              >
                {s.label}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Sin especialidades observadas.
            </p>
          )}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Skills
        </h4>
        <div className="space-y-3">
          {field.specialties.map((sp) => (
            <div key={sp.code}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {sp.label}
              </p>
              {sp.skills.length ? (
                <ul className="space-y-1.5">
                  {sp.skills.map((sk) => (
                    <li
                      key={sk.code}
                      className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-sm text-slate-100"
                    >
                      {sk.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Sin skills observadas.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tools / Technologies
        </h4>
        <div className="flex flex-wrap gap-2">
          {field.tools.length ? (
            field.tools.map((t) => (
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

      <section>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Mapa de competencias
        </h4>
        {hasRadar ? (
          <>
            <p className="mb-3 text-xs text-slate-500">
              Cobertura relativa de práctica observada en el CV.
            </p>
            <Mc1DimensionRadar
              axes={field.competencyMap.dimensions.map((d) => ({
                dimensionCode: d.code,
                label: d.label,
                relativeCoverage: d.relativeCoverage,
              }))}
            />
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Radar no disponible: sin cobertura dimensional observada.
          </p>
        )}
      </section>
    </div>
  )
}
