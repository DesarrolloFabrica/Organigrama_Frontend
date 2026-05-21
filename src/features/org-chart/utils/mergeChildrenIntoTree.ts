import type { OrgNode } from '../types'

/**
 * Inserta o reemplaza los hijos directos de `parentId` en una copia inmutable del árbol.
 */
export function mergeChildrenIntoTree(
  root: OrgNode,
  parentId: string,
  children: OrgNode[],
): OrgNode {
  function walk(node: OrgNode): OrgNode {
    if (node.id === parentId) {
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
