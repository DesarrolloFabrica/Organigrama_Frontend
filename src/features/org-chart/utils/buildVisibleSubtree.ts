import type { OrgNode } from "../types";

/**
 * Todos los ids de descendientes de `node`, sin incluir a `node.id`.
 * (Utilidad para otras vistas; el mapa ya no mantiene sets de expansión profunda.)
 */
export function collectDescendantIdsOnly(node: OrgNode): string[] {
  const ids: string[] = [];
  for (const child of node.children) {
    ids.push(child.id, ...collectDescendantIdsOnly(child));
  }
  return ids;
}

/**
 * Clon para el mapa React Flow: como máximo **raíz + reportes directos**.
 * El equipo de nivel 3+ se muestra sólo en el panel interno del hub (`expandedHubNodeId`).
 *
 * @param showRootDirectReports `false` → sólo la raíz en el lienzo; `true` → fila 2 visible (colapsada en hub).
 */
export function buildVisibleSubtree(
  root: OrgNode,
  showRootDirectReports: boolean,
): OrgNode {
  if (!showRootDirectReports) {
    return { ...root, children: [] };
  }
  return {
    ...root,
    children: root.children.map((child) => ({
      ...child,
      children: [],
    })),
  };
}
