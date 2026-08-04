import { describe, expect, it } from "vitest";
import {
  canAutoRetryVideoError,
  entityDetailOverlayWidthClass,
  entityDetailOverlayWidthPx,
  resolveHasPresentation,
  shouldProbePersonVideo,
  shouldRefreshTicketOnEnter,
} from "./personPresentationRules";
import { resolveVisibleProfileModules } from "../components/profile-modules/usePersonProfileModules";

describe("personPresentationRules (Fase 4B)", () => {
  it("no consulta video para vista limitada / vacante / sin personId / panel cerrado", () => {
    expect(
      shouldProbePersonVideo({
        personId: "10",
        hasFullProfile: false,
        isVacancy: false,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        hasFullProfile: true,
        isVacancy: true,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: null,
        hasFullProfile: true,
        isVacancy: false,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        hasFullProfile: true,
        isVacancy: false,
        panelOpen: false,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        hasFullProfile: true,
        isVacancy: false,
        panelOpen: true,
      }),
    ).toBe(true);
  });

  it("Presentación no visible mientras carga ni con error de probe", () => {
    expect(
      resolveHasPresentation({
        probeEnabled: true,
        probeSuccess: false,
        hasVideo: undefined,
      }),
    ).toBe(false);
    expect(
      resolveHasPresentation({
        probeEnabled: true,
        probeSuccess: false,
        hasVideo: true,
      }),
    ).toBe(false);
  });

  it("Presentación aparece solo con hasVideo=true resuelto", () => {
    expect(
      resolveHasPresentation({
        probeEnabled: true,
        probeSuccess: true,
        hasVideo: true,
      }),
    ).toBe(true);
    expect(
      resolveHasPresentation({
        probeEnabled: true,
        probeSuccess: true,
        hasVideo: false,
      }),
    ).toBe(false);
  });

  it("orden 10/20/30 y no cambia active al aparecer (conserva activo válido)", () => {
    const without = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(without.map((m) => m.code)).toEqual(["ficha", "competencias"]);

    const withPres = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: true,
    });
    expect(withPres.map((m) => m.code)).toEqual([
      "ficha",
      "competencias",
      "presentacion",
    ]);
    expect(withPres.map((m) => m.order)).toEqual([10, 20, 30]);
  });

  it("ticket vigente se reutiliza; próximo a expirar se renueva", () => {
    const now = Date.parse("2026-08-03T18:00:00.000Z");
    expect(
      shouldRefreshTicketOnEnter("2026-08-03T18:02:00.000Z", 15, now),
    ).toBe(false);
    expect(
      shouldRefreshTicketOnEnter("2026-08-03T18:00:10.000Z", 15, now),
    ).toBe(true);
    expect(shouldRefreshTicketOnEnter(null)).toBe(true);
  });

  it("máximo un reintento automático", () => {
    expect(canAutoRetryVideoError(false)).toBe(true);
    expect(canAutoRetryVideoError(true)).toBe(false);
  });

  it("panel se ensancha en desktop con Presentación; base 420", () => {
    expect(entityDetailOverlayWidthPx("ficha")).toBe(420);
    expect(entityDetailOverlayWidthPx("competencias")).toBe(420);
    expect(entityDetailOverlayWidthPx("presentacion")).toBe(600);
    expect(entityDetailOverlayWidthPx(null)).toBe(420);
    expect(entityDetailOverlayWidthClass("presentacion")).toContain("600");
    expect(entityDetailOverlayWidthClass("ficha")).toContain("420");
  });
});
