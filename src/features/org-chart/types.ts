/**
 * Tipos alineados con el backend (`Organigrama_Backend/src/org-chart/types/org-node.type.ts`
 * y las respuestas de los controladores). Sirven como contrato único en el cliente.
 */

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

/**
 * Nodo del árbol devuelto por GET /api/org-chart.
 * `children` contiene los reportes directos; vacío en hojas.
 */
export type OrgNode = {
  id: string
  document: string
  name: string
  role_id: string | null
  role: OrgNodeRole | null
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

/**
 * Respuesta de GET /api/org-chart/person/:id.
 * Pensada para el panel lateral / ficha; aquí solo tipamos lo estable del contrato.
 */
export type OrgPersonDetail = {
  id: string
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

/** Texto de cargo para UI cuando `role` viene nulo. */
export function formatRoleLabel(node: OrgNode): string {
  return node.role?.name?.trim() ? node.role.name : 'Sin cargo asignado'
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

/**
 * Cuenta todas las personas bajo un nodo (no incluye al nodo mismo).
 * Útil para métricas en vistas futuras.
 */
export function countPeopleUnder(node: OrgNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countPeopleUnder(child),
    0,
  )
}

/**
 * Cuenta descendientes respetando un tope de profundidad relativo al nodo dado
 * (`node` = profundidad 0; no cuenta al propio nodo).
 */
export function countPeopleUnderWithinDepth(
  node: OrgNode,
  maxDepth: number,
  depthFromNode = 0,
): number {
  if (depthFromNode >= maxDepth) return 0
  return node.children.reduce((total, child) => {
    const below = countPeopleUnderWithinDepth(child, maxDepth, depthFromNode + 1)
    return total + 1 + below
  }, 0)
}
