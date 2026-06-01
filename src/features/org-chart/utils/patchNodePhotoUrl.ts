import type { OrgNode } from '../types'

/** Propaga `photoUrl` del detalle o de hijos recién cargados al árbol en memoria. */
export function patchNodePhotoUrl(
  root: OrgNode,
  personId: string,
  photoUrl: string | null | undefined,
): OrgNode {
  if (!photoUrl) {
    return root
  }

  function walk(node: OrgNode): OrgNode {
    if (node.id === personId) {
      return { ...node, photoUrl }
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
