export type OrgChartVersionQueryOptions = {
  versionId?: number;
};

/** Añade ?versionId= solo cuando el caller autorizado lo provee. */
export function buildVersionQuery(
  path: string,
  options?: OrgChartVersionQueryOptions,
): string {
  if (!options?.versionId) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}versionId=${encodeURIComponent(String(options.versionId))}`;
}
