import type { OrgSummaryResponse } from '../types'
import { fetchOrgSummary } from './orgChartService'

const summaryCache = new Map<string, OrgSummaryResponse>()

export function getOrgSummaryFromCache(
  personId: string,
): OrgSummaryResponse | undefined {
  return summaryCache.get(personId)
}

/** Devuelve resumen cacheado o lo pide una sola vez por `personId` en la sesión. */
export async function fetchOrgSummaryCached(
  personId: string,
): Promise<OrgSummaryResponse> {
  const cached = summaryCache.get(personId)
  if (cached) {
    return cached
  }

  const data = await fetchOrgSummary(personId)
  summaryCache.set(personId, data)
  return data
}
