import type { PreviewCaseSummary, PreviewPresentation } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Preview API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchPreviewCases(): Promise<PreviewCaseSummary[]> {
  const data = await getJson<{ cases: PreviewCaseSummary[] }>(
    '/api/dev/mc1-profile-preview/cases',
  )
  return data.cases
}

export async function fetchPreviewPresentation(args: {
  caseId: string
  debug?: boolean
}): Promise<PreviewPresentation> {
  const q = new URLSearchParams({ caseId: args.caseId })
  if (args.debug) q.set('debug', '1')
  return getJson<PreviewPresentation>(
    `/api/dev/mc1-profile-preview?${q.toString()}`,
  )
}
