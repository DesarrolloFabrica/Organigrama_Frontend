import type { OrgChartVacancy } from "../types";
import {
  formatVacancyTotals,
  type NodeVacancyPanelState,
} from "./orgChartNodeVacancies";

/**
 * Tarjeta de una requisición de Orbit (`vacancies.vacancy`, requisition_sent)
 * dibujada en el mapa bajo el equipo de una coordinación.
 *
 * Es un elemento de visualización: no es un nodo del árbol, no tiene ficha de
 * persona y no altera los conteos de personas, equipos ni «vac.».
 */
export type OrbitRequisitionCardModel = {
  /** Clave estable de React: el identificador de la requisición. */
  key: string;
  requisitionId: number;
  positionName: string;
  /** Programa; si Orbit no lo trae, la línea curricular. */
  programName: string | null;
  quantity: number | null;
  /** «1 plaza solicitada» / «N plazas solicitadas»; null sin cantidad. */
  quantityLabel: string | null;
};

const FALLBACK_POSITION = "Cargo sin nombre";

/** «1 plaza solicitada» / «3 plazas solicitadas»; null si no hay cantidad válida. */
export function formatRequestedPositions(
  quantity: number | null | undefined,
): string | null {
  const value = Number(quantity);
  if (quantity == null || !Number.isFinite(value) || value <= 0) return null;
  return value === 1 ? "1 plaza solicitada" : `${value} plazas solicitadas`;
}

function toCard(vacancy: OrgChartVacancy): OrbitRequisitionCardModel {
  const quantity =
    vacancy.quantity == null || !Number.isFinite(Number(vacancy.quantity))
      ? null
      : Number(vacancy.quantity);
  return {
    key: `orbit-requisition:${vacancy.id}`,
    requisitionId: vacancy.id,
    positionName: vacancy.positionName?.trim() || FALLBACK_POSITION,
    programName:
      vacancy.programName?.trim() || vacancy.curricularLine?.trim() || null,
    quantity,
    quantityLabel: formatRequestedPositions(quantity),
  };
}

/**
 * Tarjetas para el mapa a partir del MISMO estado que usa el resumen.
 *
 * Solo hay tarjetas cuando la respuesta corresponde al nodo actual (lo
 * garantiza `resolveNodeVacancyPanelState`), su alcance es una coordinación y
 * trae requisiciones. La raíz (alcance global), los nodos sin regla, la carga
 * y los errores no dibujan sección en el mapa.
 */
export function buildOrbitRequisitionCards(
  state: NodeVacancyPanelState,
): OrbitRequisitionCardModel[] {
  if (state.kind !== "ready" || state.scope.kind !== "coordination") return [];
  return state.items.map(toCard);
}

/** «Y plazas solicitadas · X requisiciones» de las tarjetas visibles. */
export function formatOrbitRequisitionCardsTotals(
  cards: readonly OrbitRequisitionCardModel[],
): string {
  const positions = cards.reduce(
    (acc, card) => acc + (card.quantity != null && card.quantity > 0 ? card.quantity : 0),
    0,
  );
  return formatVacancyTotals({ requisitions: cards.length, positions });
}
