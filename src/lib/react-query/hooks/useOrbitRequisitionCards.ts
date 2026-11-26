import { useMemo } from "react";

import { resolveNodeVacancyPanelState } from "../../../features/org-chart/utils/orgChartNodeVacancies";
import {
  buildOrbitRequisitionCards,
  type OrbitRequisitionCardModel,
} from "../../../features/org-chart/utils/orgMapOrbitRequisitions";
import { useOrgChartNodeVacancies } from "./useOrgChartNodeVacancies";

/**
 * Requisiciones de Orbit de la coordinación `personId` como tarjetas del mapa.
 *
 * Reutiliza la consulta del resumen (`useOrgChartNodeVacancies`): misma clave
 * (persona, versión, overlay), mismo alcance del backend e invalidación por el
 * token de cambio de Orbit. Si el resumen ya la pidió, sale de la caché.
 */
export function useOrbitRequisitionCards(
  personId: string,
  enabled = true,
): OrbitRequisitionCardModel[] {
  const { data, isError, error } = useOrgChartNodeVacancies(personId, enabled);
  return useMemo(() => {
    if (!enabled) return [];
    return buildOrbitRequisitionCards(
      resolveNodeVacancyPanelState({ personId, data, isError, error }),
    );
  }, [data, enabled, error, isError, personId]);
}
