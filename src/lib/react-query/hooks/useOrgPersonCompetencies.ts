import { useQuery } from '@tanstack/react-query'
import {
  getPersonCompetencies,
  getPersonCompetencyDomain,
  getPersonCompetencySpecialty,
  getPersonProfessionalProfile,
} from '../../../features/competencies/api/competenciesApi'
import { shouldIncludeCompetencyAudit } from '../../../features/competencies/utils/competencyFormat'
import { orgQueryKeys } from '../queryKeys'

export function useOrgPersonCompetencies(
  personId: string | null,
  enabled = true,
) {
  const includeAudit = shouldIncludeCompetencyAudit()
  return useQuery({
    queryKey: orgQueryKeys.personCompetencies(personId ?? '', includeAudit),
    queryFn: () =>
      getPersonCompetencies(personId!, { includeAudit }),
    enabled: Boolean(personId) && enabled,
  })
}

export function useOrgPersonProfessionalProfile(
  personId: string | null,
  enabled = true,
) {
  const includeAudit = shouldIncludeCompetencyAudit()
  return useQuery({
    queryKey: orgQueryKeys.personProfessionalProfile(
      personId ?? '',
      includeAudit,
    ),
    queryFn: () =>
      getPersonProfessionalProfile(personId!, { includeAudit }),
    enabled: Boolean(personId) && enabled,
  })
}

export function useOrgPersonCompetencyDomain(
  personId: string | null,
  domainCode: string | null,
  enabled = true,
) {
  const includeAudit = shouldIncludeCompetencyAudit()
  return useQuery({
    queryKey: orgQueryKeys.personCompetencyDomain(
      personId ?? '',
      domainCode ?? '',
      includeAudit,
    ),
    queryFn: () =>
      getPersonCompetencyDomain(personId!, domainCode!, { includeAudit }),
    enabled: Boolean(personId) && Boolean(domainCode) && enabled,
  })
}

export function useOrgPersonCompetencySpecialty(
  personId: string | null,
  domainCode: string | null,
  specialtyCode: string | null,
  enabled = true,
) {
  const includeAudit = shouldIncludeCompetencyAudit()
  return useQuery({
    queryKey: orgQueryKeys.personCompetencySpecialty(
      personId ?? '',
      domainCode ?? '',
      specialtyCode ?? '',
      includeAudit,
    ),
    queryFn: () =>
      getPersonCompetencySpecialty(personId!, domainCode!, specialtyCode!, {
        includeAudit,
      }),
    enabled:
      Boolean(personId) &&
      Boolean(domainCode) &&
      Boolean(specialtyCode) &&
      enabled,
  })
}
