/** Estado de navegación entre vistas de equipo (/org/team/:id). */
export type OrgTeamNavState = {
  /** Ancestros visitados antes del nodo actual (sin incluir el actual). */
  breadcrumb: string[];
};

export function buildTeamExplorePath(
  personId: string,
  relationId?: string | null,
): string {
  const base = `/org/team/${encodeURIComponent(personId)}`;
  if (relationId == null) return base;
  return `${base}?relationId=${encodeURIComponent(relationId)}`;
}

export function readOrgTeamNavState(
  state: unknown,
): OrgTeamNavState | undefined {
  if (!state || typeof state !== "object") return undefined;
  const breadcrumb = (state as OrgTeamNavState).breadcrumb;
  if (!Array.isArray(breadcrumb)) return undefined;
  if (!breadcrumb.every((id) => typeof id === "string")) return undefined;
  return { breadcrumb };
}

/** Estado al abrir el equipo de `targetPersonId` desde `currentPersonId` (o desde /org). */
export function buildTeamExploreNavState(options: {
  currentPersonId?: string | null;
  navState?: OrgTeamNavState | null;
}): OrgTeamNavState {
  const { currentPersonId, navState } = options;
  if (!currentPersonId) {
    return { breadcrumb: [] };
  }
  const breadcrumb = navState?.breadcrumb ?? [];
  return { breadcrumb: [...breadcrumb, currentPersonId] };
}

/**
 * Destino del botón Volver: nodo padre inmediato o /org si se llegó desde el mapa principal.
 */
export function resolveTeamBackNavigation(options: {
  navState?: OrgTeamNavState | null;
}): { path: string; state?: OrgTeamNavState } {
  const breadcrumb = options.navState?.breadcrumb ?? [];
  if (breadcrumb.length === 0) {
    return { path: "/org" };
  }

  const parentId = breadcrumb[breadcrumb.length - 1]!;
  return {
    path: buildTeamExplorePath(parentId),
    state: { breadcrumb: breadcrumb.slice(0, -1) },
  };
}
