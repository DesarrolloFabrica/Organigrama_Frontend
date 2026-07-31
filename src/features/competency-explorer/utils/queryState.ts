import type {
  CompetencyExplorerQueryState,
  CompetencyExplorerSelection,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  ExplorerContentMode,
  KnowledgeSearchHit,
  QuerySelectionSource,
} from '../types/competencyExplorer.types'

export const EMPTY_QUERY: CompetencyExplorerQueryState = {
  domains: [],
  specialties: [],
  skills: [],
}

export function selectionCodes(
  items: CompetencyExplorerSelection[],
): string[] {
  return items.map((s) => s.code)
}

/** Solo códigos con source USER (filtran el ranking). */
export function userSelectionCodes(
  items: CompetencyExplorerSelection[],
): string[] {
  return items.filter((s) => s.source === 'USER').map((s) => s.code)
}

export function hasUserCriteria(query: CompetencyExplorerQueryState): boolean {
  return (
    userSelectionCodes(query.domains).length > 0 ||
    userSelectionCodes(query.specialties).length > 0 ||
    userSelectionCodes(query.skills).length > 0
  )
}

export function hasSelection(
  items: CompetencyExplorerSelection[],
  code: string,
): boolean {
  return items.some((s) => s.code === code)
}

export function getSource(
  items: CompetencyExplorerSelection[],
  code: string,
): QuerySelectionSource | null {
  return items.find((s) => s.code === code)?.source ?? null
}

export function isQueryEmpty(query: CompetencyExplorerQueryState): boolean {
  return (
    query.domains.length === 0 &&
    query.specialties.length === 0 &&
    query.skills.length === 0
  )
}

/**
 * Área principal: ranking ante cualquier criterio USER;
 * CONTEXT solo no activa ranking.
 */
export function resolveExplorerContentMode(
  query: CompetencyExplorerQueryState,
): ExplorerContentMode {
  if (!hasUserCriteria(query)) return 'initial'
  return 'ranking'
}

function upsertSelection(
  items: CompetencyExplorerSelection[],
  code: string,
  source: QuerySelectionSource,
): CompetencyExplorerSelection[] {
  const existing = items.find((s) => s.code === code)
  if (!existing) return [...items, { code, source }]
  if (existing.source === 'USER' || source === 'CONTEXT') return items
  return items.map((s) => (s.code === code ? { code, source: 'USER' } : s))
}

function removeSelection(
  items: CompetencyExplorerSelection[],
  code: string,
): CompetencyExplorerSelection[] {
  return items.filter((s) => s.code !== code)
}

/** Alterna dominio. No elimina especialidades/skills hijas en silencio. */
export function toggleDomain(
  query: CompetencyExplorerQueryState,
  domainCode: string,
): CompetencyExplorerQueryState {
  if (hasSelection(query.domains, domainCode)) {
    return {
      ...query,
      domains: removeSelection(query.domains, domainCode),
    }
  }
  return {
    ...query,
    domains: upsertSelection(query.domains, domainCode, 'USER'),
  }
}

/** Selecciona dominio como USER (p. ej. desde tarjeta inicial). */
export function selectDomainAsUser(
  query: CompetencyExplorerQueryState,
  domainCode: string,
): CompetencyExplorerQueryState {
  return {
    ...query,
    domains: upsertSelection(query.domains, domainCode, 'USER'),
  }
}

/**
 * Alterna especialidad. Si se agrega, asegura dominio CONTEXT
 * sin tocar otras selecciones hijas.
 */
export function toggleSpecialty(
  query: CompetencyExplorerQueryState,
  specialty: CompetencyExplorerSpecialty,
): CompetencyExplorerQueryState {
  if (hasSelection(query.specialties, specialty.code)) {
    return {
      ...query,
      specialties: removeSelection(query.specialties, specialty.code),
    }
  }
  return {
    domains: upsertSelection(query.domains, specialty.domainCode, 'CONTEXT'),
    specialties: upsertSelection(query.specialties, specialty.code, 'USER'),
    skills: query.skills,
  }
}

