import { describe, expect, it } from 'vitest'
import {
  buildTrajectoryNarrative,
  isInterfaceOrientedRole,
} from './trajectoryNarrative'

describe('trajectoryNarrative', () => {
  it('detecta rol orientado a interfaces', () => {
    expect(isInterfaceOrientedRole('Diseñadora UX/UI')).toBe(true)
    expect(isInterfaceOrientedRole('DISEÑADOR UX/UI')).toBe(true)
    expect(isInterfaceOrientedRole('ANALISTA DE DISEÑO DE CONTENIDOS')).toBe(
      false,
    )
  })

  it('genera narrativa cuando cargo UX/UI y dominio Visual con principal no VISUAL_UI', () => {
    const text = buildTrajectoryNarrative({
      roleName: 'Diseñadora UX/UI',
      domainName: 'Diseño Visual',
      domainCode: 'VISUAL_DESIGN',
      primarySpecialtyName: 'Diseño gráfico',
      primarySpecialtyCode: 'VISUAL_GRAPHIC',
    })
    expect(text).toContain('Diseño Visual')
    expect(text).toContain('Diseño gráfico')
    expect(text).toContain('Diseñadora UX/UI')
    expect(text).toContain('Diseño de Interfaces')
  })

  it('no inventa narrativa UX→Interfaces cuando el dominio MC1 es Software', () => {
    expect(
      buildTrajectoryNarrative({
        roleName: 'DISEÑADOR UX/UI',
        domainName: 'Desarrollo de Software',
        domainCode: 'SOFTWARE',
        primarySpecialtyName: 'Frontend',
        primarySpecialtyCode: 'SOFTWARE_FRONTEND',
      }),
    ).toBeNull()
  })

  it('no inventa narrativa si el cargo no es UX/UI', () => {
    expect(
      buildTrajectoryNarrative({
        roleName: 'ANALISTA DE DISEÑO DE CONTENIDOS',
        domainName: 'Diseño Visual',
        domainCode: 'VISUAL_DESIGN',
        primarySpecialtyName: 'Diseño gráfico',
        primarySpecialtyCode: 'VISUAL_GRAPHIC',
      }),
    ).toBeNull()
  })

  it('no usa cargo UX/UI como identidad MC1 en Audiovisual', () => {
    expect(
      buildTrajectoryNarrative({
        roleName: 'Diseñador UX/UI',
        domainName: 'Producción Audiovisual',
        domainCode: 'AUDIOVISUAL_PRODUCTION',
        primarySpecialtyName: 'Edición',
        primarySpecialtyCode: 'AV_EDITING',
      }),
    ).toBeNull()
  })
})
