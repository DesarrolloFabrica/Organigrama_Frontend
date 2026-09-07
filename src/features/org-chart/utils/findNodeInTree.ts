import type { OrgNode } from "../types";

/**
 * True si el nodo es la persona `id` y, cuando se pide, la posición visual
 * (`relation_id`) concreta. Sin `relationId` coincide la primera aparición.
 */
export function orgNodeMatchesTarget(
  node: Pick<OrgNode, "id" | "relation_id">,
  id: string,
  relationId?: string | null,
): boolean {
  if (node.id !== id) return false;
  if (relationId == null || relationId === "") return true;
  return (node.relation_id ?? null) === relationId;
}

/** Busca un nodo por persona y, opcionalmente, por posición visual. */
export function findNodeInTree(
  root: OrgNode,
  id: string,
  relationId?: string | null,
): OrgNode | null {
  if (orgNodeMatchesTarget(root, id, relationId)) return root;
  for (const child of root.children) {
    const found = findNodeInTree(child, id, relationId);
    if (found) return found;
  }
  return null;
}
