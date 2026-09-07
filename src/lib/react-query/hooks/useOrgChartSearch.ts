import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartSearch } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

const MIN_SEARCH_LENGTH = 2;

export function useOrgChartSearch(query: string) {
  const trimmed = query.trim();
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();

  return useQuery({
    queryKey: orgQueryKeys.search(trimmed, versionId, scopeVersionId),
    queryFn: () =>
      fetchOrgChartSearch(
        trimmed,
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined,
      ),
    enabled: versionReady && trimmed.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
  });
}
