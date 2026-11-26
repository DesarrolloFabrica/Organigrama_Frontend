import { describe, expect, it } from "vitest";
import type { OrgChartNodeVacancyListResponse, OrgChartVacancy } from "../types";
import { resolveNodeVacancyPanelState } from "./orgChartNodeVacancies";
import {
  buildOrbitRequisitionCards,
  formatOrbitRequisitionCardsTotals,
  formatRequestedPositions,
} from "./orgMapOrbitRequisitions";

function vacancy(
  id: number,
  quantity: number | null,
  extra: Partial<OrgChartVacancy> = {},
): OrgChartVacancy {
  return {
    id,
    areaId: 9005,
    schoolId: null,
    programId: null,
    positionName: `Cargo ${id}`,
    curricularLine: null,
    quantity,
    operationStatus: "requisition_sent",
    createdAt: null,
    ...extra,
  };
}

function response(
  personId: string,
  kind: "global" | "coordination" | "none",
  items: OrgChartVacancy[] = [],
): OrgChartNodeVacancyListResponse {
  return {
    items,
    scope: {
      kind,
      personId,
      areaName: kind === "coordination" ? "ESPECIALIZACIONES" : null,
    },
  };
}

function cardsFor(
  personId: string,
  data: OrgChartNodeVacancyListResponse | undefined,
  isError = false,
) {
  return buildOrbitRequisitionCards(
    resolveNodeVacancyPanelState({ personId, data, isError }),
  );
}

describe("formatRequestedPositions", () => {
  it("usa singular y plural", () => {
    expect(formatRequestedPositions(1)).toBe("1 plaza solicitada");
    expect(formatRequestedPositions(3)).toBe("3 plazas solicitadas");
  });

  it("omite cantidades nulas o no positivas", () => {
    expect(formatRequestedPositions(null)).toBeNull();
    expect(formatRequestedPositions(undefined)).toBeNull();
    expect(formatRequestedPositions(0)).toBeNull();
  });
});

describe("buildOrbitRequisitionCards", () => {
  it("una tarjeta por requisición de la coordinación, con su id como clave", () => {
    const cards = cardsFor(
      "900155",
      response("900155", "coordination", [
        vacancy(9901, 3, { programName: "Programa QA", curricularLine: "Línea" }),
        vacancy(9902, 1),
      ]),
    );
    expect(cards).toEqual([
      {
        key: "orbit-requisition:9901",
        requisitionId: 9901,
        positionName: "Cargo 9901",
        programName: "Programa QA",
        quantity: 3,
        quantityLabel: "3 plazas solicitadas",
      },
      {
        key: "orbit-requisition:9902",
        requisitionId: 9902,
        positionName: "Cargo 9902",
        programName: null,
        quantity: 1,
        quantityLabel: "1 plaza solicitada",
      },
    ]);
    expect(formatOrbitRequisitionCardsTotals(cards)).toBe(
      "4 plazas solicitadas · 2 requisiciones",
    );
  });

  it("sin programa usa la línea curricular y sin cargo un texto genérico", () => {
    const [card] = cardsFor(
      "900155",
      response("900155", "coordination", [
        vacancy(1, 2, { positionName: "  ", curricularLine: "Transformación Digital" }),
      ]),
    );
    expect(card?.positionName).toBe("Cargo sin nombre");
    expect(card?.programName).toBe("Transformación Digital");
  });

  it("no dibuja sección para la raíz (alcance global)", () => {
    expect(
      cardsFor("1144", response("1144", "global", [vacancy(1, 1)])),
    ).toEqual([]);
  });

  it("no dibuja sección para nodos sin regla, coordinaciones vacías ni errores", () => {
    expect(cardsFor("900156", response("900156", "none"))).toEqual([]);
    expect(cardsFor("900184", response("900184", "coordination", []))).toEqual([]);
    expect(cardsFor("900155", undefined, true)).toEqual([]);
  });

  it("no arrastra las tarjetas de la selección anterior", () => {
    // Mientras llega la respuesta del nuevo nodo, la anterior no se pinta.
    expect(
      cardsFor("900165", response("900155", "coordination", [vacancy(1, 1)])),
    ).toEqual([]);
    expect(cardsFor("900165", undefined)).toEqual([]);
  });
});
