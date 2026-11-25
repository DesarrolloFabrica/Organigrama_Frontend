import { describe, expect, it } from "vitest";
import { orgQueryKeys } from "../../../lib/react-query/queryKeys";
import type { OrgChartNodeVacancyListResponse, OrgChartVacancy } from "../types";
import {
  buildNodeVacanciesPath,
  formatVacancyTotals,
  resolveNodeVacancyPanelState,
  summarizeVacancies,
} from "./orgChartNodeVacancies";

function vacancy(id: number, quantity: number | null): OrgChartVacancy {
  return {
    id,
    areaId: 100,
    schoolId: null,
    programId: null,
    positionName: `Cargo ${id}`,
    curricularLine: null,
    quantity,
    operationStatus: "requisition_sent",
    createdAt: null,
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
      areaName: kind === "coordination" ? "AREA A" : null,
    },
  };
}

describe("buildNodeVacanciesPath", () => {
  it("envía el nodo y, si existen, la versión y el overlay", () => {
    expect(buildNodeVacanciesPath("1081")).toBe(
      "/api/org-chart/vacancies?personId=1081",
    );
    expect(
      buildNodeVacanciesPath("1081", { versionId: 4, scopeVersionId: "none" }),
    ).toBe("/api/org-chart/vacancies?personId=1081&versionId=4&scopeVersionId=none");
  });

  it("no envía relationId: el alcance es por persona", () => {
    expect(
      buildNodeVacanciesPath("20", { versionId: 4, relationId: 77 }),
    ).toBe("/api/org-chart/vacancies?personId=20&versionId=4");
  });

  it("codifica el id (una clave visual no se cuela como parámetro extra)", () => {
    expect(buildNodeVacanciesPath("20&x=1")).toBe(
      "/api/org-chart/vacancies?personId=20%26x%3D1",
    );
  });
});

describe("orgQueryKeys.nodeVacancies", () => {
  it("cambia con el nodo, la versión y el overlay", () => {
    const a = orgQueryKeys.nodeVacancies("20", 4, 9);
    expect(orgQueryKeys.nodeVacancies("21", 4, 9)).not.toEqual(a);
    expect(orgQueryKeys.nodeVacancies("20", 5, 9)).not.toEqual(a);
    expect(orgQueryKeys.nodeVacancies("20", 4, "none")).not.toEqual(a);
  });

  it("comparte el prefijo que invalida el token de cambio de Orbit", () => {
    expect(orgQueryKeys.nodeVacancies("20", 4)[0]).toBe(
      orgQueryKeys.vacancies[0],
    );
  });
});

describe("summarizeVacancies / formatVacancyTotals", () => {
  it("cuenta filas y suma quantity (nula = 0)", () => {
    const totals = summarizeVacancies([
      vacancy(1, 3),
      vacancy(2, 1),
      vacancy(3, null),
    ]);
    expect(totals).toEqual({ requisitions: 3, positions: 4 });
    expect(formatVacancyTotals(totals)).toBe(
      "4 plazas solicitadas · 3 requisiciones",
    );
  });

  it("usa singular y maneja la lista vacía", () => {
    expect(formatVacancyTotals(summarizeVacancies([vacancy(1, 1)]))).toBe(
      "1 plaza solicitada · 1 requisición",
    );
    expect(formatVacancyTotals(summarizeVacancies([]))).toBe(
      "0 plazas solicitadas · 0 requisiciones",
    );
  });

  it("plazas y requisiciones difieren cuando hay quantity > 1", () => {
    // Caso de la QA: raíz 9 filas / 15 plazas; Especializaciones 2 / 4.
    const totals = summarizeVacancies([vacancy(1, 3), vacancy(2, 1)]);
    expect(totals.positions).not.toBe(totals.requisitions);
    expect(formatVacancyTotals(totals)).toBe(
      "4 plazas solicitadas · 2 requisiciones",
    );
  });
});

describe("resolveNodeVacancyPanelState", () => {
  it("raíz y coordinación → listo, con totales de la misma lista", () => {
    const items = [vacancy(1, 3), vacancy(2, 2)];
    const state = resolveNodeVacancyPanelState({
      personId: "20",
      data: response("20", "coordination", items),
      isError: false,
    });
    expect(state).toMatchObject({
      kind: "ready",
      items,
      totals: { requisitions: 2, positions: 5 },
    });
    expect(
      resolveNodeVacancyPanelState({
        personId: "1144",
        data: response("1144", "global", items),
        isError: false,
      }).kind,
    ).toBe("ready");
  });

  it("nodo sin regla de asignación → oculto", () => {
    expect(
      resolveNodeVacancyPanelState({
        personId: "21",
        data: response("21", "none"),
        isError: false,
      }),
    ).toEqual({ kind: "hidden" });
  });

  it("nunca muestra la respuesta de otro nodo mientras carga el nuevo", () => {
    expect(
      resolveNodeVacancyPanelState({
        personId: "30",
        data: response("1144", "global", [vacancy(1, 1)]),
        isError: false,
      }),
    ).toEqual({ kind: "loading" });
    expect(
      resolveNodeVacancyPanelState({
        personId: "30",
        data: undefined,
        isError: false,
      }),
    ).toEqual({ kind: "loading" });
  });

  it("error (400/404) → error, sin caer a la lista global", () => {
    expect(
      resolveNodeVacancyPanelState({
        personId: "999",
        data: undefined,
        isError: true,
        error: new Error("HTTP 404"),
      }),
    ).toEqual({ kind: "error", message: "HTTP 404" });
  });
});
