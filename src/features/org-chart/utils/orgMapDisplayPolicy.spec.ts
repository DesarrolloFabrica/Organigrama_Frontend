import { describe, expect, it } from "vitest";
import type { OrgNode } from "../types";
import {
  getEffectiveDirectReportsCount,
  resolveTeamNavigation,
  shouldOfferTeamExplorationLink,
  shouldRenderInternalTeamHub,
} from "./orgMapDisplayPolicy";

function nodeWithReports(
  count: number,
  extra: Partial<OrgNode> = {},
): OrgNode {
  return {
    id: "n1",
    name: "Test",
    nodeKind: "person",
    direct_reports_count: count,
    children: [],
    ...extra,
  } as OrgNode;
}

describe("resolveTeamNavigation", () => {
  it("raíz con ≤5 reportes expande fila horizontal en el mapa", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(5), { isCanvasRoot: true }),
    ).toBe("expandHorizontalTree");
  });

  it("raíz con 6–15 reportes abre hub interno", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(8), { isCanvasRoot: true }),
    ).toBe("expandTeamBox");
  });

  it("raíz con >15 reportes navega a lista dedicada", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(28), { isCanvasRoot: true }),
    ).toBe("navigateToTeamPage");
  });

  it("fila 2 con ≤5 reportes abre hub en el mapa (no redirige)", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(5), { isCanvasRoot: false }),
    ).toBe("expandTeamBox");
  });

  it("fila 2 con 6–15 reportes abre hub en el mapa", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(10), { isCanvasRoot: false }),
    ).toBe("expandTeamBox");
  });

  it("fila 2 con >15 reportes navega a lista", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(28), { isCanvasRoot: false }),
    ).toBe("navigateToTeamPage");
  });

  it("deferred_team con ≤15 no redirige: abre hub", () => {
    expect(
      resolveTeamNavigation(nodeWithReports(6, { deferred_team: true }), {
        isCanvasRoot: false,
      }),
    ).toBe("expandTeamBox");
  });
});

describe("getEffectiveDirectReportsCount", () => {
  it("prioriza hijos cargados sobre contador de API", () => {
    const node = nodeWithReports(28, {
      children: [{ id: "c1" }, { id: "c2" }, { id: "c3" }] as OrgNode[],
    });
    expect(getEffectiveDirectReportsCount(node)).toBe(3);
  });
});

describe("shouldRenderInternalTeamHub", () => {
  it("incluye equipos pequeños en fila 2", () => {
    expect(shouldRenderInternalTeamHub(nodeWithReports(5))).toBe(true);
    expect(shouldRenderInternalTeamHub(nodeWithReports(15))).toBe(true);
    expect(shouldRenderInternalTeamHub(nodeWithReports(16))).toBe(false);
  });
});

describe("shouldOfferTeamExplorationLink", () => {
  it("ofrece enlace para cualquier nodo con reportes directos", () => {
    expect(shouldOfferTeamExplorationLink(nodeWithReports(3))).toBe(true);
    expect(shouldOfferTeamExplorationLink(nodeWithReports(8))).toBe(true);
    expect(shouldOfferTeamExplorationLink(nodeWithReports(28))).toBe(true);
    expect(shouldOfferTeamExplorationLink(nodeWithReports(0))).toBe(false);
  });

  it("incluye nodos deferred_team sin hijos cargados", () => {
    expect(
      shouldOfferTeamExplorationLink(
        nodeWithReports(0, { deferred_team: true }),
      ),
    ).toBe(true);
  });
});
