import { getAccessToken } from '../../../auth/authStorage'
import type {
  CompetencyDomainDetail,
  CompetencyExplorerSummary,
  CompetencyProfessionalProfile,
  CompetencyRequestOptions,
  CompetencySpecialtyDetail,
} from '../types'

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export class CompetencyApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'CompetencyApiError'
    this.status = status
    this.code = code
  }
}

function buildQuery(options?: CompetencyRequestOptions): string {
  const params = new URLSearchParams()
  if (options?.includeHidden) params.set('includeHidden', 'true')
  if (options?.includeAudit) params.set('includeAudit', 'true')
  const q = params.toString()
  return q ? `?${q}` : ''
}

async function getJson<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    let code: string | undefined
    let detail = ''
    try {
      const body = (await res.json()) as Record<string, unknown>
      if (typeof body.code === 'string') code = body.code
      if (body.message && typeof body.message === 'object') {
        const nested = body.message as { code?: string; message?: string }
        if (nested.code) code = nested.code
        detail = nested.message ?? ''
      } else if (typeof body.message === 'string') {
        detail = body.message
      }
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new CompetencyApiError(
      res.status,
      detail || `HTTP ${res.status}`,
      code,
    )
  }

  return res.json() as Promise<T>
}

export async function getPersonCompetencies(
  personId: string,
  options?: CompetencyRequestOptions,
): Promise<CompetencyExplorerSummary> {
  const id = encodeURIComponent(personId)
  return getJson(
    `/api/org-chart/person/${id}/competencies${buildQuery(options)}`,
  )
}

export async function getPersonProfessionalProfile(
  personId: string,
  options?: CompetencyRequestOptions,
): Promise<CompetencyProfessionalProfile> {
  const id = encodeURIComponent(personId)
  return getJson(
    `/api/org-chart/person/${id}/competencies/professional-profile${buildQuery(options)}`,
  )
}

export async function getPersonCompetencyDomain(
  personId: string,
  domainCode: string,
  options?: CompetencyRequestOptions,
): Promise<CompetencyDomainDetail> {
  const id = encodeURIComponent(personId)
  const domain = encodeURIComponent(domainCode)
  return getJson(
    `/api/org-chart/person/${id}/competencies/domains/${domain}${buildQuery(options)}`,
  )
}

export async function getPersonCompetencySpecialty(
  personId: string,
  domainCode: string,
  specialtyCode: string,
  options?: CompetencyRequestOptions,
): Promise<CompetencySpecialtyDetail> {
  const id = encodeURIComponent(personId)
  const domain = encodeURIComponent(domainCode)
  const specialty = encodeURIComponent(specialtyCode)
  return getJson(
    `/api/org-chart/person/${id}/competencies/domains/${domain}/specialties/${specialty}${buildQuery(options)}`,
  )
}
