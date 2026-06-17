import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartChildren } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function orgChartChildrenQueryOptions(
  personId: string,
  versionId?: number,
) {
  return {
    queryKey: orgQueryKeys.children(personId, versionId),
    queryFn: () =>
      fetchOrgChartChildren(personId, versionId ? { versionId } : undefined),
  } as const;
}

export function useOrgChartChildren(personId: string, enabled = false) {
  const versionId = useOrgChartVersionQueryId();
  return useQuery({
    ...orgChartChildrenQueryOptions(personId, versionId),
    enabled: enabled && Boolean(personId),
  });
}
