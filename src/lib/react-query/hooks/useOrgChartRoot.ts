import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartRoot } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartRoot(enabled = true) {
  return useQuery({
    queryKey: orgQueryKeys.root,
    queryFn: fetchOrgChartRoot,
    enabled,
  });
}
