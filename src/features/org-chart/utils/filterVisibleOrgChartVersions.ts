import type { OrgChartVersion } from "../types/orgChartVersion";

export type OrgChartVersionScopeGroup = {
  scopeCode: string;
  scopeLabel: string;
  versions: OrgChartVersion[];
};

function isGlobalVersion(version: OrgChartVersion): boolean {
  return (version.scopeType ?? "GLOBAL") !== "COORDINATION";
}

/**
 * Versiones visibles en el selector global del usuario técnico.
 * El backend ya restringe el listado; aquí se excluyen las de coordinación.
 */
export function filterVisibleOrgChartVersions(
  versions: OrgChartVersion[],
): OrgChartVersion[] {
  return versions.filter(isGlobalVersion);
}

function compareScopedVersions(a: OrgChartVersion, b: OrgChartVersion): number {
  if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
  return b.id - a.id;
}

/** Coordinaciones que tienen al menos una versión independiente. */
export function groupScopedOrgChartVersions(
  versions: OrgChartVersion[],
): OrgChartVersionScopeGroup[] {
  const groups = new Map<string, OrgChartVersionScopeGroup>();
  for (const version of versions) {
    if (isGlobalVersion(version) || !version.scopeCode) continue;
    const existing = groups.get(version.scopeCode);
    if (existing) {
      existing.versions.push(version);
      continue;
    }
    groups.set(version.scopeCode, {
      scopeCode: version.scopeCode,
      scopeLabel: version.scopeLabel?.trim() || version.name,
      versions: [version],
    });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    versions: [...group.versions].sort(compareScopedVersions),
  }));
}

export function orgChartVersionSelectorLabel(version: OrgChartVersion): string {
  if (version.isActive) return `${version.name} (vigente)`;
  if (!version.isLocked && !version.isActive) return `${version.name} (borrador)`;
  return `${version.name} (histórico)`;
}
