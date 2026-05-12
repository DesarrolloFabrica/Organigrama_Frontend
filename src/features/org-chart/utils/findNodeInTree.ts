import type { OrgNode } from "../types";

/** Busca un nodo por id en el árbol (mismo contrato que el API). */
export function findNodeInTree(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeInTree(child, id);
    if (found) return found;
  }
  return null;
}
