import type { OrgNode } from '../types'

/**
 * Inserta o reemplaza los hijos directos de `parentId` en una copia inmutable del árbol.
 *
 * Si se provee `parentRelationId`, el match exige además que el nodo tenga esa
 * posición visual (`relation_id`). Así se evita mezclar los equipos de dos
 * posiciones distintas de la misma persona (mismo `id`) en el árbol.
 */
export function mergeChildrenIntoTree(
  root: OrgNode,
  parentId: string,
  children: OrgNode[],
  parentRelationId?: string | null,
): OrgNode {
  function matches(node: OrgNode): boolean {
    if (node.id !== parentId) return false
    if (parentRelationId == null) return true
    return (node.relation_id ?? null) === parentRelationId
  }

  function walk(node: OrgNode): OrgNode {
    if (matches(node)) {
      return {
        ...node,
        children,
        direct_reports_count: node.direct_reports_count ?? children.length,
      }
    }

    if (node.children.length === 0) {
      return node
    }

    return {
      ...node,
      children: node.children.map(walk),
    }
  }

  return walk(root)
}
