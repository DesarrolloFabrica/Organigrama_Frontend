import { getAuthUser } from "../../../auth/authStorage";
import type { OrgNode } from "../types";

const SESSION_KEY = "organigrama.orgChartMain.v2";

export type OrgMapViewportPersisted = {
  x: number;
  y: number;
  zoom: number;
};

export type OrgMapExpansionPersisted = {
  showRootChildren: boolean;
  expandedHubNodeId: string | null;
  viewport: OrgMapViewportPersisted | null;
};

export type OrgChartMainSession = {
  /** `AuthUser.personId` del dueño del snapshot; evita mezclar sesiones entre usuarios. */
  ownerKey: string;
  tree: OrgNode | null;
  selectedPersonId: string | null;
  detailPanelMinimized: boolean;
  expandedNodeId: string | null;
  map: OrgMapExpansionPersisted;
};

const defaultMapState = (): OrgMapExpansionPersisted => ({
  showRootChildren: false,
  expandedHubNodeId: null,
  viewport: null,
});

let memorySession: OrgChartMainSession | null = null;

export function getOrgChartSessionOwnerKey(): string | null {
  return getAuthUser()?.personId ?? null;
}

function readFromStorage(): OrgChartMainSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrgChartMainSession;
    if (!parsed.ownerKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(session: OrgChartMainSession | null): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (!session) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("organigrama.orgChartMain.v1");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Cuota o modo privado: memoria sigue activa en la pestaña.
  }
}

function isSessionOwnedByCurrentUser(
  session: OrgChartMainSession | null,
): session is OrgChartMainSession {
  const ownerKey = getOrgChartSessionOwnerKey();
  if (!ownerKey || !session?.ownerKey) return false;
  return session.ownerKey === ownerKey;
}

/** Devuelve el snapshot solo si pertenece al usuario autenticado actual. */
export function getOrgChartMainSession(): OrgChartMainSession | null {
  const ownerKey = getOrgChartSessionOwnerKey();
  if (!ownerKey) {
    return null;
  }

  const candidate = memorySession ?? readFromStorage();
  if (!isSessionOwnedByCurrentUser(candidate)) {
    if (candidate) {
      clearOrgChartMainSession();
    }
    return null;
  }

  memorySession = candidate;
  return candidate;
}

export function saveOrgChartMainSession(
  patch: Partial<Omit<OrgChartMainSession, "ownerKey">>,
): void {
  const ownerKey = getOrgChartSessionOwnerKey();
  if (!ownerKey) {
    return;
  }

  const previous = getOrgChartMainSession();
  const current: OrgChartMainSession = {
    ownerKey,
    tree: null,
    selectedPersonId: null,
    detailPanelMinimized: false,
    expandedNodeId: null,
    ...previous,
    ...patch,
    map: {
      ...defaultMapState(),
      ...previous?.map,
      ...patch.map,
    },
  };
  memorySession = current;
  writeToStorage(current);
}

export function clearOrgChartMainSession(): void {
  memorySession = null;
  writeToStorage(null);
}
