/**
 * Tipos del Explorador de Competencias (descubrimiento por conocimiento).
 * Independientes del perfil MC1 por persona (`features/competencies`).
 */

export interface CompetencyExplorerStats {
  evaluatedPeople: number
  domains: number
  specialties: number
  skills: number
}

export interface CompetencyExplorerDomain {
  /** Código canónico MC1 (estable). */
  code: string
  name: string
  description: string
  specialtyCount: number
  peopleCount: number
}

export interface CompetencyExplorerSpecialty {
  code: string
  domainCode: string
  name: string
  description: string
  skillCount: number
  peopleCount: number
}

export interface CompetencyExplorerSkill {
  code: string
  specialtyCode: string
  domainCode: string
  name: string
  peopleCount: number
}

export type QuerySelectionSource = 'USER' | 'CONTEXT'

export interface CompetencyExplorerSelection {
  code: string
  source: QuerySelectionSource
}

/** Consulta activa del constructor. */
export interface CompetencyExplorerQueryState {
  domains: CompetencyExplorerSelection[]
  specialties: CompetencyExplorerSelection[]
  skills: CompetencyExplorerSelection[]
}

/** Criterios USER explícitos para el ranking (sin CONTEXT). */
export interface CompetencyRankingQuery {
  domainCodes: string[]
  specialtyCodes: string[]
  skillCodes: string[]
}

export type KnowledgeSearchHitType = 'domain' | 'specialty' | 'skill'

export interface KnowledgeSearchHit {
  type: KnowledgeSearchHitType
  code: string
  name: string
  /** Contexto semántico visible (dominio / especialidad). */
  contextLabel: string
}

export type ExplorerContentMode = 'initial' | 'ranking'

/** Persona del catálogo mock del Explorador (sin cargo ni organigrama). */
export interface CompetencyExplorerPerson {
  id: string
  fullName: string
  /** Opcional; si falta, la UI futura usará iniciales. */
  photoUrl?: string
  primaryDomainCode: string
  specialtyCodes: string[]
  skillCodes: string[]
  /** Fuerza de evidencia ilustrativa (0–100). */
  evidenceStrength: number
}

export type MatchMode = 'ANY' | 'ALL'

export type PersonSortMode = 'MATCH' | 'EVIDENCE_STRENGTH' | 'NAME'

/** Resultado de coincidencia persona ↔ criterios USER de la consulta. */
export interface PersonMatchResult {
  person: CompetencyExplorerPerson
  selectedCriterionCount: number
  matchedCriterionCount: number
  matchedDomainCodes: string[]
  missingDomainCodes: string[]
  matchedSpecialtyCodes: string[]
  missingSpecialtyCodes: string[]
  matchedSkillCodes: string[]
  missingSkillCodes: string[]
  matchPercentage: number
  evidenceStrength: number
}

export type RestrictiveCriterionType = 'DOMAIN' | 'SPECIALTY' | 'SKILL'

export interface RestrictiveCriterion {
  type: RestrictiveCriterionType
  code: string
  matchCount: number
}
