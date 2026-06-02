import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgSummary } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartSummary(personId: string, enabled = true) {
  return useQuery({
    queryKey: orgQueryKeys.summary(personId),
    queryFn: () => fetchOrgSummary(personId),
    enabled: enabled && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
