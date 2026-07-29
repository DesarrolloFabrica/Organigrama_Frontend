import { describe, expect, it } from 'vitest'
import { orgQueryKeys } from '../../../lib/react-query/queryKeys'

describe('orgQueryKeys person competencies', () => {
  it('incluye personId en la clave (no clave global)', () => {
    const a = orgQueryKeys.personCompetencies('1163')
    const b = orgQueryKeys.personCompetencies('1164')
    expect(a).toEqual(['org-person-competencies', '1163', false])
    expect(b).toEqual(['org-person-competencies', '1164', false])
    expect(a).not.toEqual(b)
  })

  it('cambia la clave al cambiar personId o includeAudit', () => {
    const base = orgQueryKeys.personCompetencies('1163', false)
    const audited = orgQueryKeys.personCompetencies('1163', true)
    const other = orgQueryKeys.personCompetencies('1176', false)
    expect(base).not.toEqual(audited)
    expect(base).not.toEqual(other)
  })
})
