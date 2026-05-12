import type {
  OrgChartSearchHit,
  OrgNode,
  OrgPersonDetail,
} from '../types'

/**
 * Origen del API. En desarrollo suele ser el Nest en :3000.
 * En despliegue, definir `VITE_API_BASE_URL` (sin slash final).
 */
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `HTTP ${res.status} en ${path}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    )
  }
  return res.json() as Promise<T>
}

/** Árbol completo del organigrama (raíz + `children` recursivos). */
export async function fetchOrgChart(): Promise<OrgNode> {
  return getJson<OrgNode>('/api/org-chart')
}

/** Subárbol con la persona como raíz (`GET /api/org-chart/team/:id`). */
export async function fetchOrgChartSubtree(rootPersonId: string): Promise<OrgNode> {
  const safeId = encodeURIComponent(rootPersonId)
  return getJson<OrgNode>(`/api/org-chart/team/${safeId}`)
}

/**
 * Búsqueda de personas con ruta jerárquica.
 * (Reservado para siguientes iteraciones de la UI.)
 */
export async function fetchOrgChartSearch(q: string): Promise<OrgChartSearchHit[]> {
  const query = new URLSearchParams({ q: q.trim() })
  return getJson<OrgChartSearchHit[]>(`/api/org-chart/search?${query.toString()}`)
}

/**
 * Detalle ampliado de una persona.
 * (Reservado para panel lateral / ficha.)
 */
export async function fetchOrgPersonDetail(id: string): Promise<OrgPersonDetail> {
  const safeId = encodeURIComponent(id)
  return getJson<OrgPersonDetail>(`/api/org-chart/person/${safeId}`)
}

/** Comprueba que el backend responde; útil para indicadores en cabecera. */
export async function fetchHealth(): Promise<{ ok: boolean }> {
  return getJson<{ ok: boolean }>('/api/health')
}
