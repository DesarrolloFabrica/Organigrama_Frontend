import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartChildren } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

export function orgChartChildrenQueryOptions(personId: string) {
  return {
    queryKey: orgQueryKeys.children(personId),
    queryFn: () => fetchOrgChartChildren(personId),
  } as const;
}

export function useOrgChartChildren(personId: string, enabled = false) {
  return useQuery({
    ...orgChartChildrenQueryOptions(personId),
    enabled: enabled && Boolean(personId),
  });
}
