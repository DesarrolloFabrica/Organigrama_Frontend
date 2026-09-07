import type { Edge, Node } from '@xyflow/react'
import type { OrgNode } from '../types'
import type { OrgMapRenderMode } from './orgMapDisplayPolicy'
import type { CoordinationCardThemeIdentity } from './coordinationCardTheme'

export type OrgMapNodeData = {
  orgNode: OrgNode
  /** Profundidad en el grafo del mapa: 0 = raíz del lienzo, 1 = fila de reportes directos. */
  mapLayoutDepth: number
}

/**
 * Datos que `OrgMapView` añade tras `buildOrgMap` para acciones dentro del nodo custom.
 */
export type OrgMapNodeInteractiveData = OrgMapNodeData & {
  directReportsTotal: number
  isExpanded: boolean
  /** True si hay reportes directos en el árbol real (hay qué explorar). */
  hasChildren: boolean
  /** Hay equipo oculto por límite de profundidad de vista (CTA “Explorar estructura”). */
  hasDeferredTeam: boolean
  /** Mostrar expandir/colapsar en mapa (no aplica en frontera con equipo diferido ni equipos >15). */
  showMapExpand: boolean
  /** Navegar a vista de lista (/org/team/:id) para equipos >15 reportes directos. */
  showTeamPageNavigate: boolean
  /** Raíz del subárbol actual en el lienzo. */
  isCanvasRoot: boolean
  /** Paleta estable del jefe que actúa como raíz del lienzo actual. */
  canvasRootIdentity: CoordinationCardThemeIdentity | null
  /** Coordinación efectiva del nodo, incluida la heredada. */
  effectiveCoordinationIdentity: CoordinationCardThemeIdentity | null
  /** Paleta tenue del padre cuando este nodo es hermano del seleccionado. */
  passiveCoordinationIdentity: CoordinationCardThemeIdentity | null
  /** Miembros del equipo interno (raíz o fila 2 expandida; datos del árbol completo). */
  internalTeamMembers: OrgNode[]
  onToggleExpand: (nodeId: string) => void
  onOpenDetail: (nodeId: string, relationId?: string | null) => void
  /** Navegación a vista de sub-organigrama centrada en el nodo (con su posición). */
  onExploreTeam?: (nodeId: string, relationId?: string | null) => void
  /** Petición en curso de hijos directos bajo demanda. */
  loadingChildren?: boolean
  /** Tema cromático 1..5 (resuelto en la vista). */
  visualLevel: 1 | 2 | 3 | 4 | 5
  /** Contexto de visualización: caja/equipo vs árbol horizontal. */
  renderMode: OrgMapRenderMode
}

export type OrgMapGraph = {
  nodes: Node<OrgMapNodeData>[]
  edges: Edge[]
}

/** Identidad de nodo en el lienzo: distingue dos posiciones de la misma persona. */
export function orgMapNodeKey(
  node: Pick<OrgNode, "id" | "relation_id">,
): string {
  const relationId = node.relation_id
  if (relationId == null || relationId === "") return node.id
  return `${node.id}::${relationId}`
}

export type OrgMapNodeIdentity = {
  personId: string
  relationId: string | null
}

/**
 * Descompone la identidad exclusiva del lienzo sin confundirla con el id de
 * dominio que aceptan los endpoints de persona.
 */
export function parseOrgMapNodeKey(nodeKey: string): OrgMapNodeIdentity {
  const separatorIndex = nodeKey.indexOf("::")
  if (separatorIndex < 0) {
    return { personId: nodeKey, relationId: null }
  }

  const personId = nodeKey.slice(0, separatorIndex)
  const relationId = nodeKey.slice(separatorIndex + 2)
  return {
    personId,
    relationId: relationId || null,
  }
}

const LAYOUT_SLOT_PX = 340
const VERTICAL_SPACING = 360

/** Máximo ancho reservado en layout para la card hub expandida (coherente con CSS). */
export const HUB_LAYOUT_MAX_PX = 900
/** Fracción del viewport para ancho de rama del hub (~70–85 % útil). */
const HUB_BRANCH_VIEWPORT_RATIO = 0.85
const DEFAULT_VIEWPORT_WIDTH = 1200
/** Gap horizontal entre hermanos de fila 2 (px). */
const SIBLING_GAP_COMPACT_PX = 28
const SIBLING_GAP_HUB_OPEN_PX = 56

export type BuildOrgMapOptions = {
  /** Nodo de fila 2 con panel interno abierto: reserva más ancho en el layout. */
  expandedHubNodeId?: string | null
  /** Ancho del contenedor del mapa (ResizeObserver) para `min(900, 85vw)`. */
  viewportWidth?: number
}

/**
 * Ancho de rama horizontal asignado al nodo de fila 2 cuando su hub está expandido.
 * Debe coincidir con `.org-map-holo--hub { max-width: min(900px, 85vw) }`.
 */
export function getExpandedHubBranchWidthPx(viewportWidth: number): number {
  const vw =
    viewportWidth > 0 ? viewportWidth : DEFAULT_VIEWPORT_WIDTH
  return Math.min(
    HUB_LAYOUT_MAX_PX,
    Math.max(LAYOUT_SLOT_PX, vw * HUB_BRANCH_VIEWPORT_RATIO),
  )
}

function branchWidthRow2(
  childId: string,
  expandedHubNodeId: string | null | undefined,
  viewportWidth: number,
): number {
  if (expandedHubNodeId && childId === expandedHubNodeId) {
    return getExpandedHubBranchWidthPx(viewportWidth)
  }
  return LAYOUT_SLOT_PX
}

/**
 * Construye el grafo del mapa: como máximo **dos niveles** de nodos (aristas sólo entre ellos).
 */
export function buildOrgMap(
  root: OrgNode,
  options?: BuildOrgMapOptions,
): OrgMapGraph {
  const expandedHubNodeId = options?.expandedHubNodeId ?? null
  const viewportWidth =
    options?.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH

  const nodes: Node<OrgMapNodeData>[] = []
  const edges: Edge[] = []

  function walk(
    node: OrgNode,
    x: number,
    y: number,
    parentId: string | undefined,
    depth: number,
  ) {
    nodes.push({
      id: orgMapNodeKey(node),
      type: 'orgNode',
      /** `x` del walk es el centro horizontal del slot; `y` es el borde superior de la fila. */
      origin: [0.5, 0],
      position: { x, y },
      data: {
        orgNode: node,
        mapLayoutDepth: depth,
      },
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${orgMapNodeKey(node)}`,
        source: parentId,
        target: orgMapNodeKey(node),
        type: 'smoothstep',
        animated: false,
        style: {
          strokeWidth: 1.6,
        },
      })
    }

    if (node.children.length === 0 || depth >= 1) {
      return
    }

    const hubOpen = Boolean(expandedHubNodeId)
    const gap = hubOpen ? SIBLING_GAP_HUB_OPEN_PX : SIBLING_GAP_COMPACT_PX
    const widths = node.children.map((c) =>
      branchWidthRow2(orgMapNodeKey(c), expandedHubNodeId, viewportWidth),
    )
    const totalWidth =
      widths.reduce((a, b) => a + b, 0) +
      gap * Math.max(0, widths.length - 1)

    let currentX = x - totalWidth / 2

    for (let i = 0; i < node.children.length; i++) {
      const w = widths[i]!
      const cx = currentX + w / 2
      walk(node.children[i]!, cx, y + VERTICAL_SPACING, orgMapNodeKey(node), depth + 1)
      currentX += w + gap
    }
  }

  walk(root, 0, 0, undefined, 0)

  return {
    nodes,
    edges,
  }
}
