import { describe, expect, it } from 'vitest'
import {
  formatWorkforceEventDate,
  formatWorkforceEventRange,
  formatWorkforceEventStatus,
  getWorkforceEventBadge,
  workforceEventBadgeTone,
} from '../types'

describe('workforce event helpers', () => {
  it('formatea fechas sin Date()', () => {
    expect(formatWorkforceEventDate('2026-08-18')).toBe('18/08/2026')
    expect(formatWorkforceEventRange('2026-08-18', '2026-08-20')).toBe(
      '18/08/2026 – 20/08/2026',
    )
    expect(formatWorkforceEventRange('2026-08-18', '2026-08-18')).toBe(
      '18/08/2026',
    )
  })

  it('traduce estados conocidos', () => {
    expect(formatWorkforceEventStatus('PENDING')).toBe('Pendiente')
    expect(formatWorkforceEventStatus('CUSTOM')).toBe('CUSTOM')
  })

  it('clasifica tono por nombre de tipo (sin ids fijos)', () => {
    expect(workforceEventBadgeTone('INCAPACIDAD')).toBe('health')
    expect(workforceEventBadgeTone('PERMISO REMUNERADO')).toBe('leave')
    expect(workforceEventBadgeTone('SUSPENSION DISCIPLINARIA')).toBe('sanction')
    expect(workforceEventBadgeTone('TELETRABAJO / TRABAJO EN CASA')).toBe(
      'remote',
    )
    expect(workforceEventBadgeTone('OTRO')).toBe('other')
  })

  it('arma badge con +N si hay varias vigentes', () => {
    const badge = getWorkforceEventBadge({
      current_workforce_event: {
        id: '1',
        eventTypeName: 'LICENCIA',
        status: 'TAKEN',
        startDate: '2026-08-18',
        endDate: '2026-08-22',
      },
      current_workforce_event_count: 2,
    })
    expect(badge?.label).toBe('LICENCIA +1')
    expect(badge?.tone).toBe('leave')
    expect(badge?.title).toContain('Tomado')
  })

  it('sin evento → null', () => {
    expect(getWorkforceEventBadge({ current_workforce_event: null })).toBeNull()
  })
})
