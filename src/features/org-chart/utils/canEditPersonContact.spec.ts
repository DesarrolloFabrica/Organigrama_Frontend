import { afterEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({
  user: null as { personId: string } | null,
  admin: false,
}))

vi.mock('../../../auth/authStorage', () => ({
  getAuthUser: () => session.user,
  isOrgAdmin: () => session.admin,
}))

import { canEditPersonContact } from './canEditPersonContact'

/** Datos sintéticos. */
describe('canEditPersonContact', () => {
  afterEach(() => {
    session.user = null
    session.admin = false
  })

  it('la propia persona puede editar', () => {
    session.user = { personId: '10' }
    expect(canEditPersonContact('10')).toBe(true)
  })

  it('ORG_ADMIN puede editar a otra persona', () => {
    session.user = { personId: '10' }
    session.admin = true
    expect(canEditPersonContact('20')).toBe(true)
  })

  it('otra persona sin ORG_ADMIN no puede editar', () => {
    session.user = { personId: '10' }
    expect(canEditPersonContact('20')).toBe(false)
  })

  it('sin persona o sin sesión no edita', () => {
    expect(canEditPersonContact('')).toBe(false)
    expect(canEditPersonContact(null)).toBe(false)
    expect(canEditPersonContact('10')).toBe(false)
  })
})
