import { useId, useState } from 'react'
import type { CompetencySkill } from '../types'
import {
  formatConfidencePercent,
  formatEvidenceLevel,
  formatSourceType,
  formatStrength,
} from '../utils/competencyFormat'

type Props = {
  skill: CompetencySkill
}

export function SkillAccordionItem({ skill }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const isSecondary = skill.mapping.role === 'SECONDARY'
  const strength = formatStrength(skill.evidence.strength)
  const confidence = formatConfidencePercent(skill.evidence.confidence)

  return (
    <div className="min-w-0 rounded-lg bg-cyan-950/25">
      <button
        type="button"
        className="flex w-full min-w-0 items-start justify-between gap-2 px-2.5 py-2 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-100">{skill.name}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
            <span>{isSecondary ? 'Secundaria' : 'Principal'}</span>
            <span className="mx-1 text-slate-600" aria-hidden>
              ·
            </span>
            <span>{formatEvidenceLevel(skill.evidence.level)}</span>
          </p>
          {!open ? (
            <p className="mt-0.5 font-mono text-[10px] text-slate-500">
              Strength {strength} · Confidence {confidence}
            </p>
          ) : null}
        </div>
        <span
          className="mt-0.5 font-mono text-[10px] text-cyan-300/80"
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-cyan-400/10 px-2.5 py-2">
          <dl className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Mapping
              </dt>
              <dd className="font-semibold text-slate-200">
                {isSecondary ? 'SECONDARY' : 'PRIMARY'}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Peso
              </dt>
              <dd className="font-semibold text-slate-200">
                {skill.mapping.weight}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Evidence level
              </dt>
              <dd className="font-semibold text-slate-200">
                {formatEvidenceLevel(skill.evidence.level)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Strength
              </dt>
              <dd className="font-semibold text-slate-200">{strength}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Confidence
              </dt>
              <dd className="font-semibold text-slate-200">{confidence}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Evidencias
              </dt>
              <dd className="font-semibold text-slate-200">
                {skill.evidence.items.length}
              </dd>
            </div>
          </dl>

          {skill.type ? (
            <p className="mt-2 text-[11px] text-slate-500">Tipo: {skill.type}</p>
          ) : null}

          {skill.evidence.items.length > 0 ? (
            <ul
              className="mt-3 space-y-2"
              aria-label={`Evidencias de ${skill.name}`}
            >
              {skill.evidence.items.map((item, idx) => (
                <li
                  key={`${skill.id}-${idx}`}
                  className="rounded-md border border-cyan-400/10 bg-[#041018]/60 px-2.5 py-2"
                >
                  {item.sourceType ? (
                    <p className="font-mono text-[9px] uppercase tracking-wide text-slate-500">
                      {formatSourceType(item.sourceType)}
                    </p>
                  ) : null}
                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-300">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] text-slate-500">
              Sin fragmentos de evidencia disponibles.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
