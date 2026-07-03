import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgChartNode } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgChartNode(
  personId: string,
  enabled = true,
  relationId?: number | string | null,
) {
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.node(personId, versionId, relationId),
    queryFn: () =>
      fetchOrgChartNode(
        personId,
        versionId || relationId != null
          ? { versionId, relationId }
          : undefined,
      ),
    enabled: enabled && versionReady && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
