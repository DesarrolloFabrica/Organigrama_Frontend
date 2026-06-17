import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgPersonDetail } from "../../../features/org-chart/services/orgChartService";
import { useOrgChartVersionQueryId } from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

export function useOrgPersonDetail(personId: string | null) {
  const versionId = useOrgChartVersionQueryId();
  return useQuery({
    queryKey: orgQueryKeys.personDetail(personId ?? "", versionId),
    queryFn: () =>
      fetchOrgPersonDetail(personId!, versionId ? { versionId } : undefined),
    enabled: Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
