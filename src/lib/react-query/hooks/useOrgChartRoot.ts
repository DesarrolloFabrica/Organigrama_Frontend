import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartRoot } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartRoot(enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  return useQuery({
    queryKey: orgQueryKeys.root(versionId),
    queryFn: () => fetchOrgChartRoot(versionId ? { versionId } : undefined),
    enabled,
  });
}
