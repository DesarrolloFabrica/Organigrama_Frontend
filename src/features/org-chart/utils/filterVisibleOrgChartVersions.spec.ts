import { describe, expect, it } from "vitest";
import {
  filterVisibleOrgChartVersions,
  groupScopedOrgChartVersions,
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

const fabrica: OrgChartVersion = {
  ...base,
  id: 9,
  code: "fabrica-contenidos",
  name: "Fábrica de contenidos",
  isActive: false,
  isLocked: false,
  scopeType: "COORDINATION",
  scopeCode: "fabrica-contenidos",
  scopeLabel: "Fábrica de contenidos",
  scopeRootPersonId: 49,
};

describe("filterVisibleOrgChartVersions", () => {
  it("devuelve solo las versiones globales", () => {
    const versions = [active, historico, borrador, fabrica];
    expect(filterVisibleOrgChartVersions(versions)).toEqual([
      active,
      historico,
      borrador,
    ]);
  });
});

describe("groupScopedOrgChartVersions", () => {
  it("agrupa versiones independientes por coordinación", () => {
    expect(groupScopedOrgChartVersions([active, fabrica])).toEqual([
      {
        scopeCode: "fabrica-contenidos",
        scopeLabel: "Fábrica de contenidos",
        versions: [fabrica],
      },
    ]);
  });

  it("deja la vigente de Fábrica primero y el borrador oficial después", () => {
    const vigente: OrgChartVersion = {
      ...fabrica,
      id: 5,
      isActive: true,
    };
    const oficial: OrgChartVersion = {
      ...fabrica,
      id: 6,
      code: "fabrica-contenidos-oficial",
      name: "Fábrica de contenidos (oficial)",
      isActive: false,
    };

    expect(
      groupScopedOrgChartVersions([active, oficial, vigente]).map((group) =>
        group.versions.map((version) => version.id),
      ),
    ).toEqual([[5, 6]]);
  });

  it("no crea grupos si no hay versiones de coordinación", () => {
    expect(groupScopedOrgChartVersions([active, historico])).toEqual([]);
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
