import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartNode } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartNode(personId: string, enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  return useQuery({
    queryKey: orgQueryKeys.node(personId, versionId),
    queryFn: () =>
      fetchOrgChartNode(personId, versionId ? { versionId } : undefined),
    enabled: enabled && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
