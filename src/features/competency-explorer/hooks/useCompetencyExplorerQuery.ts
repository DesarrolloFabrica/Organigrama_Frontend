import { useCallback, useMemo, useState } from 'react'
import {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
} from '../mocks/competencyExplorer.mock'
import type {
  CompetencyExplorerQueryState,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  KnowledgeSearchHit,
} from '../types/competencyExplorer.types'
import {
  EMPTY_QUERY,
  applySearchHit,
  clearQuery,
  removeDomainCriterion,
  removeSkillCriterion,
  removeSpecialtyCriterion,
  resolveExplorerContentMode,
  selectDomainAsUser,
  specialtiesForQuery,
  skillsForQuery,
  toggleDomain,
  toggleSkill,
  toggleSpecialty,
} from '../utils/queryState'

export function useCompetencyExplorerQuery() {
  const [query, setQuery] = useState<CompetencyExplorerQueryState>(EMPTY_QUERY)

  const specialtyByCode = useMemo(() => {
    const map = new Map<string, CompetencyExplorerSpecialty>()
    for (const s of MOCK_EXPLORER_SPECIALTIES) map.set(s.code, s)
    return map
  }, [])

  const skillByCode = useMemo(() => {
    const map = new Map<string, CompetencyExplorerSkill>()
    for (const s of MOCK_EXPLORER_SKILLS) map.set(s.code, s)
    return map
  }, [])

  const availableSpecialties = useMemo(
    () => specialtiesForQuery(MOCK_EXPLORER_SPECIALTIES, query),
    [query],
  )

  const availableSkills = useMemo(
    () => skillsForQuery(MOCK_EXPLORER_SKILLS, query),
    [query],
  )

  const contentMode = useMemo(
    () => resolveExplorerContentMode(query),
    [query],
  )

  const selectedDomains = useMemo(
    () =>
      MOCK_EXPLORER_DOMAINS.filter((d) =>
        query.domains.some((s) => s.code === d.code),
      ),
    [query.domains],
  )

  const selectedSpecialties = useMemo(
    () =>
      MOCK_EXPLORER_SPECIALTIES.filter((s) =>
        query.specialties.some((sel) => sel.code === s.code),
      ),
    [query.specialties],
  )

  const selectedSkills = useMemo(
    () =>
      MOCK_EXPLORER_SKILLS.filter((s) =>
        query.skills.some((sel) => sel.code === s.code),
      ),
    [query.skills],
  )

  const onToggleDomain = useCallback((code: string) => {
    setQuery((prev) => toggleDomain(prev, code))
  }, [])

  const onSelectDomain = useCallback((code: string) => {
    setQuery((prev) => selectDomainAsUser(prev, code))
  }, [])

  const onToggleSpecialty = useCallback(
    (code: string) => {
      const specialty = specialtyByCode.get(code)
      if (!specialty) return
      setQuery((prev) => toggleSpecialty(prev, specialty))
    },
    [specialtyByCode],
  )

  const onToggleSkill = useCallback(
    (code: string) => {
      const skill = skillByCode.get(code)
      if (!skill) return
      setQuery((prev) => toggleSkill(prev, skill))
    },
    [skillByCode],
  )

  const onRemoveDomain = useCallback((code: string) => {
    setQuery((prev) => removeDomainCriterion(prev, code))
  }, [])

  const onRemoveSpecialty = useCallback((code: string) => {
    setQuery((prev) => removeSpecialtyCriterion(prev, code))
  }, [])

  const onRemoveSkill = useCallback((code: string) => {
    setQuery((prev) => removeSkillCriterion(prev, code))
  }, [])

  const onClear = useCallback(() => {
    setQuery(clearQuery())
  }, [])

  const onSelectSearchHit = useCallback(
    (hit: KnowledgeSearchHit) => {
      setQuery((prev) =>
        applySearchHit(prev, hit, specialtyByCode, skillByCode),
      )
    },
    [specialtyByCode, skillByCode],
  )

  return {
    query,
    contentMode,
    domains: MOCK_EXPLORER_DOMAINS,
    availableSpecialties,
    availableSkills,
    selectedDomains,
    selectedSpecialties,
    selectedSkills,
    specialtyByCode,
    onToggleDomain,
    onSelectDomain,
    onToggleSpecialty,
    onToggleSkill,
    onRemoveDomain,
    onRemoveSpecialty,
    onRemoveSkill,
    onClear,
    onSelectSearchHit,
  }
}
