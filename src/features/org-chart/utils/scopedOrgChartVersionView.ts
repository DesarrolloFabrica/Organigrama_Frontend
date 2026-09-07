import type { OrgChartVersionScopeGroup } from "./filterVisibleOrgChartVersions";

export type ScopedOrgChartVersionViewContext = {
  pathname: string;
  personId?: string;
  breadcrumb?: string[];
  flowIdentityLabel?: string | null;
};

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isOrgChartTeamExplorePath(pathname: string): boolean {
  return /\/org\/team\//.test(pathname) || /\/org-chart\/team\//.test(pathname);
}

export function teamPersonIdFromPathname(pathname: string): string | undefined {
  const match = pathname.match(/\/(?:org|org-chart)\/team\/([^/?#]+)/);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * El versionamiento de una coordinación no es global: solo aplica en la
 * vista de equipo de esa coordinación (o de alguien de su subárbol).
 */
export function isScopedVersionGroupVisible(
  group: OrgChartVersionScopeGroup,
  view: ScopedOrgChartVersionViewContext,
): boolean {
  if (!isOrgChartTeamExplorePath(view.pathname)) return false;

  const rootIds = new Set(
    group.versions
      .map((version) => version.scopeRootPersonId)
      .filter((id): id is number => id != null)
      .map(String),
  );
  if (view.personId && rootIds.has(view.personId)) return true;
  if (view.breadcrumb?.some((id) => rootIds.has(id))) return true;

  const identity = normalizeLabel(view.flowIdentityLabel ?? "");
  if (!identity) return false;

  if (group.scopeCode === "fabrica-contenidos" && identity.includes("fabrica")) {
    return true;
  }

  const scopeLabel = normalizeLabel(group.scopeLabel);
  return Boolean(scopeLabel) && identity.includes(scopeLabel);
}

export function filterVisibleScopedVersionGroups(
  groups: OrgChartVersionScopeGroup[],
  view: ScopedOrgChartVersionViewContext,
): OrgChartVersionScopeGroup[] {
  return groups.filter((group) => isScopedVersionGroupVisible(group, view));
}
