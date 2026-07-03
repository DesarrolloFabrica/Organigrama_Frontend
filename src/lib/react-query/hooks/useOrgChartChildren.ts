import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartChildren } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId, useOrgChartVersionReady } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function orgChartChildrenQueryOptions(
  personId: string,
  versionId?: number,
  relationId?: number | string | null,
) {
  return {
    queryKey: orgQueryKeys.children(personId, versionId, relationId),
    queryFn: () =>
      fetchOrgChartChildren(
        personId,
        versionId || relationId != null
          ? { versionId, relationId }
          : undefined,
      ),
  } as const;
}

export function useOrgChartChildren(
  personId: string,
  enabled = false,
  relationId?: number | string | null,
) {
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    ...orgChartChildrenQueryOptions(personId, versionId, relationId),
    enabled: enabled && versionReady && Boolean(personId),
  });
}
