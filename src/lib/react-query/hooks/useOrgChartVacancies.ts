import { useQuery } from "@tanstack/react-query";
import { fetchOrgChartVacancies } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

/**
 * Vacantes reales del schema `vacancies` (solo `operation_status = requisition_sent`).
 *
 * Consulta complementaria: no depende de la versión del organigrama ni de un
 * nodo concreto; solo alimenta el bloque "Vacantes" del panel lateral.
 */
export function useOrgChartVacancies(enabled = true) {
  return useQuery({
    queryKey: orgQueryKeys.vacancies,
    queryFn: fetchOrgChartVacancies,
    enabled,
  });
}
