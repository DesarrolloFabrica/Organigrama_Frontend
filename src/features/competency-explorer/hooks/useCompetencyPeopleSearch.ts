import { useQuery } from "@tanstack/react-query";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../org-chart/context/OrgChartVersionContext";
import { fetchCompetencyPeopleSearch } from "../api/competencyPeopleSearchApi";
import type { CompetencyPeopleSearchQuery } from "../types/competencyPeopleSearch.types";
import { orgQueryKeys } from "../../../lib/react-query/queryKeys";

export function useCompetencyPeopleSearch(
  query: CompetencyPeopleSearchQuery,
  page: number,
) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.competencyPeopleSearch(
      query.domainCode,
      query.specialtyCode,
      query.skillCodes,
      page,
      versionId,
      scopeVersionId,
    ),
    queryFn: ({ signal }) =>
      fetchCompetencyPeopleSearch(
        { ...query, page },
        { ...requestOptions, signal },
      ),
    enabled: versionReady,
    staleTime: 30_000,
  });
}