export function selectSpecialtyAsUser(
  query: CompetencyExplorerQueryState,
  specialty: CompetencyExplorerSpecialty,
): CompetencyExplorerQueryState {
  return {
    domains: upsertSelection(query.domains, specialty.domainCode, 'CONTEXT'),
    specialties: upsertSelection(query.specialties, specialty.code, 'USER'),
    skills: query.skills,
  }
}

/**
 * Alterna skill. Si se agrega, asegura especialidad y dominio CONTEXT.
 */
export function toggleSkill(
  query: CompetencyExplorerQueryState,
  skill: CompetencyExplorerSkill,
): CompetencyExplorerQueryState {
  if (hasSelection(query.skills, skill.code)) {
    return {
      ...query,
      skills: removeSelection(query.skills, skill.code),
    }
  }
  return {
    domains: upsertSelection(query.domains, skill.domainCode, 'CONTEXT'),
    specialties: upsertSelection(
      query.specialties,
      skill.specialtyCode,
      'CONTEXT',
    ),
    skills: upsertSelection(query.skills, skill.code, 'USER'),
  }
}

export function selectSkillAsUser(
  query: CompetencyExplorerQueryState,
  skill: CompetencyExplorerSkill,
): CompetencyExplorerQueryState {
  return {
    domains: upsertSelection(query.domains, skill.domainCode, 'CONTEXT'),
    specialties: upsertSelection(
      query.specialties,
      skill.specialtyCode,
      'CONTEXT',
    ),
    skills: upsertSelection(query.skills, skill.code, 'USER'),
  }
}

export function removeDomainCriterion(
  query: CompetencyExplorerQueryState,
  code: string,
): CompetencyExplorerQueryState {
  return { ...query, domains: removeSelection(query.domains, code) }
}

export function removeSpecialtyCriterion(
  query: CompetencyExplorerQueryState,
  code: string,
): CompetencyExplorerQueryState {
  return { ...query, specialties: removeSelection(query.specialties, code) }
}

export function removeSkillCriterion(
  query: CompetencyExplorerQueryState,
  code: string,
): CompetencyExplorerQueryState {
  return { ...query, skills: removeSelection(query.skills, code) }
}

export function clearQuery(): CompetencyExplorerQueryState {
  return EMPTY_QUERY
}

export function applySearchHit(
  query: CompetencyExplorerQueryState,
  hit: KnowledgeSearchHit,
  specialtyByCode: Map<string, CompetencyExplorerSpecialty>,
  skillByCode: Map<string, CompetencyExplorerSkill>,
): CompetencyExplorerQueryState {
  if (hit.type === 'domain') {
    return selectDomainAsUser(query, hit.code)
  }
  if (hit.type === 'specialty') {
    const specialty = specialtyByCode.get(hit.code)
    if (!specialty) return query
    return selectSpecialtyAsUser(query, specialty)
  }
  const skill = skillByCode.get(hit.code)
  if (!skill) return query
  return selectSkillAsUser(query, skill)
}

/** Especialidades visibles en el constructor según dominios seleccionados. */
export function specialtiesForQuery(
  specialties: CompetencyExplorerSpecialty[],
  query: CompetencyExplorerQueryState,
): CompetencyExplorerSpecialty[] {
  const domainCodes = new Set(selectionCodes(query.domains))
  if (domainCodes.size === 0) return []
  return specialties.filter((s) => domainCodes.has(s.domainCode))
}

/** Skills visibles según especialidades seleccionadas. */
export function skillsForQuery(
  skills: CompetencyExplorerSkill[],
  query: CompetencyExplorerQueryState,
): CompetencyExplorerSkill[] {
  const specialtyCodes = new Set(selectionCodes(query.specialties))
  if (specialtyCodes.size === 0) return []
  return skills.filter((s) => specialtyCodes.has(s.specialtyCode))
}
