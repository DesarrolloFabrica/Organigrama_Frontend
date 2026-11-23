import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPersonVideo } from "../../../features/org-chart/services/orgChartService";
import type { PersonVideoResponse } from "../../../features/org-chart/types";
import { orgQueryKeys } from "../queryKeys";

/**
 * Probe de disponibilidad de video de presentación.
 *
 * - `hasVideo` es cacheable (staleTime 5 min).
 * - El ticket es efímero: usar `refetch()` / `refreshPersonVideo` al entrar
 *   a Presentación si falta vigencia (ver isPersonVideoTicketFresh).
 */
export function useOrgPersonVideo(personId: string | null, enabled = true) {
  const query = useQuery({
    queryKey: orgQueryKeys.personVideo(personId ?? ""),
    queryFn: () => getPersonVideo(personId!),
    enabled: Boolean(personId) && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const refreshPersonVideo = useCallback(async (): Promise<{
    data?: PersonVideoResponse;
  }> => {
    const result = await query.refetch();
    return { data: result.data };
  }, [query.refetch]);

  return {
    ...query,
    refreshPersonVideo,
  };
}
