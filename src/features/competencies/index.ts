export type {
  CompetencyAvailability,
  CompetencyDomainDetail,
  CompetencyDomainSummary,
  CompetencyEvidence,
  CompetencyExplorerSummary,
  CompetencyPresentationStatus,
  CompetencySkill,
  CompetencySpecialtyDetail,
  CompetencySpecialtySummary,
} from './types'

export {
  getPersonCompetencies,
  getPersonCompetencyDomain,
  getPersonCompetencySpecialty,
  getPersonProfessionalProfile,
  CompetencyApiError,
} from './api/competenciesApi'

export { CompetenciesExplorer } from './components/CompetenciesExplorer'
export { CompetencyRadar } from './components/CompetencyRadar'
export { DomainSelector } from './components/DomainSelector'

export {
  formatCoveragePercent,
  formatConfidencePercent,
  formatStrength,
  pickInitialSpecialtyCode,
  partitionSpecialties,
  translateReason,
  translateWarning,
} from './utils/competencyFormat'

export {
  resolveCompetencyLayout,
  formatStrengthScale,
  COMPETENCY_SPLIT_MIN_PX,
} from './utils/competencyLayout'

export {
  orderSpecialtiesForRadar,
  SOFTWARE_RADAR_AXIS_ORDER,
} from './utils/radarLabels'

export {
  coverageToPoint,
  buildCoveragePolygon,
  axisAngle,
  labelTextAnchor,
  placeTooltipInBounds,
} from './utils/radarGeometry'

export {
  pickTooltipSkillNames,
  resolveRadarAxisVisualState,
  radarPolygonDataKey,
} from './utils/radarInteraction'
