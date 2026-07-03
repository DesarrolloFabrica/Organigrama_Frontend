import type { OrgChartVersion } from "../types/orgChartVersion";

/**
 * Versiones visibles en el selector del usuario técnico.
 * El backend ya restringe el listado; aquí se devuelven todas las recibidas.
 */
export function filterVisibleOrgChartVersions(
  versions: OrgChartVersion[],
): OrgChartVersion[] {
  return versions;
}

export function orgChartVersionSelectorLabel(version: OrgChartVersion): string {
  if (version.isActive) return `${version.name} (vigente)`;
  if (!version.isLocked && !version.isActive) return `${version.name} (borrador)`;
  return `${version.name} (histórico)`;
}
