import { describe, expect, it } from "vitest";
import type { OrgChartVersion } from "../types/orgChartVersion";
import { groupScopedOrgChartVersions } from "./filterVisibleOrgChartVersions";
import {
  filterVisibleScopedVersionGroups,
  isOrgChartTeamExplorePath,
  isScopedVersionGroupVisible,
  teamPersonIdFromPathname,
} from "./scopedOrgChartVersionView";

const fabrica: OrgChartVersion = {
  id: 5,
  code: "fabrica-contenidos",
  name: "Fábrica de contenidos",
  description: null,
  periodLabel: "Actual",
  isActive: true,
  isLocked: false,
  scopeType: "COORDINATION",
  scopeCode: "fabrica-contenidos",
  scopeLabel: "Fábrica de contenidos",
  scopeRootPersonId: 49,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const groups = groupScopedOrgChartVersions([fabrica]);
const fabricaGroup = groups[0]!;

describe("isOrgChartTeamExplorePath", () => {
  it("reconoce las rutas de equipo", () => {
    expect(isOrgChartTeamExplorePath("/org/team/49")).toBe(true);
    expect(isOrgChartTeamExplorePath("/org-chart/team/49")).toBe(true);
    expect(isOrgChartTeamExplorePath("/org")).toBe(false);
    expect(isOrgChartTeamExplorePath("/org/competency-explorer")).toBe(false);
  });
});

describe("teamPersonIdFromPathname", () => {
  it("lee el id de la ruta de equipo", () => {
    expect(teamPersonIdFromPathname("/org/team/49")).toBe("49");
    expect(teamPersonIdFromPathname("/org")).toBeUndefined();
  });
});

describe("isScopedVersionGroupVisible", () => {
  it("no muestra Fábrica en el organigrama global", () => {
    expect(
      isScopedVersionGroupVisible(fabricaGroup, {
        pathname: "/org",
        personId: "49",
        flowIdentityLabel: "Fábrica y Desarrollo",
      }),
    ).toBe(false);
  });

  it("muestra Fábrica en el equipo del coordinador", () => {
    expect(
      isScopedVersionGroupVisible(fabricaGroup, {
        pathname: "/org/team/49",
        personId: "49",
      }),
    ).toBe(true);
  });

  it("muestra Fábrica si el coordinador está en el breadcrumb", () => {
    expect(
      isScopedVersionGroupVisible(fabricaGroup, {
        pathname: "/org/team/1200",
        personId: "1200",
        breadcrumb: ["10", "49"],
      }),
    ).toBe(true);
  });

  it("muestra Fábrica si la identidad de flujo es de esa coordinación", () => {
    expect(
      isScopedVersionGroupVisible(fabricaGroup, {
        pathname: "/org/team/88",
        personId: "88",
        flowIdentityLabel: "Fábrica · Desarrollo",
      }),
    ).toBe(true);
  });

  it("no muestra Fábrica en otra coordinación", () => {
    expect(
      isScopedVersionGroupVisible(fabricaGroup, {
        pathname: "/org/team/1077",
        personId: "1077",
        flowIdentityLabel: "Operación Académica",
      }),
    ).toBe(false);
  });
});

describe("filterVisibleScopedVersionGroups", () => {
  it("oculta el grupo fuera de Fábrica", () => {
    expect(
      filterVisibleScopedVersionGroups(groups, {
        pathname: "/org",
      }),
    ).toEqual([]);
  });
});
