import { describe, expect, it } from "vitest";
import { filterVisibleOrgChartVersions } from "./filterVisibleOrgChartVersions";
import type { OrgChartVersion } from "../types/orgChartVersion";

const base = {
  description: null,
  periodLabel: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const active: OrgChartVersion = {
  ...base,
  id: 3,
  code: "periodo-febrero-junio-2026",
  name: "Periodo febrero - junio 2026",
  isActive: true,
  isLocked: true,
};

const borrador: OrgChartVersion = {
  ...base,
  id: 4,
  code: "borrador-nueva-plantilla",
  name: "Borrador nueva plantilla",
  isActive: false,
  isLocked: false,
};

const historico: OrgChartVersion = {
  ...base,
  id: 1,
  code: "current",
  name: "Current",
  isActive: false,
  isLocked: true,
};

describe("filterVisibleOrgChartVersions", () => {
  it("muestra activa y borrador por defecto", () => {
    expect(filterVisibleOrgChartVersions([active, borrador, historico])).toEqual([
      active,
      borrador,
    ]);
  });

  it("oculta históricos locked sin showAdvancedHistorical", () => {
    expect(filterVisibleOrgChartVersions([historico])).toEqual([]);
  });

  it("muestra históricos con showAdvancedHistorical", () => {
    expect(
      filterVisibleOrgChartVersions([historico], { showAdvancedHistorical: true }),
    ).toEqual([historico]);
  });
});
