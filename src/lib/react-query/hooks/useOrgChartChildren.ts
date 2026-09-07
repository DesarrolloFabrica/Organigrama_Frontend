import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartChildren } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function orgChartChildrenQueryOptions(
  personId: string,
  versionId?: number,
  relationId?: number | string | null,
  scopeVersionId?: number | "none",
) {
  return {
    queryKey: orgQueryKeys.children(
      personId,
      versionId,
      relationId,
      scopeVersionId,
    ),
    queryFn: () =>
      fetchOrgChartChildren(personId, {
        ...(versionId !== undefined ? { versionId } : {}),
        ...(scopeVersionId !== undefined ? { scopeVersionId } : {}),
        ...(relationId != null ? { relationId } : {}),
      }),
  } as const;
}

export function useOrgChartChildren(
  personId: string,
  enabled = false,
  relationId?: number | string | null,
) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    ...orgChartChildrenQueryOptions(
      personId,
      versionId,
      relationId,
      scopeVersionId,
    ),
    enabled: enabled && versionReady && Boolean(personId),
  });
}
