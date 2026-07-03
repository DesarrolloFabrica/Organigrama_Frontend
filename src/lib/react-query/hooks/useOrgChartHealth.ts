import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../../../features/org-chart/services/orgChartService";

export const healthQueryKey = ["org-health"] as const;

export function useOrgChartHealthQuery() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: fetchHealth,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
