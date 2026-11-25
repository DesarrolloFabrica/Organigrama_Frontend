import type {
  OrgChartNodeVacancyListResponse,
  OrgChartVacancy,
  OrgChartVacancyScope,
} from "../types";
import type { OrgChartRequestOptions } from "../types/orgChartVersion";
import { buildVersionQuery } from "./orgChartVersionQuery";

/**
 * Ruta de las requisiciones de Orbit para un nodo del panel de resumen.
 *
 * Lleva la versión y el overlay que ve el usuario: el backend resuelve si el
 * nodo es la raíz, una cabeza de coordinación u otro nodo sobre ese mismo
 * mapa. `relationId` no aplica (el alcance es por persona) y no se envía.
 */
export function buildNodeVacanciesPath(
  personId: string,
  options?: OrgChartRequestOptions,
): string {
  const base = `/api/org-chart/vacancies?personId=${encodeURIComponent(personId)}`;
  return buildVersionQuery(base, {
    versionId: options?.versionId,
    scopeVersionId: options?.scopeVersionId,
  });
}

export type VacancyTotals = {
  /** Filas de `vacancies.vacancy` (requisiciones). */
  requisitions: number;
  /** Suma de `quantity` (plazas solicitadas); una cantidad nula suma 0. */
  positions: number;
};

/** Totales calculados de la MISMA lista que se renderiza en el detalle. */
export function summarizeVacancies(
  items: readonly OrgChartVacancy[],
): VacancyTotals {
  let positions = 0;
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (Number.isFinite(quantity) && quantity > 0) positions += quantity;
  }
  return { requisitions: items.length, positions };
}

/**
 * Detalle del bloque: «Y plazas solicitadas · X requisiciones», en el mismo
 * orden que el indicador (plazas primero, como «solic.» en Orbit) y con
 * singular cuando corresponde. X = filas de la lista.
 */
export function formatVacancyTotals({
  requisitions,
  positions,
}: VacancyTotals): string {
  const p = positions === 1 ? "plaza solicitada" : "plazas solicitadas";
  const r = requisitions === 1 ? "requisición" : "requisiciones";
  return `${positions} ${p} · ${requisitions} ${r}`;
}

export type NodeVacancyPanelState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  /** Nodo sin regla de asignación: el panel omite indicador y lista. */
  | { kind: "hidden" }
  | {
      kind: "ready";
      scope: OrgChartVacancyScope;
      items: OrgChartVacancy[];
      totals: VacancyTotals;
    };

/**
 * Estado del bloque de requisiciones para el nodo seleccionado.
 *
 * Solo se muestra una respuesta cuyo `scope.personId` es el nodo actual: así
 * el panel nunca pinta, ni por un instante, el total de otro nodo (por
 * ejemplo, si una respuesta anterior quedara como dato de reserva).
 */
export function resolveNodeVacancyPanelState(input: {
  personId: string;
  data: OrgChartNodeVacancyListResponse | undefined;
  isError: boolean;
  error?: unknown;
}): NodeVacancyPanelState {
  const { personId, data, isError, error } = input;
  if (isError) {
    return {
      kind: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las requisiciones",
    };
  }
  if (!data || data.scope?.personId !== personId) return { kind: "loading" };
  if (data.scope.kind === "none") return { kind: "hidden" };
  const items = data.items ?? [];
  return {
    kind: "ready",
    scope: data.scope,
    items,
    totals: summarizeVacancies(items),
  };
}
