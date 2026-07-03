import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgPersonDetail } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgPersonDetail(personId: string | null) {
  const versionId = useOrgChartVersionQueryId();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.personDetail(personId ?? "", versionId),
    queryFn: () =>
      fetchOrgPersonDetail(personId!, versionId ? { versionId } : undefined),
    enabled: versionReady && Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
