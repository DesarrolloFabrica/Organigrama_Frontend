import { describe, expect, it } from 'vitest'
import { CompetencyApiError } from './competenciesApi'

describe('CompetencyApiError', () => {
  it('conserva status 403 para denegación', () => {
    const err = new CompetencyApiError(
      403,
      'denied',
      'COMPETENCY_ACCESS_DENIED',
    )
    expect(err.status).toBe(403)
    expect(err.code).toBe('COMPETENCY_ACCESS_DENIED')
    expect(err).toBeInstanceOf(Error)
  })
})
