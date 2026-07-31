import type {
  CompetencyExplorerPerson,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
} from '../types/competencyExplorer.types'
import { uniquePreserveOrder } from './uniquePreserveOrder'

/**
 * Dominios efectivos de una persona a partir de primaryDomain,
 * especialidades y skills (vía catálogos mock).
 */
export function resolvePersonEffectiveDomains(
  person: CompetencyExplorerPerson,
  skills: readonly CompetencyExplorerSkill[],
  specialties: readonly CompetencyExplorerSpecialty[],
): string[] {
  const skillByCode = new Map(skills.map((s) => [s.code, s]))
  const specialtyByCode = new Map(specialties.map((s) => [s.code, s]))
  const codes: string[] = [person.primaryDomainCode]

  for (const specialtyCode of person.specialtyCodes) {
    const specialty = specialtyByCode.get(specialtyCode)
    if (specialty) codes.push(specialty.domainCode)
  }

  for (const skillCode of person.skillCodes) {
    const skill = skillByCode.get(skillCode)
    if (skill) codes.push(skill.domainCode)
  }

  return uniquePreserveOrder(codes)
}

/**
 * Especialidades efectivas: person.specialtyCodes + especialidades
 * derivadas de skills.
 */
export function resolvePersonEffectiveSpecialties(
  person: CompetencyExplorerPerson,
  skills: readonly CompetencyExplorerSkill[],
): string[] {
  const skillByCode = new Map(skills.map((s) => [s.code, s]))
  const codes: string[] = [...person.specialtyCodes]

  for (const skillCode of person.skillCodes) {
    const skill = skillByCode.get(skillCode)
    if (skill) codes.push(skill.specialtyCode)
  }

  return uniquePreserveOrder(codes)
}
