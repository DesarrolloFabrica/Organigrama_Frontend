import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartRoot } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartRoot(enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.root(versionId, scopeVersionId),
    queryFn: () =>
      fetchOrgChartRoot(
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined,
      ),
    enabled: enabled && versionReady,
  });
}
