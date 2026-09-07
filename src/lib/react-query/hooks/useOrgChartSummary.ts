import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgSummary } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartSummary(personId: string, enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.summary(personId, versionId, scopeVersionId),
    queryFn: () =>
      fetchOrgSummary(
        personId,
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined,
      ),
    enabled: enabled && versionReady && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
