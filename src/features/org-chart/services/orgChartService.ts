import { getAccessToken } from '../../../auth/authStorage'
import type {
  GeneralAreaSummary,
  OrgChartSearchHit,
  OrgChartVacancy,
  OrgChartVacancyListResponse,
  OrgNode,
  OrgPersonDetail,
  OrgSummaryResponse,
  PersonCvResponse,
} from '../types'
import type {
  CreateOrgChartSnapshotPayload,
  OrgChartRequestOptions,
  OrgChartVersion,
} from '../types/orgChartVersion'
import { buildVersionQuery } from '../utils/orgChartVersionQuery'

/**
 * Origen del API. En desarrollo suele ser el Nest en :3000.
 * En despliegue, definir `VITE_API_BASE_URL` (sin slash final).
 */
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

function withVersionQuery(path: string, options?: OrgChartRequestOptions): string {
  return buildVersionQuery(path, options)
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function fetchOrgChartVersions(): Promise<OrgChartVersion[]> {
  return getJson<OrgChartVersion[]>('/api/org-chart/versions')
}

export async function createOrgChartSnapshot(
  payload: CreateOrgChartSnapshotPayload,
): Promise<OrgChartVersion> {
  return getJson<OrgChartVersion>('/api/org-chart/versions/snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/**
 * @deprecated Carga el árbol completo del organigrama (raíz + `children` recursivos)
 * y no debe usarse en la UI principal.
 * Reemplazo: {@link fetchOrgChartRoot} para la carga inicial y
 * {@link fetchOrgChartChildren} para expansión lazy por niveles.
 */
export async function fetchOrgChart(
  options?: OrgChartRequestOptions,
): Promise<OrgNode> {
  return getJson<OrgNode>(withVersionQuery('/api/org-chart', options))
}

/** Raíz del organigrama con solo hijos directos (`GET /api/org-chart/root`). */
export async function fetchOrgChartRoot(
  options?: OrgChartRequestOptions,
): Promise<OrgNode> {
  return getJson<OrgNode>(withVersionQuery('/api/org-chart/root', options))
}

/**
 * @deprecated Carga el subárbol completo con la persona como raíz
 * (`GET /api/org-chart/team/:id`, recursión sin límite).
 * Reemplazo: {@link fetchOrgChartNode} para el nodo raíz del lienzo y
 * {@link fetchOrgChartChildren} para expansión lazy por niveles.
 */
export async function fetchOrgChartSubtree(
  rootPersonId: string,
  options?: OrgChartRequestOptions,
): Promise<OrgNode> {
  const safeId = encodeURIComponent(rootPersonId)
  return getJson<OrgNode>(
    withVersionQuery(`/api/org-chart/team/${safeId}`, options),
  )
}

/** Persona como raíz del mapa + hijos directos (`GET /api/org-chart/node/:id`). */
export async function fetchOrgChartNode(
  personId: string,
  options?: OrgChartRequestOptions,
): Promise<OrgNode> {
  const safeId = encodeURIComponent(personId)
  return getJson<OrgNode>(
    withVersionQuery(`/api/org-chart/node/${safeId}`, options),
  )
}

/** Búsqueda de personas con ruta jerárquica. */
export async function fetchOrgChartSearch(
  q: string,
  options?: OrgChartRequestOptions,
): Promise<OrgChartSearchHit[]> {
  const query = new URLSearchParams({ q: q.trim() })
  return getJson<OrgChartSearchHit[]>(
    withVersionQuery(`/api/org-chart/search?${query.toString()}`, options),
  )
}

/** Detalle ampliado de una persona. */
export async function fetchOrgPersonDetail(
  id: string,
  options?: OrgChartRequestOptions,
): Promise<OrgPersonDetail> {
  const safeId = encodeURIComponent(id)
  return getJson<OrgPersonDetail>(
    withVersionQuery(`/api/org-chart/person/${safeId}`, options),
  )
}

/**
 * Estado de la hoja de vida (CV) de una persona.
 * Llama a GET /api/org-chart/person/:personId/cv reutilizando getJson, que
 * adjunta automáticamente el JWT. NO consulta Google Drive desde el frontend.
 */
export async function getPersonCv(personId: number): Promise<PersonCvResponse> {
  const safeId = encodeURIComponent(String(personId))
  return getJson<PersonCvResponse>(`/api/org-chart/person/${safeId}/cv`)
}

/** Comprueba que el backend responde; útil para indicadores en cabecera. */
export async function fetchHealth(): Promise<{ ok: boolean }> {
  return getJson<{ ok: boolean }>('/api/health')
}

export async function fetchOrgChartChildren(
  personId: string,
  options?: OrgChartRequestOptions,
): Promise<OrgNode[]> {
  const safeId = encodeURIComponent(personId)
  return getJson<OrgNode[]>(
    withVersionQuery(`/api/org-chart/children/${safeId}`, options),
  )
}

/** Resumen por áreas generales del organigrama principal. */
export async function fetchGeneralAreasSummary(
  options?: OrgChartRequestOptions,
): Promise<GeneralAreaSummary[]> {
  return getJson<GeneralAreaSummary[]>(
    withVersionQuery('/api/org-chart/summary/general-areas', options),
  )
}

/**
 * Vacantes reales del schema `vacancies` (solo `operation_status = requisition_sent`).
 * Consulta complementaria: no forma parte del árbol ni de las relaciones visuales.
 */
export async function fetchOrgChartVacancies(): Promise<OrgChartVacancy[]> {
  const res = await getJson<OrgChartVacancyListResponse>(
    '/api/org-chart/vacancies',
  )
  return res.items ?? []
}

/** Resumen jerárquico de un nodo: general + desglose por hijos directos. */
export async function fetchOrgSummary(
  personId: string,
  options?: OrgChartRequestOptions,
): Promise<OrgSummaryResponse> {
  const safeId = encodeURIComponent(personId)
  return getJson<OrgSummaryResponse>(
    withVersionQuery(`/api/org-chart/summary/${safeId}`, options),
  )
}
