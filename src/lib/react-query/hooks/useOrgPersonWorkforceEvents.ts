import { useQuery } from "@tanstack/react-query";
import { getPersonWorkforceEvents } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartVersionQueryId,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

/**
 * Historial de novedades de una persona (schema `workforce_events`).
 * Deshabilitada sin personId o si `enabled` es false.
 */
export function useOrgPersonWorkforceEvents(
  personId: string | null,
  enabled = true,
) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.personWorkforceEvents(
      personId ?? "",
      versionId,
      scopeVersionId,
    ),
    queryFn: () =>
      getPersonWorkforceEvents(
        personId!,
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined,
      ),
    enabled: versionReady && Boolean(personId) && enabled,
  });
}
