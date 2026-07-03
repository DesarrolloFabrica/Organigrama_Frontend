/**
 * Tipos alineados con el backend (`Organigrama_Backend/src/org-chart/types/org-node.type.ts`
 * y las respuestas de los controladores). Sirven como contrato único en el cliente.
 */

/** Elemento de GET /api/org-chart/summary/general-areas */
export interface GeneralAreaSummary {
  id: string
  name: string
  roleName?: string | null
  totalPeople: number
  vacancies: number
}

export type OrgNodeRole = {
  id: string
  name: string
  description: string | null
}

export type OrgNodeHierarchy = {
  id: string
  name: string
  description: string | null
}

export type OrgNodeArea = {
  id: string
  name: string
  description: string | null
}

export type OrgNodeSchool = {
  id: string
  name: string
  description: string | null
}

export type OrgNodeProgram = {
  id: string
  name: string
  description: string | null
  school_id: string | null
}

export type OrgNodeCity = {
  id: string
  name: string
}

export type OrgNodeCampus = {
  id: number
  name: string
}

export type OrgNodeContractType = {
  id: string
  name: string
  description: string | null
}

export type OrgNodeRegion = {
  id: number
  name: string
}

export type OrgNodeLocation = {
  region: OrgNodeRegion | null
  city: OrgNodeCity | null
  campus: OrgNodeCampus | null
}

export type OrgNodeKind = "person" | "vacancy"

/** Estado de asignación de una posición (proviene de un override por relación). */
export type OrgAssignmentStatus = "TEMPORAL" | "PERMANENT"

/**
 * Nodo del árbol devuelto por GET /api/org-chart.
 * `children` contiene los reportes directos; vacío en hojas.
 */
export type OrgNode = {
  id: string
  document: string
  name: string
  /**
   * `person`: colaborador real; `vacancy`: placeholder en core.person.
   * La vacante hereda el NIVEL del puesto (2–5); no es un NIVEL 6.
   */
  nodeKind?: OrgNodeKind
  role_id: string | null
  role: OrgNodeRole | null
  /**
   * Identidad visual de la posición: `org_visual_relation.id` (arista padre→persona).
   * `null`/ausente para el nodo raíz y para nodos resueltos por fallback de rol.
   * Permite diferenciar posiciones distintas de la misma persona (multi-padre).
   */
  relation_id?: string | null
  /** Persona padre de ESTA posición (de la relación). `null` si no hay arista. */
  parent_person_id?: string | null
  /**
   * Estado de asignación visible para ESTA posición (override por relación).
   * `null`/ausente cuando la posición no tiene override.
   */
  assignment_status?: OrgAssignmentStatus | null
  /** Etiqueta visible de la asignación (override por relación). */
  assignment_label?: string | null
  hierarchy_id: string | null
  area_id: string | null
  school_id: string | null
  program_id: string | null
  email: string | null
  edu_email: string | null
  phone: string | null
  /**
   * Número de reportes directos en BD (puede ser > 0 aunque `children` esté vacío
   * por corte de profundidad o datos parciales).
   */
  direct_reports_count?: number
  children: OrgNode[]
  hierarchy: OrgNodeHierarchy | null
  area: OrgNodeArea | null
  school: OrgNodeSchool | null
  program: OrgNodeProgram | null
  city: OrgNodeCity | null
  campus: OrgNodeCampus | null
  contract_type: OrgNodeContractType | null
  region_id: number | null
  location: OrgNodeLocation | null
  /** URL provisional de foto; null si no hay imagen disponible. */
  photoUrl?: string | null
  /**
   * Indica que existen reportes bajo este nodo pero fueron omitidos por un límite
   * de profundidad de vista (exploración en `/org-chart/team/:id`).
   */
  deferred_team?: boolean
}

