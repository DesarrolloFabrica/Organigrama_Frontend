import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgSummary } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartSummary(personId: string, enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.summary(personId, versionId),
    queryFn: () =>
      fetchOrgSummary(personId, versionId ? { versionId } : undefined),
    enabled: enabled && versionReady && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
