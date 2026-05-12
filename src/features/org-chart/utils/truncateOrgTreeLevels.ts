import type { OrgNode } from "../types";

/**
 * Número de niveles visibles contando desde la raíz actual (nivel 1 = raíz).
 * Por ejemplo `maxLevels === 3` deja nodos en profundidades 0, 1 y 2; los hijos
 * de los nodos en profundidad 2 no se incluyen en la copia (sí se marca `deferred_team`).
 */
export function truncateTreeToMaxLevels(
  root: OrgNode,
  maxLevels: number,
  depthFromRoot = 0,
): OrgNode {
  if (maxLevels < 1) {
    return {
      ...root,
      children: [],
      deferred_team: root.children.length > 0,
      direct_reports_count:
        root.direct_reports_count ?? root.children.length,
    };
  }

  if (depthFromRoot >= maxLevels - 1) {
    return {
      ...root,
      children: [],
      deferred_team: root.children.length > 0,
      direct_reports_count:
        root.direct_reports_count ?? root.children.length,
    };
  }

  return {
    ...root,
    deferred_team: false,
    children: root.children.map((child) =>
      truncateTreeToMaxLevels(child, maxLevels, depthFromRoot + 1),
    ),
  };
}

/** Ids que deben estar expandidos para mostrar hasta `maxLevels` sin clics iniciales. */
export function collectDefaultExpandedIdsForDepth(
  root: OrgNode,
  maxLevels: number,
): Set<string> {
  const ids = new Set<string>();

  function walk(node: OrgNode, depth: number) {
    if (depth >= maxLevels - 1) return;
    ids.add(node.id);
    for (const child of node.children) {
      walk(child, depth + 1);
    }
  }

  walk(root, 0);
  return ids;
}
