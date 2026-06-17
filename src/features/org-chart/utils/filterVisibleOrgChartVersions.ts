import type { OrgChartVersion } from "../types/orgChartVersion";

export type FilterOrgChartVersionsOptions = {
  /** Muestra versiones locked e inactivas (p. ej. current, snapshot-prueba). */
  showAdvancedHistorical?: boolean;
};

/**
 * Versiones relevantes para el selector del usuario técnico.
 * Solo usa `isActive` e `isLocked` (no el code).
 */
export function filterVisibleOrgChartVersions(
  versions: OrgChartVersion[],
  options: FilterOrgChartVersionsOptions = {},
): OrgChartVersion[] {
  const { showAdvancedHistorical = false } = options;

  return versions.filter((version) => {
    if (version.isActive) return true;
    if (!version.isLocked && !version.isActive) return true;
    if (showAdvancedHistorical && version.isLocked && !version.isActive) {
      return true;
    }
    return false;
  });
}

export function orgChartVersionSelectorLabel(version: OrgChartVersion): string {
  if (version.isActive) return `${version.name} (vigente)`;
  if (!version.isLocked && !version.isActive) return `${version.name} (borrador)`;
  return `${version.name} (histórico)`;
}
