import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartSearch } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

const MIN_SEARCH_LENGTH = 2;

export function useOrgChartSearch(query: string) {
  const trimmed = query.trim();
  const versionId = useOrgChartVersionQueryId();

  return useQuery({
    queryKey: orgQueryKeys.search(trimmed, versionId),
    queryFn: () =>
      fetchOrgChartSearch(trimmed, versionId ? { versionId } : undefined),
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
  });
}
