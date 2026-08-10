export type PreviewAvailability =
  | 'PROFILE_AVAILABLE'
  | 'PARTIAL_PROFILE'
  | 'PIPELINE_NOT_READY'
  | 'PROCESSING_ERROR'

export type PreviewCaseSummary = {
  caseId: string
  kind: 'ARTIFACT_SNAPSHOT' | 'REAL_PERSON'
  label: string
  snapshotId: string | null
  availability: PreviewAvailability
  r1Status: string | null
  fieldCodes: string[]
  hasRadar: boolean
  cohortGroup?: 'A' | 'B' | 'C'
}

export type PreviewField = {
  fieldCode: string
  fieldLabel: string
  role: 'PRIMARY' | 'SECONDARY'
  r1Confidence?: number
  specialties: Array<{
    specialtyCode: string
    name: string
    confidence: number
  }>
  skillsBySpecialty: Array<{
    specialtyCode: string
    specialtyName: string
    skills: Array<{
      skillCode: string
      name: string
      confidence: number
      supportingEvidenceUnitIds: string[]
    }>
  }>
  toolsTechnologies: string[]
  evidenceVolume: 'LOW' | 'MEDIUM' | 'HIGH'
  evidenceUnitCount: number
  derivedPresentationLabel?: string | null
  radar: {
    axes: Array<{
      dimensionCode: string
      label: string
      relativeCoverage: number
      rawScore: number
      contributingSkillCodes: string[]
      supportingEvidenceUnitIds: string[]
    }>
  }
  skillDimensionMappings: Array<{
    skillCode: string
    dimensionCodes: string[]
    mappingJustification: string
    supportingEvidenceUnitIds: string[]
  }>
}

export type PreviewPresentation = {
  caseId: string
  kind: 'ARTIFACT_SNAPSHOT' | 'REAL_PERSON'
  label: string
  availability: PreviewAvailability
  snapshotId: string | null
  personId: number | null
  photoUrl: string | null
  r1FieldResolutionStatus: string | null
  mc1StatusLabel: string
  fields: PreviewField[]
  presentationNotes: {
    weakHiddenFromPrimary: true
    toolsSeparatedFromSkills: true
    radarSemantics: string
    formulaVersion: string
  } | null
  debug: {
    snapshotId: string
    packDir: string
    producedAt: string
    provenance: Record<string, unknown>
    warnings: Array<{ code: string; severity: string; messageSafe: string }>
    formulaVersion: string
    radarSemantics: string
  } | null
}
