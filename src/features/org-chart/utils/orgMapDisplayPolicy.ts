import type { OrgNode } from "../types";
import { orgNodeHasDirectReports } from "../types";

export const TREE_MAX_CHILDREN = 5;
export const TEAM_BOX_MAX_CHILDREN = 15;

/** @deprecated Usar `TREE_MAX_CHILDREN`; conservado por compatibilidad interna. */
export const MASSIVE_CHILDREN_THRESHOLD = TREE_MAX_CHILDREN;

export type TeamDisplayTier = "treeMap" | "teamBox" | "teamListPage";

/** Modo de renderizado activo en el lienzo o en mini-cards anidadas. */
export type OrgMapRenderMode = TeamDisplayTier;

export type TeamNavigationAction =
  | "none"
  | "expandHorizontalTree"
  | "expandTeamBox"
  | "navigateToTeamPage";

/** Conteo de reportes directos (prioriza API antes del lazy load). */
export function getDirectReportsCount(node: OrgNode | undefined): number {
  if (!node) return 0;
  if (typeof node.direct_reports_count === "number") {
    return node.direct_reports_count;
  }
  return node.children.length;
}

/** Si los hijos ya están en memoria, usa el tamaño real del equipo cargado. */
export function getEffectiveDirectReportsCount(
  node: OrgNode | undefined,
): number {
  if (!node) return 0;
  if (node.children.length > 0) {
    return node.children.length;
  }
  return getDirectReportsCount(node);
}

export function resolveTeamDisplayTier(
  node: OrgNode | undefined,
): TeamDisplayTier {
  const count = getEffectiveDirectReportsCount(node);
  if (count <= TREE_MAX_CHILDREN) return "treeMap";
  if (count <= TEAM_BOX_MAX_CHILDREN) return "teamBox";
  return "teamListPage";
}

export function isTreeTeam(node: OrgNode | undefined): boolean {
  return resolveTeamDisplayTier(node) === "treeMap";
}

export function isMediumTeam(node: OrgNode | undefined): boolean {
  return resolveTeamDisplayTier(node) === "teamBox";
}

export function isLargeTeam(node: OrgNode | undefined): boolean {
  return resolveTeamDisplayTier(node) === "teamListPage";
}

/** Equipo con más de 5 reportes directos (caja o lista). */
export function isMassiveTeam(node: OrgNode | undefined): boolean {
  if (!node) return false;
  return getDirectReportsCount(node) > TREE_MAX_CHILDREN;
}

export function shouldRenderHorizontalRow(node: OrgNode | undefined): boolean {
  if (!node) return false;
  return orgNodeHasDirectReports(node) && isTreeTeam(node);
}

export function shouldRenderTeamBox(node: OrgNode | undefined): boolean {
  if (!node) return false;
  return orgNodeHasDirectReports(node) && isMediumTeam(node);
}

export function shouldNavigateToTeamListPage(
  node: OrgNode | undefined,
): boolean {
  if (!node) return false;
  return orgNodeHasDirectReports(node) && isLargeTeam(node);
}

/** Grilla EQUIPO dentro de la caja expandida (hasta 15 personas). */
export function shouldRenderInternalTeamHub(
  node: OrgNode | undefined,
): boolean {
  if (!node) return false;
  return (
    orgNodeHasDirectReports(node) &&
    getEffectiveDirectReportsCount(node) <= TEAM_BOX_MAX_CHILDREN
  );
}

/**
 * Enlace "Ver equipo" fuera del lienzo (mini-cards, listas).
 * Cualquier persona con reportes directos puede abrirse en /org/team/:id.
 */
export function shouldOfferTeamExplorationLink(
  node: OrgNode | undefined,
): boolean {
  if (!node) return false;
  return orgNodeHasDirectReports(node);
}

/**
 * Decide cómo mostrar o navegar el equipo directo de un nodo.
 * - Raíz + ≤5: fila horizontal en el mapa.
 * - Raíz + 6–15: hub interno (grilla).
 * - Fila 2 + ≤15: hub interno en la misma página.
 * - >15: vista de lista dedicada (nueva página).
 */
export function resolveTeamNavigation(
  node: OrgNode | undefined,
  options: { isCanvasRoot: boolean },
): TeamNavigationAction {
  if (!node || !orgNodeHasDirectReports(node)) {
    return "none";
  }

  const tier = resolveTeamDisplayTier(node);

  if (tier === "teamListPage") {
    return "navigateToTeamPage";
  }

  if (options.isCanvasRoot && tier === "treeMap") {
    return "expandHorizontalTree";
  }

  return "expandTeamBox";
}

/** Modo visual activo cuando hay una caja/equipo abierta en el lienzo. */
export function deriveOrgMapRenderMode(options: {
  rootExpanded: boolean;
  rootNode: OrgNode | undefined;
  expandedHubNodeId: string | null;
}): OrgMapRenderMode {
  const { rootExpanded, rootNode, expandedHubNodeId } = options;

  if (rootExpanded && rootNode && shouldRenderTeamBox(rootNode)) {
    return "teamBox";
  }

  if (expandedHubNodeId) {
    return "teamBox";
  }

  return "treeMap";
}
