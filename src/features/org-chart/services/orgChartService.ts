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
  PersonVideoResponse,
} from '../types'
import type {
  CreateOrgChartSnapshotPayload,
  OrgChartRequestOptions,
  OrgChartVersion,
} from '../types/orgChartVersion'
import { buildVersionQuery } from '../utils/orgChartVersionQuery'
import { assertSafePersonVideoStreamPath } from '../utils/personVideoStreamUrl'

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

/**
 * Disponibilidad + ticket + streamUrl de video de presentación.
 * GET /api/org-chart/person/:personId/video (JWT de sesión).
 * El stream en sí usa solo el ticket embebido en streamUrl (sin Bearer).
 */
export async function getPersonVideo(
  personId: string,
): Promise<PersonVideoResponse> {
  const safeId = encodeURIComponent(personId)
  const data = await getJson<PersonVideoResponse>(
    `/api/org-chart/person/${safeId}/video`,
  )
  return parsePersonVideoResponse(data)
}

/** Parseo estricto del contrato de video (exportado para tests). */
export function parsePersonVideoResponse(data: unknown): PersonVideoResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta de video inválida')
  }
  const row = data as Record<string, unknown>
  if (row.hasVideo === false) {
    return { hasVideo: false }
  }
  if (row.hasVideo !== true) {
    throw new Error('Respuesta de video inválida')
  }
  if (
    typeof row.fileName !== 'string' ||
    typeof row.mimeType !== 'string' ||
    typeof row.streamTicket !== 'string' ||
    typeof row.streamTicketExpiresAt !== 'string' ||
    typeof row.streamUrl !== 'string'
  ) {
    throw new Error('Metadatos de video incompletos')
  }
  // Validación de seguridad del path (sin loguear ticket).
  assertSafePersonVideoStreamPath(row.streamUrl)
  return {
    hasVideo: true,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes:
      row.sizeBytes == null
        ? null
        : typeof row.sizeBytes === 'number' && Number.isFinite(row.sizeBytes)
          ? row.sizeBytes
          : null,
    lastSync: typeof row.lastSync === 'string' ? row.lastSync : null,
    streamTicket: row.streamTicket,
    streamTicketExpiresAt: row.streamTicketExpiresAt,
    streamUrl: row.streamUrl,
  }
}

/** Base URL del API (sin slash final). Exportada para resolver streamUrl del video. */
export function getOrgChartApiBaseUrl(): string {
  return BASE_URL
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
