import { describe, expect, it } from 'vitest'
import type { CompetencyProfessionalDomain } from '../types'

/** Lógica de selección de dominio (espejo del explorer). */
export function resolveSelectedDomain(
  domains: CompetencyProfessionalDomain[],
  defaultDomainCode: string | null,
  userSelected: string | null,
): CompetencyProfessionalDomain | null {
  if (!domains.length) return null
  if (userSelected && domains.some((d) => d.code === userSelected)) {
    return domains.find((d) => d.code === userSelected) ?? null
  }
  if (defaultDomainCode) {
    const d = domains.find((x) => x.code === defaultDomainCode)
    if (d) return d
  }
  return domains[0] ?? null
}

function domain(
  partial: Partial<CompetencyProfessionalDomain> & { code: string },
): CompetencyProfessionalDomain {
  return {
    name: partial.name ?? partial.code,
    qualification: partial.qualification ?? 'PRIMARY_MATCH',
    evaluationId: partial.evaluationId ?? '1',
    isPublishedPrimary: partial.isPublishedPrimary ?? false,
    evaluatedAt: null,
    rulesVersion: 'pa2',
    defaultSpecialtyCode: null,
    activeSpecialtyCount: 0,
    emergentSpecialtyCount: 0,
    summary: 'resumen',
    specialties: [],
    warnings: [],
    ...partial,
  }
}

describe('resolveSelectedDomain (piloto multidominio)', () => {
  it('un dominio → ese dominio; selector no aplica', () => {
    const domains = [
      domain({ code: 'VISUAL_DESIGN', qualification: 'SECONDARY_SIGNAL' }),
    ]
    expect(resolveSelectedDomain(domains, 'VISUAL_DESIGN', null)?.code).toBe(
      'VISUAL_DESIGN',
    )
    expect(domains.length > 1).toBe(false)
  })

  it('dos dominios: default + cambio sin mezcla', () => {
    const domains = [
      domain({
        code: 'VISUAL_DESIGN',
        qualification: 'SECONDARY_SIGNAL',
        specialties: [
          {
            code: 'VISUAL_GRAPHIC',
            name: 'Gráfico',
            presentationStatus: 'EMERGENT',
            isDefault: false,
            rank: 1,
            metrics: {
              mappedSkillCount: 1,
              evidencedSkillCount: 1,
              coverage: 1,
              confidence: 0.5,
              strength: 30,
            },
            warnings: [],
          },
        ],
      }),
      domain({
        code: 'SOFTWARE',
        qualification: 'SECONDARY_SIGNAL',
        specialties: [
          {
            code: 'SOFTWARE_FRONTEND',
            name: 'Frontend',
            presentationStatus: 'EMERGENT',
            isDefault: false,
            rank: 1,
            metrics: {
              mappedSkillCount: 1,
              evidencedSkillCount: 1,
              coverage: 1,
              confidence: 0.5,
              strength: 30,
            },
            warnings: [],
          },
        ],
      }),
    ]
    const visual = resolveSelectedDomain(domains, 'VISUAL_DESIGN', null)
    expect(visual?.code).toBe('VISUAL_DESIGN')
    expect(visual?.specialties.map((s) => s.code)).toEqual(['VISUAL_GRAPHIC'])

    const software = resolveSelectedDomain(domains, 'VISUAL_DESIGN', 'SOFTWARE')
    expect(software?.code).toBe('SOFTWARE')
    expect(software?.specialties.map((s) => s.code)).toEqual([
      'SOFTWARE_FRONTEND',
    ])
    expect(software?.specialties.some((s) => s.code.startsWith('VISUAL_'))).toBe(
      false,
    )
  })

  it('al cambiar persona no conserva dominio inexistente', () => {
    const next = [
      domain({ code: 'SOFTWARE', qualification: 'PRIMARY_MATCH' }),
    ]
    expect(resolveSelectedDomain(next, 'SOFTWARE', 'VISUAL_DESIGN')?.code).toBe(
      'SOFTWARE',
    )
  })

  it('HIDDEN no se incluye vía partition en el panel (contrato de specialties)', () => {
    const d = domain({
      code: 'VISUAL_DESIGN',
      specialties: [
        {
          code: 'VISUAL_GRAPHIC',
          name: 'Gráfico',
          presentationStatus: 'EMERGENT',
          isDefault: false,
          rank: 1,
          metrics: {
            mappedSkillCount: 1,
            evidencedSkillCount: 1,
            coverage: 1,
            confidence: 0.5,
            strength: 34,
          },
          warnings: [],
        },
        {
          code: 'VISUAL_UI',
          name: 'UI',
          presentationStatus: 'HIDDEN',
          isDefault: false,
          rank: 5,
          metrics: {
            mappedSkillCount: 0,
            evidencedSkillCount: 0,
            coverage: 0,
            confidence: 0,
            strength: 0,
          },
          warnings: [],
        },
      ],
    })
    const visible = d.specialties.filter((s) => s.presentationStatus !== 'HIDDEN')
    expect(visible.map((s) => s.code)).toEqual(['VISUAL_GRAPHIC'])
    expect(visible.some((s) => s.code === 'VISUAL_UI')).toBe(false)
  })
})
