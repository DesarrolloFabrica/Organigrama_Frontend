import { describe, expect, it } from 'vitest'
import {
  activeQueryPeopleLabel,
  matchModeLabel,
  personInitials,
  rankingCriteriaComposition,
  rankingSummaryText,
  resolveCatalogName,
  visibleItemsWithOverflow,
} from './personMatchPresentation'

describe('personMatchPresentation', () => {
  it('genera iniciales (máx. 2)', () => {
    expect(personInitials('Laura Mendoza Ruiz')).toBe('LR')
    expect(personInitials('Ana')).toBe('AN')
  })

  it('resume ranking por criterios', () => {
    expect(
      rankingSummaryText(8, { domains: 1, specialties: 0, skills: 0 }),
    ).toBe('8 personas coinciden con 1 criterio seleccionado')
    expect(
      rankingSummaryText(3, { domains: 1, specialties: 2, skills: 1 }),
    ).toBe('3 personas coinciden con 4 criterios seleccionados')
  })

  it('compone criterios', () => {
    expect(
      rankingCriteriaComposition({ domains: 1, specialties: 1, skills: 0 }),
    ).toBe('1 dominio · 1 especialidad')
  })

  it('etiqueta modos de coincidencia', () => {
    expect(matchModeLabel('ANY')).toBe('Coincidencia amplia')
    expect(matchModeLabel('ALL')).toBe('Coincidencia exacta')
  })

  it('limita chips visibles', () => {
    expect(visibleItemsWithOverflow(['a', 'b', 'c', 'd', 'e'], 4).overflow).toBe(
      1,
    )
  })

  it('resuelve nombres de catálogo', () => {
    expect(
      resolveCatalogName('SKILL_REACT', [
        { code: 'SKILL_REACT', name: 'React' },
      ]),
    ).toBe('React')
  })

  it('ActiveQueryBar labels', () => {
    expect(activeQueryPeopleLabel(0)).toBe('Sin coincidencias')
    expect(activeQueryPeopleLabel(8)).toBe('8 personas')
  })
})