/** Un eslabón de la ruta jerárquica (search / detalle de persona). */
export type OrgHierarchyPathSegment = {
  id: string
  name: string
  role_id: string | null
  role: OrgNodeRole | null
  hierarchy_id: string | null
  hierarchy: OrgNodeHierarchy | null
}

/** Elemento de GET /api/org-chart/search?q= */
export type OrgChartSearchHit = {
  id: string
  document: string
  name: string
  nodeKind?: OrgNodeKind
  role_id: string | null
  role: OrgNodeRole | null
  hierarchy_id: string | null
  hierarchy: OrgNodeHierarchy | null
  area_id: string | null
  school_id: string | null
  program_id: string | null
  email: string | null
  edu_email: string | null
  phone: string | null
  path: OrgHierarchyPathSegment[]
}

/** Bloque extendido cuando `canViewFullProfile === true`. */
export type OrgPersonFullProfile = {
  document: string
  type_document: string | null
  full_name: string
  role_id: string | null
  role: OrgNodeRole | null
  hierarchy_id: string | null
  hierarchy: OrgNodeHierarchy | null
  area_id: string | null
  area: OrgNodeArea | null
  school_id: string | null
  school: OrgNodeSchool | null
  program_id: string | null
  program: OrgNodeProgram | null
  contract_type_id: string | null
  contract_type: OrgNodeContractType | null
  email: string | null
  edu_email: string | null
  phone: string | null
  address: string | null
  emergency_contact?: {
    name: string | null
    phone: string | null
    relationship: string | null
  }
  gender: string | null
  marital_status: string | null
  born_date: string | null
  born_city: string | null
  location: OrgNodeLocation
  hierarchy_path: OrgHierarchyPathSegment[]
  direct_reports_count: number
  direct_reports: Array<{
    id: string
    full_name: string
    role_id: string | null
    hierarchy_id: string | null
  }>
}

/**
 * Respuesta de GET /api/org-chart/person/:id con visibilidad jerárquica.
 */
export type OrgPersonDetail = {
  id: string
  name: string
  institutionalEmail: string | null
  canViewFullProfile: boolean
  photoUrl?: string | null
  nodeKind?: OrgNodeKind
  profile: OrgPersonFullProfile | null
}

export function orgPersonDisplayName(detail: OrgPersonDetail): string {
  return detail.profile?.full_name?.trim() || detail.name?.trim() || '—'
}

export function orgPersonHasFullProfile(
  detail: OrgPersonDetail,
): detail is OrgPersonDetail & { profile: OrgPersonFullProfile } {
  return detail.canViewFullProfile === true && detail.profile != null
}

/** Texto de cargo para UI cuando `role` viene nulo. */
export function formatRoleLabel(node: OrgNode): string {
  return node.role?.name?.trim() ? node.role.name : 'Sin cargo asignado'
}

/** True si la posición es una asignación temporal (encargo). */
export function isTemporalAssignment(
  node: Pick<OrgNode, 'assignment_status'> | undefined,
): boolean {
  return node?.assignment_status === 'TEMPORAL'
}

/** Texto de la píldora de asignación temporal. */
export function temporalBadgeLabel(): string {
  return 'TEMPORAL'
}

/**
 * Indica si la persona tiene equipo directo a cargo, aunque `children` no venga poblado
 * (p. ej. `truncateTreeToMaxLevels` + `deferred_team`) o haya huecos en el árbol.
 */
export function orgNodeHasDirectReports(node: OrgNode): boolean {
  if (node.deferred_team === true) return true
  const n = node.direct_reports_count
  if (typeof n === 'number' && n > 0) return true
  return node.children.length > 0
}

export function isOrgNodeVacancy(
  node: Pick<OrgNode, 'nodeKind'> | Pick<OrgChartSearchHit, 'nodeKind'> | Pick<OrgPersonDetail, 'nodeKind'> | undefined,
): boolean {
  return node?.nodeKind === 'vacancy'
}

