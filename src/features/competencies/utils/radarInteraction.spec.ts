import { describe, expect, it } from 'vitest'
import type { CompetencySkill } from '../types'
import {
  pickTooltipSkillNames,
  radarPolygonDataKey,
  resolveRadarAxisVisualState,
  shouldShowRadarTooltip,
} from './radarInteraction'

function skill(
  name: string,
  role: 'PRIMARY' | 'SECONDARY',
): CompetencySkill {
  return {
    id: name,
    code: name,
    name,
    type: 'TECH',
    mapping: { role, weight: 1 },
    evidence: {
      level: 'STRONG',
      strength: 80,
      confidence: 0.9,
      items: [],
    },
  }
}

describe('radarInteraction', () => {
  it('default y selected son estados independientes', () => {
    const state = resolveRadarAxisVisualState({
      code: 'SOFTWARE_FRONTEND',
      selectedCode: 'SOFTWARE_BACKEND',
      hoveredCode: null,
      isDefault: true,
    })
    expect(state.isDefault).toBe(true)
    expect(state.isSelected).toBe(false)
    expect(state.isHovered).toBe(false)

    const selectedBackend = resolveRadarAxisVisualState({
      code: 'SOFTWARE_BACKEND',
      selectedCode: 'SOFTWARE_BACKEND',
      hoveredCode: 'SOFTWARE_DATA',
      isDefault: false,
    })
    expect(selectedBackend.isSelected).toBe(true)
    expect(selectedBackend.isDefault).toBe(false)
    expect(selectedBackend.isHovered).toBe(false)
  })

  it('cambio de selección no invalida la clave del polígono', () => {
    const coverages = [1, 1, 0.75, 0.5, 0.67, 0.5, 0.38]
    const before = radarPolygonDataKey('1', 'SOFTWARE', coverages)
    const afterSelect = radarPolygonDataKey('1', 'SOFTWARE', coverages)
    expect(before).toBe(afterSelect)
    expect(radarPolygonDataKey('2', 'SOFTWARE', coverages)).not.toBe(before)
  })

  it('tooltip prioriza skills primarias y máximo cinco', () => {
    const skills = [
      skill('NestJS', 'SECONDARY'),
      skill('React', 'PRIMARY'),
      skill('CSS', 'SECONDARY'),
      skill('TypeScript', 'PRIMARY'),
      skill('HTML', 'PRIMARY'),
      skill('JavaScript', 'PRIMARY'),
      skill('Node.js', 'PRIMARY'),
      skill('Vite', 'SECONDARY'),
    ]
    const names = pickTooltipSkillNames(skills, 5)
    expect(names).toHaveLength(5)
    expect(names.slice(0, 5)).toEqual([
      'React',
      'TypeScript',
      'HTML',
      'JavaScript',
      'Node.js',
    ])
    expect(names).not.toContain('NestJS')
  })

  it('interacción táctil no muestra tooltip flotante', () => {
    expect(
      shouldShowRadarTooltip({
        hoveredCode: 'SOFTWARE_BACKEND',
        pointerType: 'touch',
        coarsePointer: false,
      }),
    ).toBe(false)
    expect(
      shouldShowRadarTooltip({
        hoveredCode: 'SOFTWARE_BACKEND',
        pointerType: 'mouse',
        coarsePointer: true,
      }),
    ).toBe(false)
    expect(
      shouldShowRadarTooltip({
        hoveredCode: 'SOFTWARE_BACKEND',
        pointerType: 'mouse',
        coarsePointer: false,
      }),
    ).toBe(true)
  })
})
