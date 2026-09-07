import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartNode } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartNode(
  personId: string,
  enabled = true,
  relationId?: number | string | null,
) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.node(personId, versionId, relationId, scopeVersionId),
    queryFn: () =>
      fetchOrgChartNode(personId, {
        ...requestOptions,
        ...(relationId != null ? { relationId } : {}),
      }),
    enabled: enabled && versionReady && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