/** Rol docente en Core (p. ej. DOCENTE, DOCENTES, DOCENTE FACILITADOR). */
export function isOrgNodeDocenteRole(
  node: Pick<OrgNode, 'role'> | undefined,
): boolean {
  const name = node?.role?.name?.trim().toLowerCase()
  if (!name) return false
  return name.includes('docente')
}

/** Nombre de plaza placeholder en Core (p. ej. «VACANTE - COORDINADOR …»). */
export function isVacancyDisplayName(fullName: string | null | undefined): boolean {
  return (fullName ?? '').trim().toUpperCase().startsWith('VACANTE')
}

export function isOrgSummaryVacancy(item: OrgSummaryItem): boolean {
  if (item.nodeKind === 'vacancy') return true
  if (item.nodeKind === 'person') return false
  return isVacancyDisplayName(item.name)
}

/**
 * Recorre el subárbol y acumula ids de persona sin duplicar (multi-padre en UI).
 */
function collectUniquePeopleUnder(
  node: OrgNode,
  ids: Set<string>,
  maxDepth?: number,
  depthFromNode = 0,
): void {
  if (maxDepth !== undefined && depthFromNode >= maxDepth) return;
  for (const child of node.children) {
    ids.add(child.id);
    collectUniquePeopleUnder(child, ids, maxDepth, depthFromNode + 1);
  }
}

/**
 * Cuenta personas únicas bajo un nodo (no incluye al nodo mismo).
 */
export function countPeopleUnder(node: OrgNode): number {
  const ids = new Set<string>();
  collectUniquePeopleUnder(node, ids);
  return ids.size;
}

/**
 * Cuenta personas únicas bajo un nodo respetando un tope de profundidad.
 */
export function countPeopleUnderWithinDepth(
  node: OrgNode,
  maxDepth: number,
  depthFromNode = 0,
): number {
  const ids = new Set<string>();
  collectUniquePeopleUnder(node, ids, maxDepth, depthFromNode);
  return ids.size;
}

// ─── Resumen jerárquico por nodo ──────────────────────────────────────────────

export type OrgSummaryNodeKind = 'person' | 'vacancy'

export interface OrgSummaryItem {
  id: string
  name: string
  roleName?: string | null
  totalPeople: number
  vacancies: number
  nodeKind?: OrgSummaryNodeKind
}

export interface OrgSummaryResponse {
  general: OrgSummaryItem
  areas: OrgSummaryItem[]
  /** Vacantes según nivel: nivel 1 = subárbol; nivel 2+ = flujo directo. */
  vacancyItems?: OrgSummaryItem[]
}

// ─── Vacantes reales (schema `vacancies`) ─────────────────────────────────────

/**
 * Vacante proveniente de `GET /api/org-chart/vacancies`.
 * Fuente: schema externo `vacancies.vacancy` (solo lectura, sin nodos en el mapa).
 */
export interface OrgChartVacancy {
  id: number
  areaId: number | null
  schoolId: number | null
  programId: number | null
  positionName: string | null
  curricularLine: string | null
  quantity: number | null
  operationStatus: string | null
  createdAt: string | null
  updatedAt?: string | null
  areaName?: string | null
  schoolName?: string | null
  programName?: string | null
}

export interface OrgChartVacancyListResponse {
  items: OrgChartVacancy[]
}

// ─── Hoja de vida (CV) ────────────────────────────────────────────────────────

/**
 * Respuesta de GET /api/org-chart/person/:personId/cv.
 * Las URLs de Drive ya están almacenadas en el backend; el frontend NO consulta Drive.
 */
export type PersonCvResponse = {
  /** true si la persona tiene hoja de vida activa. */
  hasCv: boolean
  /** Nombre del archivo (solo si hasCv = true). */
  fileName?: string
  /** URL para abrir el PDF en Drive (solo si hasCv = true). */
  viewUrl?: string
  /** Última sincronización en ISO 8601 (solo si hasCv = true). */
  lastSync?: string
}
