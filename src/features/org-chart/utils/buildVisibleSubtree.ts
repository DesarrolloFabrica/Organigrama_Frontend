import type { OrgNode } from "../types";
import { shouldRenderHorizontalRow } from "./orgMapDisplayPolicy";

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
 * Clon para el mapa React Flow.
 * - Raíz colapsada → sólo raíz.
 * - Raíz expandida con tier `treeMap` (≤5) → raíz + fila 2 en canvas.
 * - Raíz expandida con tier `teamBox` (6–15) → sólo raíz (hijos en hub interno).
 * - Raíz expandida con tier `teamListPage` (>15) → sólo raíz (navegar a lista dedicada).
 * El equipo de fila 2 se muestra en el hub (`expandedHubNodeId`) sólo si tier `teamBox`.
 */
export function buildVisibleSubtree(
  root: OrgNode,
  showRootDirectReports: boolean,
): OrgNode {
  if (!showRootDirectReports) {
    return { ...root, children: [] };
  }

  if (!shouldRenderHorizontalRow(root)) {
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
