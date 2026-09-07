export type OrgChartVersionQueryOptions = {
  versionId?: number;
  scopeVersionId?: number | "none";
  /**
   * Posición visual (`org_visual_relation.id`) para pedir hijos de una posición
   * específica de la persona. Solo se adjunta cuando el caller lo provee.
   */
  relationId?: number | string | null;
};

/** Añade ?versionId=, ?scopeVersionId= y ?relationId= solo cuando el caller los provee. */
export function buildVersionQuery(
  path: string,
  options?: OrgChartVersionQueryOptions,
): string {
  let result = path;
  const append = (key: string, value: string) => {
    const separator = result.includes("?") ? "&" : "?";
    result = `${result}${separator}${key}=${encodeURIComponent(value)}`;
  };

  if (options?.versionId) {
    append("versionId", String(options.versionId));
  }
  if (options?.scopeVersionId !== undefined) {
    append("scopeVersionId", String(options.scopeVersionId));
  }
  if (options?.relationId !== undefined && options?.relationId !== null) {
    append("relationId", String(options.relationId));
  }

  return result;
}
