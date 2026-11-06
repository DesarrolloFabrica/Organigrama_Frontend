import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrgChartChangeToken } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

/** Intervalo de sondeo de la huella (solo con la pestaña visible). */
export const ORG_CHART_CHANGE_TOKEN_POLL_MS = 20_000;

/** Valor que devuelve el backend si no pudo calcular la huella. */
export const ORG_CHART_CHANGE_TOKEN_UNAVAILABLE = "unavailable";

/**
 * Decide si una huella nueva obliga a recargar. La primera huella válida
 * solo se registra; `unavailable` o vacío nunca invalida.
 */
export function shouldInvalidateOnChangeToken(
  previous: string | null,
  next: string | null | undefined,
): boolean {
  if (!next || next === ORG_CHART_CHANGE_TOKEN_UNAVAILABLE) return false;
  return previous !== null && previous !== next;
}

/**
 * Altas y cambios de jefe hechos en Orbit no pasan por este frontend: se
 * sondea `GET /api/org-chart/change-token` y, si la huella cambia, se
 * invalidan las queries del organigrama (todas las versiones) y las vacantes.
 */
export function useOrgChartChangeToken(enabled = true) {
  const queryClient = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);
  const { data } = useQuery({
    queryKey: orgQueryKeys.changeToken,
    queryFn: fetchOrgChartChangeToken,
    enabled,
    refetchInterval: ORG_CHART_CHANGE_TOKEN_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: ORG_CHART_CHANGE_TOKEN_POLL_MS * 3,
    retry: false,
  });
  const token = data?.token ?? null;

  useEffect(() => {
    if (!enabled || !token || token === ORG_CHART_CHANGE_TOKEN_UNAVAILABLE) {
      return;
    }
    const invalidate = shouldInvalidateOnChangeToken(lastTokenRef.current, token);
    lastTokenRef.current = token;
    if (!invalidate) return;

    for (const root of orgQueryKeys.allOrgData) {
      void queryClient.invalidateQueries({ queryKey: [root] });
    }
    void queryClient.invalidateQueries({ queryKey: orgQueryKeys.vacancies });
  }, [enabled, queryClient, token]);
}
