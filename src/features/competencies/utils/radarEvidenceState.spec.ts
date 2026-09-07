import { describe, expect, it } from 'vitest'
import {
  inferRadarEvidenceState,
  radarEvidenceStateLabel,
} from './radarEvidenceState'

describe('radarEvidenceState', () => {
  it('NONE → 0 infers NO_EVIDENCE when metadata is absent', () => {
    expect(inferRadarEvidenceState(0)).toBe('NO_EVIDENCE')
    expect(radarEvidenceStateLabel('NO_EVIDENCE')).toMatch(/sin evidencia/i)
  })

  it('WEAK_EVIDENCE metadata wins over the numeric 20', () => {
    expect(inferRadarEvidenceState(20, 'WEAK_EVIDENCE')).toBe('WEAK_EVIDENCE')
    expect(inferRadarEvidenceState(18.3, 'OBSERVED')).toBe('OBSERVED')
  })

  it('old presentation without evidenceState: >0 → OBSERVED', () => {
    expect(inferRadarEvidenceState(18.3)).toBe('OBSERVED')
    expect(inferRadarEvidenceState(20)).toBe('OBSERVED')
  })
})
