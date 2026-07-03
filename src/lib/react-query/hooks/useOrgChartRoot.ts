import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartRoot } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartRoot(enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.root(versionId),
    queryFn: () => fetchOrgChartRoot(versionId ? { versionId } : undefined),
    enabled: enabled && versionReady,
  });
}
