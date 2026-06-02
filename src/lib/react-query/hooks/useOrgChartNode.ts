import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartNode } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartNode(personId: string, enabled = true) {
  return useQuery({
    queryKey: orgQueryKeys.node(personId),
    queryFn: () => fetchOrgChartNode(personId),
    enabled: enabled && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
