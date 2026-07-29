/**
 * Tipos del Explorador de Competencias (alineados a DTOs MC1.3.4).
 */

export type CompetencyAvailability =
  | 'AVAILABLE'
  | 'NOT_EVALUATED'
  | 'FAILED'
  | 'STALE'

export type CompetencyPresentationStatus = 'ACTIVE' | 'EMERGENT' | 'HIDDEN'

export type CompetencyMappingRole = 'PRIMARY' | 'SECONDARY'

export interface CompetencyPerson {
  id: string
  fullName: string
  role: string | null
}

export interface CompetencyEvaluationAudit {
  catalogVersion: string
  catalogVersionId: string
  mappingHash: string
  configHash: string
  extractionId: string
  evidenceEvaluationId: string
  enrichmentId: string
  domainCode: string
}

export interface CompetencyEvaluationMeta {
  id: string
  status: 'SUCCEEDED' | 'FAILED'
  availabilityStatus: CompetencyAvailability
  evaluatedAt: string | null
  rulesVersion: string
  audit?: CompetencyEvaluationAudit
}

export interface CompetencySpecialtyMetrics {
  mappedSkillCount: number
  evidencedSkillCount: number
  coverage: number
  confidence: number
  strength: number
}

export interface CompetencySpecialtySummary {
  code: string
  name: string
  presentationStatus: CompetencyPresentationStatus
  isDefault: boolean
  rank: number
  metrics: CompetencySpecialtyMetrics
  warnings: string[]
}

export interface CompetencyDomainSummary {
  code: string
  name: string
  defaultSpecialtyCode: string | null
  activeSpecialtyCount: number
  emergentSpecialtyCount: number
  specialties: CompetencySpecialtySummary[]
}

export interface CompetencyExplorerSummary {
  availabilityStatus: CompetencyAvailability
  person: CompetencyPerson
  evaluation: CompetencyEvaluationMeta | null
  domains: CompetencyDomainSummary[]
  warnings: string[]
}

export type CompetencyDomainQualification =
  | 'PRIMARY_MATCH'
  | 'SECONDARY_SIGNAL'
  | 'OUTSIDE'
  | 'INSUFFICIENT_EVIDENCE'

export interface CompetencyProfessionalDomain {
  code: string
  name: string
  qualification: CompetencyDomainQualification
  evaluationId: string
  isPublishedPrimary: boolean
  evaluatedAt: string | null
  rulesVersion: string
  defaultSpecialtyCode: string | null
  activeSpecialtyCount: number
  emergentSpecialtyCount: number
  summary: string
  specialties: CompetencySpecialtySummary[]
  warnings: string[]
}

export interface CompetencyMvpCapability {
  code: string | null
  label: string
  evidenceLevel: 'STRONG' | 'MODERATE' | 'WEAK' | 'EMERGING'
  sourceCount: number
  domainCode: string | null
  classification: string
}

export interface CompetencyMvpTool {
  label: string
  type: 'TOOL' | 'METHODOLOGY'
  evidenceLevel: string
  hasProfessionalContext: boolean
}

export interface CompetencyProfessionalProfile {
  availabilityStatus: CompetencyAvailability
  person: CompetencyPerson
  extractionId: string | null
  defaultDomainCode: string | null
  crossDomainClassification: {
    classification: string
    version: string
  } | null
  evaluatedDomains: CompetencyProfessionalDomain[]
  mvpCapabilities: {
    classificationPending: boolean
    consolidatedCapabilities: CompetencyMvpCapability[]
    complementaryCapabilities: CompetencyMvpCapability[]
    emergingCapabilities: CompetencyMvpCapability[]
    tools: CompetencyMvpTool[]
    methodologies: CompetencyMvpTool[]
    qualityAlerts: string[]
  } | null
  warnings: string[]
}

export interface CompetencyEvidence {
  sourceType: string
  text: string
}

export interface CompetencySkill {
  id: string
  code: string
  name: string
  type: string
  mapping: {
    role: CompetencyMappingRole
    weight: number
  }
  evidence: {
    level: string
    strength: number
    confidence: number
    items: CompetencyEvidence[]
  }
}

export interface CompetencySpecialtyDetail {
  code: string
  name: string
  presentationStatus: CompetencyPresentationStatus
  lifecycleStatus: string
  isDefault: boolean
  rank: number
  metrics: CompetencySpecialtyMetrics
  reasons: string[]
  warnings: string[]
  skills: CompetencySkill[]
  evaluation: CompetencyEvaluationMeta
}

export interface CompetencyDomainDetail {
  availabilityStatus: CompetencyAvailability
  person: CompetencyPerson
  evaluation: CompetencyEvaluationMeta | null
  domain: {
    code: string
    name: string
    defaultSpecialtyCode: string | null
    activeSpecialtyCount: number
    emergentSpecialtyCount: number
  }
  specialties: CompetencySpecialtySummary[]
  warnings: string[]
}

export type CompetencyRequestOptions = {
  includeHidden?: boolean
  includeAudit?: boolean
}
