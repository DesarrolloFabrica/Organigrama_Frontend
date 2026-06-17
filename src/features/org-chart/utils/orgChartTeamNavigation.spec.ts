import { describe, expect, it } from "vitest";
import {
  buildTeamExploreNavState,
  readOrgTeamNavState,
  resolveTeamBackNavigation,
} from "./orgChartTeamNavigation";

describe("orgChartTeamNavigation", () => {
  it("desde /org abre equipo sin ancestros", () => {
    expect(buildTeamExploreNavState({ currentPersonId: null })).toEqual({
      breadcrumb: [],
    });
  });

  it("desde un equipo añade el nodo actual al breadcrumb", () => {
    expect(
      buildTeamExploreNavState({
        currentPersonId: "raul",
        navState: { breadcrumb: [] },
      }),
    ).toEqual({ breadcrumb: ["raul"] });
  });

  it("propaga breadcrumb en profundidad", () => {
    expect(
      buildTeamExploreNavState({
        currentPersonId: "haider",
        navState: { breadcrumb: ["raul"] },
      }),
    ).toEqual({ breadcrumb: ["raul", "haider"] });
  });

  it("volver sin breadcrumb regresa al organigrama principal", () => {
    expect(resolveTeamBackNavigation({ navState: { breadcrumb: [] } })).toEqual({
      path: "/org",
    });
  });

  it("volver con breadcrumb regresa al padre inmediato", () => {
    expect(
      resolveTeamBackNavigation({ navState: { breadcrumb: ["raul"] } }),
    ).toEqual({
      path: "/org/team/raul",
      state: { breadcrumb: [] },
    });
  });

  it("volver en profundidad 3 restaura breadcrumb del padre", () => {
    expect(
      resolveTeamBackNavigation({
        navState: { breadcrumb: ["raul", "haider"] },
      }),
    ).toEqual({
      path: "/org/team/haider",
      state: { breadcrumb: ["raul"] },
    });
  });

  it("valida estado de router", () => {
    expect(readOrgTeamNavState({ breadcrumb: ["a"] })).toEqual({
      breadcrumb: ["a"],
    });
    expect(readOrgTeamNavState({ breadcrumb: [1] })).toBeUndefined();
    expect(readOrgTeamNavState(null)).toBeUndefined();
  });
});
