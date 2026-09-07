import { describe, expect, it } from "vitest";
import {
  buildTeamExploreNavState,
  readOrgTeamNavState,
  resolveTeamBackNavigation,
} from "./orgChartTeamNavigation";

const generalIdentity = {
  icon: "/general.png",
  label: "Coordinación General",
  glowColor: "245 158 11",
  highlightColor: "254 243 199",
};

const developmentIdentity = {
  icon: "/development.png",
  label: "Fábrica · Desarrollo",
  glowColor: "79 70 229",
  highlightColor: "224 231 255",
};

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

  it("guarda la paleta del nodo central al entrar desde /org", () => {
    expect(
      buildTeamExploreNavState({
        currentPersonId: null,
        rootReturnIdentity: generalIdentity,
      }),
    ).toEqual({
      breadcrumb: [],
      rootReturnIdentity: generalIdentity,
    });
  });

  it("restaura la paleta del nodo padre al volver", () => {
    const navState = buildTeamExploreNavState({
      currentPersonId: "general-lead",
      navState: {
        breadcrumb: [],
        rootReturnIdentity: generalIdentity,
      },
      currentIdentity: generalIdentity,
    });

    expect(resolveTeamBackNavigation({ navState })).toEqual({
      path: "/org/team/general-lead",
      state: {
        breadcrumb: [],
        paletteTrail: [],
        rootReturnIdentity: generalIdentity,
      },
      backgroundIdentity: generalIdentity,
    });
  });

  it("al volver a /org recupera la paleta previa a la exploración", () => {
    expect(
      resolveTeamBackNavigation({
        navState: {
          breadcrumb: [],
          rootReturnIdentity: developmentIdentity,
        },
      }),
    ).toEqual({
      path: "/org",
      backgroundIdentity: developmentIdentity,
    });
  });

  it("valida también las identidades almacenadas", () => {
    expect(
      readOrgTeamNavState({
        breadcrumb: ["general-lead"],
        paletteTrail: [generalIdentity],
        rootReturnIdentity: developmentIdentity,
      }),
    ).toEqual({
      breadcrumb: ["general-lead"],
      paletteTrail: [generalIdentity],
      rootReturnIdentity: developmentIdentity,
    });
    expect(
      readOrgTeamNavState({
        breadcrumb: ["general-lead"],
        paletteTrail: [],
      }),
    ).toBeUndefined();
  });
});
