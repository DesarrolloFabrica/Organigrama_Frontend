import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrgPersonDetail } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

export function useOrgPersonDetail(personId: string | null) {
  return useQuery({
    queryKey: orgQueryKeys.personDetail(personId ?? ""),
    queryFn: () => fetchOrgPersonDetail(personId!),
    enabled: Boolean(personId),
    placeholderData: keepPreviousData,
  });
}
