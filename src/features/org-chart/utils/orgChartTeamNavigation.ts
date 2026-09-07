/** Estado de navegación entre vistas de equipo (/org/team/:id). */
export type OrgTeamPaletteIdentity = {
  icon: string;
  label: string;
  glowColor: string;
  highlightColor?: string;
};

export type OrgTeamNavState = {
  /** Ancestros visitados antes del nodo actual (sin incluir el actual). */
  breadcrumb: string[];
  /** Paleta efectiva de cada ancestro, alineada por índice con `breadcrumb`. */
  paletteTrail?: Array<OrgTeamPaletteIdentity | null>;
  /** Paleta que debe recuperar `/org` al volver desde el primer equipo. */
  rootReturnIdentity?: OrgTeamPaletteIdentity | null;
};

function isPaletteIdentity(value: unknown): value is OrgTeamPaletteIdentity {
  if (!value || typeof value !== "object") return false;
  const identity = value as Partial<OrgTeamPaletteIdentity>;
  return (
    typeof identity.icon === "string" &&
    typeof identity.label === "string" &&
    typeof identity.glowColor === "string" &&
    (identity.highlightColor === undefined ||
      typeof identity.highlightColor === "string")
  );
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

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
  const candidate = state as Partial<OrgTeamNavState>;
  const breadcrumb = candidate.breadcrumb;
  if (!Array.isArray(breadcrumb)) return undefined;
  if (!breadcrumb.every((id) => typeof id === "string")) return undefined;

  const parsed: OrgTeamNavState = { breadcrumb };

  if (hasOwn(candidate, "paletteTrail")) {
    const paletteTrail = candidate.paletteTrail;
    if (
      !Array.isArray(paletteTrail) ||
      paletteTrail.length !== breadcrumb.length ||
      !paletteTrail.every(
        (identity) => identity === null || isPaletteIdentity(identity),
      )
    ) {
      return undefined;
    }
    parsed.paletteTrail = paletteTrail;
  }

  if (hasOwn(candidate, "rootReturnIdentity")) {
    const identity = candidate.rootReturnIdentity;
    if (identity !== null && !isPaletteIdentity(identity)) return undefined;
    parsed.rootReturnIdentity = identity;
  }

  return parsed;
}

/** Estado al abrir el equipo de `targetPersonId` desde `currentPersonId` (o desde /org). */
export function buildTeamExploreNavState(options: {
  currentPersonId?: string | null;
  navState?: OrgTeamNavState | null;
  currentIdentity?: OrgTeamPaletteIdentity | null;
  rootReturnIdentity?: OrgTeamPaletteIdentity | null;
}): OrgTeamNavState {
  const {
    currentPersonId,
    navState,
    currentIdentity,
    rootReturnIdentity,
  } = options;
  const hasInheritedRootIdentity = Boolean(
    navState && hasOwn(navState, "rootReturnIdentity"),
  );
  const hasRootIdentity =
    rootReturnIdentity !== undefined || hasInheritedRootIdentity;
  const resolvedRootIdentity =
    rootReturnIdentity !== undefined
      ? rootReturnIdentity
      : navState?.rootReturnIdentity;

  if (!currentPersonId) {
    return {
      breadcrumb: [],
      ...(hasRootIdentity
        ? { rootReturnIdentity: resolvedRootIdentity ?? null }
        : {}),
    };
  }

  const breadcrumb = navState?.breadcrumb ?? [];
  const hasPaletteTrail =
    currentIdentity !== undefined || Boolean(navState?.paletteTrail);
  const previousPaletteTrail =
    navState?.paletteTrail ?? breadcrumb.map(() => null);

  return {
    breadcrumb: [...breadcrumb, currentPersonId],
    ...(hasPaletteTrail
      ? { paletteTrail: [...previousPaletteTrail, currentIdentity ?? null] }
      : {}),
    ...(hasRootIdentity
      ? { rootReturnIdentity: resolvedRootIdentity ?? null }
      : {}),
  };
}

/**
 * Destino del botón Volver: nodo padre inmediato o /org si se llegó desde el mapa principal.
 */
export function resolveTeamBackNavigation(options: {
  navState?: OrgTeamNavState | null;
}): {
  path: string;
  state?: OrgTeamNavState;
  backgroundIdentity?: OrgTeamPaletteIdentity | null;
} {
  const breadcrumb = options.navState?.breadcrumb ?? [];
  if (breadcrumb.length === 0) {
    const navState = options.navState;
    return {
      path: "/org",
      ...(navState && hasOwn(navState, "rootReturnIdentity")
        ? { backgroundIdentity: navState.rootReturnIdentity ?? null }
        : {}),
    };
  }

  const parentIndex = breadcrumb.length - 1;
  const parentId = breadcrumb[parentIndex]!;
  const navState = options.navState!;
  const nextState: OrgTeamNavState = {
    breadcrumb: breadcrumb.slice(0, -1),
    ...(navState.paletteTrail
      ? { paletteTrail: navState.paletteTrail.slice(0, -1) }
      : {}),
    ...(hasOwn(navState, "rootReturnIdentity")
      ? { rootReturnIdentity: navState.rootReturnIdentity ?? null }
      : {}),
  };

  return {
    path: buildTeamExplorePath(parentId),
    state: nextState,
    ...(navState.paletteTrail
      ? { backgroundIdentity: navState.paletteTrail[parentIndex] ?? null }
      : {}),
  };
}
