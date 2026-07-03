import { describe, expect, it } from "vitest";
import {
  filterVisibleOrgChartVersions,
  orgChartVersionSelectorLabel,
} from "./filterVisibleOrgChartVersions";
import type { OrgChartVersion } from "../types/orgChartVersion";

const base = {
  description: null,
  periodLabel: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const active: OrgChartVersion = {
  ...base,
  id: 4,
  code: "periodo-agosto-2026",
  name: "Versión actual",
  isActive: true,
  isLocked: true,
};

const historico: OrgChartVersion = {
  ...base,
  id: 3,
  code: "historico-febrero-junio-2026",
  name: "Histórico febrero - junio 2026",
  isActive: false,
  isLocked: true,
};

const borrador: OrgChartVersion = {
  ...base,
  id: 5,
  code: "borrador-nueva-plantilla",
  name: "Borrador nueva plantilla",
  isActive: false,
  isLocked: false,
};

describe("filterVisibleOrgChartVersions", () => {
  it("devuelve todas las versiones recibidas del backend", () => {
    const versions = [active, historico, borrador];
    expect(filterVisibleOrgChartVersions(versions)).toEqual(versions);
  });
});

describe("orgChartVersionSelectorLabel", () => {
  it("marca la activa como vigente", () => {
    expect(orgChartVersionSelectorLabel(active)).toBe("Versión actual (vigente)");
  });

  it("marca locked inactiva como histórico", () => {
    expect(orgChartVersionSelectorLabel(historico)).toBe(
      "Histórico febrero - junio 2026 (histórico)",
    );
  });

  it("marca borrador desbloqueado", () => {
    expect(orgChartVersionSelectorLabel(borrador)).toBe(
      "Borrador nueva plantilla (borrador)",
    );
  });
});
