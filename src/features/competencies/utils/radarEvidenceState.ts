export type RadarEvidenceState = 'NO_EVIDENCE' | 'WEAK_EVIDENCE' | 'OBSERVED'

/**
 * Presentations antiguas no traen evidenceState.
 * 0 → NO_EVIDENCE; >0 → OBSERVED (WEAK histórico era 0).
 */
export function inferRadarEvidenceState(
  relativeCoverage: number,
  evidenceState?: RadarEvidenceState,
): RadarEvidenceState {
  if (evidenceState) return evidenceState
  return relativeCoverage > 0 ? 'OBSERVED' : 'NO_EVIDENCE'
}

export function radarEvidenceStateLabel(state: RadarEvidenceState): string {
  if (state === 'NO_EVIDENCE') return 'Sin evidencia observada'
  if (state === 'WEAK_EVIDENCE') {
    return 'Evidencia parcial (no publicada como skill)'
  }
  return 'Evidencia observada'
}
