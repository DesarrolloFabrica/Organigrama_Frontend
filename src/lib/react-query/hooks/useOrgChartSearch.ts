import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartSearch } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

const MIN_SEARCH_LENGTH = 2;

export function useOrgChartSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: orgQueryKeys.search(trimmed),
    queryFn: () => fetchOrgChartSearch(trimmed),
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
  });
}
