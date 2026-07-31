import { describe, expect, it } from 'vitest'
import { MOCK_EXPLORER_SKILLS } from './competencyExplorer.mock'
import { MOCK_EXPLORER_PEOPLE } from './competencyExplorer.people.mock'

const skillCodes = new Set(MOCK_EXPLORER_SKILLS.map((s) => s.code))

describe('MOCK_EXPLORER_PEOPLE', () => {
  it('tiene al menos 12 personas', () => {
    expect(MOCK_EXPLORER_PEOPLE.length).toBeGreaterThanOrEqual(12)
  })

  it('no incluye campos de organigrama o cargo', () => {
    for (const person of MOCK_EXPLORER_PEOPLE) {
      const keys = Object.keys(person)
      expect(keys).not.toContain('role')
      expect(keys).not.toContain('cargo')
      expect(keys).not.toContain('dependency')
      expect(keys).not.toContain('dependencia')
      expect(keys).not.toContain('manager')
      expect(keys).not.toContain('jefe')
      expect(keys).not.toContain('profession')
      expect(keys).not.toContain('profesion')
    }
  })

  it('referencia solo skill codes existentes en el catálogo mock', () => {
    for (const person of MOCK_EXPLORER_PEOPLE) {
      for (const code of person.skillCodes) {
        expect(skillCodes.has(code)).toBe(true)
      }
    }
  })

  it('comparte skills entre varias personas', () => {
    const owners = new Map<string, number>()
    for (const person of MOCK_EXPLORER_PEOPLE) {
      for (const code of person.skillCodes) {
        owners.set(code, (owners.get(code) ?? 0) + 1)
      }
    }
    const shared = [...owners.values()].filter((n) => n >= 2)
    expect(shared.length).toBeGreaterThan(0)
  })

  it('incluye perfiles multi-especialidad y multi-dominio', () => {
    expect(
      MOCK_EXPLORER_PEOPLE.some((p) => p.specialtyCodes.length >= 2),
    ).toBe(true)
    expect(
      MOCK_EXPLORER_PEOPLE.some((p) => {
        const domains = new Set(
          p.skillCodes.map(
            (code) =>
              MOCK_EXPLORER_SKILLS.find((s) => s.code === code)?.domainCode,
          ),
        )
        return [...domains].filter(Boolean).length >= 2
      }),
    ).toBe(true)
  })
})
