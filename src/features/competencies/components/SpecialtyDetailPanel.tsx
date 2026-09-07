import type { CompetencySpecialtyDetail } from '../types'
import {
  formatConfidencePercent,
  formatCoveragePercent,
  formatEvaluatedAt,
  formatPresentationStatus,
  translateReason,
  translateWarning,
} from '../utils/competencyFormat'
import { formatStrengthScale } from '../utils/competencyLayout'
import { SkillAccordionItem } from './SkillAccordionItem'

type Props = {
  detail: CompetencySpecialtyDetail
  loading?: boolean
  /** Si true, omite el encabezado de nombre (ya mostrado arriba). */
  compactHeader?: boolean
}

export function SpecialtyDetailPanel({
  detail,
  loading,
  compactHeader = false,
}: Props) {
  return (
    <div
      className={[
        'min-w-0 overflow-x-hidden rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-3 py-3',
        loading ? 'opacity-70' : '',
      ].join(' ')}
      aria-busy={loading || undefined}
    >
      {!compactHeader ? (
        <header className="min-w-0">
          <h4 className="text-base font-semibold leading-snug text-slate-50 [overflow-wrap:normal] [word-break:normal]">
            {detail.name}
          </h4>
          <p className="mt-1 text-[12px] text-slate-400">
            {detail.isDefault ? (
              <>
                <span className="text-cyan-200/90">Especialidad principal</span>
                <span className="mx-1 text-slate-600" aria-hidden>
                  ·
                </span>
              </>
            ) : null}
            <span>{formatPresentationStatus(detail.presentationStatus)}</span>
            <span className="mx-1 text-slate-600" aria-hidden>
              ·
            </span>
            <span>Posición #{detail.rank}</span>
          </p>
          {detail.evaluation.evaluatedAt ? (
            <p className="mt-1 font-mono text-[10px] text-slate-600">
              {formatEvaluatedAt(detail.evaluation.evaluatedAt)}
            </p>
          ) : null}
        </header>
      ) : detail.evaluation.evaluatedAt ? (
        <p className="font-mono text-[10px] text-slate-600">
          {formatEvaluatedAt(detail.evaluation.evaluatedAt)}
        </p>
      ) : null}

      <p className="mt-3 text-[13px] leading-snug text-slate-300">
        <span className="font-semibold text-slate-100">
          {detail.metrics.mappedSkillCount}
        </span>{' '}
        skills asociadas
        <span className="mx-1.5 text-slate-600" aria-hidden>
          ·
        </span>
        <span className="font-semibold text-slate-100">
          {detail.metrics.evidencedSkillCount}
        </span>{' '}
        con evidencia
      </p>

      <section className="mt-3" aria-label="Métricas de la especialidad">
        <div className="mc-metrics">
          <MetricBlock
            label="Cobertura"
            value={formatCoveragePercent(detail.metrics.coverage)}
            hint={`${detail.metrics.evidencedSkillCount} de ${detail.metrics.mappedSkillCount} skills respaldadas`}
          />
          <MetricBlock
            label="Confianza"
            value={formatConfidencePercent(detail.metrics.confidence)}
            hint="Fiabilidad de las evidencias"
          />
          <MetricBlock
            label="Fuerza de evidencia"
            value={formatStrengthScale(detail.metrics.strength)}
            hint="Intensidad del respaldo encontrado"
          />
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-400">
            Cómo interpretar estas métricas
          </summary>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-500">
            <li>
              <strong className="font-medium text-slate-400">Cobertura:</strong>{' '}
              proporción de skills de la especialidad con evidencia.
            </li>
            <li>
              <strong className="font-medium text-slate-400">Confianza:</strong>{' '}
              fiabilidad metodológica del conjunto de evidencias.
            </li>
            <li>
              <strong className="font-medium text-slate-400">
                Fuerza de evidencia:
              </strong>{' '}
              intensidad del respaldo en la hoja de vida (escala 0–100; no es
              seniority).
            </li>
          </ul>
        </details>
      </section>

      {detail.warnings.length > 0 ? (
        <section
          className="mt-3 rounded-lg bg-amber-950/20 px-3 py-2"
          aria-label="Advertencias metodológicas"
        >
          <h5 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/80">
            Advertencias
          </h5>
          <ul className="mt-1 space-y-1">
            {detail.warnings.map((w) => (
              <li
                key={w}
                className="text-[12px] leading-snug text-amber-100/85 [overflow-wrap:normal] [word-break:normal]"
              >
                {translateWarning(w)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="mt-3 border-t border-cyan-400/10 pt-3"
        aria-label="Skills de la especialidad"
      >
        <h5 className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Skills
        </h5>
        <div className="mt-2 space-y-1.5">
          {detail.skills.map((skill) => (
            <SkillAccordionItem
              key={`${skill.id}-${skill.mapping.role}`}
              skill={skill}
            />
          ))}
        </div>
      </section>

      {detail.reasons.length > 0 ? (
        <details className="mt-3 border-t border-cyan-400/10 pt-3">
          <summary className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-400">
            Por qué este estado
          </summary>
          <ul className="mt-1.5 space-y-1">
            {[...new Set(detail.reasons.map(translateReason))].map((r) => (
              <li
                key={r}
                className="text-[12px] leading-snug text-slate-300 [overflow-wrap:normal] [word-break:normal]"
              >
                · {r}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {detail.evaluation.audit ? (
        <details className="mt-3 border-t border-cyan-400/10 pt-3">
          <summary className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Información técnica
          </summary>
          <dl className="mt-2 grid gap-1 text-[11px] text-slate-400">
            <div>Evaluación: {detail.evaluation.id}</div>
            <div>Reglas: {detail.evaluation.rulesVersion}</div>
            <div>Catálogo: {detail.evaluation.audit.catalogVersion}</div>
            <div>Extracción: {detail.evaluation.audit.extractionId}</div>
            <div>Evidencia: {detail.evaluation.audit.evidenceEvaluationId}</div>
            {detail.evaluation.evaluatedAt ? (
              <div>Cálculo: {detail.evaluation.evaluatedAt}</div>
            ) : null}
          </dl>
        </details>
      ) : null}
    </div>
  )
}

function MetricBlock({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="mc-metric" role="group" aria-label={`${label}: ${value}`}>
      <p className="mc-metric__label">{label}</p>
      <p className="mc-metric__value">{value}</p>
      <p className="mc-metric__hint">{hint}</p>
    </div>
  )
}

export function SpecialtyDetailSkeleton() {
  return (
    <div
      className="h-56 animate-pulse rounded-xl border border-cyan-400/10 bg-cyan-950/30"
      aria-busy="true"
      aria-label="Cargando detalle de especialidad"
    />
  )
}
