import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartNodeVacancies } from "../../../features/org-chart/services/orgChartService";
import {
  useOrgChartRequestOptions,
  useOrgChartScopeVersionQueryId,
  useOrgChartVersionQueryId,
  useOrgChartVersionReady,
} from "../../../features/org-chart/context/OrgChartVersionContext";
import { orgQueryKeys } from "../queryKeys";

/**
 * Requisiciones de Orbit con el alcance del nodo seleccionado.
 *
 * A diferencia del resumen, NO usa `keepPreviousData`: al cambiar de nodo el
 * bloque pasa a «cargando» en lugar de mostrar el total del nodo anterior.
 * El token de cambio invalida esta clave por el prefijo `org-vacancies`.
 */
export function useOrgChartNodeVacancies(personId: string, enabled = true) {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  const requestOptions = useOrgChartRequestOptions();
  const versionReady = useOrgChartVersionReady();
  return useQuery({
    queryKey: orgQueryKeys.nodeVacancies(personId, versionId, scopeVersionId),
    queryFn: () =>
      fetchOrgChartNodeVacancies(
        personId,
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined,
      ),
    enabled: enabled && versionReady && Boolean(personId),
  });
}
