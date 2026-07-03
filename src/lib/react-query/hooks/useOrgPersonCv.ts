import { useQuery } from "@tanstack/react-query";
import { getPersonCv } from "../../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "../queryKeys";

/**
 * Consulta el estado de la hoja de vida (CV) de una persona.
 *
 * - La query depende del `personId`.
 * - Queda deshabilitada si no hay `personId` (no dispara petición).
 * - El JWT se adjunta automáticamente vía el cliente HTTP del proyecto.
 */
export function useOrgPersonCv(personId: string | null, enabled = true) {
  return useQuery({
    queryKey: orgQueryKeys.personCv(personId ?? ""),
    // El backend espera un número; convertimos el id de la persona.
    queryFn: () => getPersonCv(Number(personId)),
    enabled: Boolean(personId) && enabled,
  });
}
