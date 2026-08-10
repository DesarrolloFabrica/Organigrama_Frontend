import { describe, expect, it } from "vitest";
import {
  canAutoRetryVideoError,
  entityDetailOverlayWidthClass,
  entityDetailOverlayWidthPx,
  resolveHasPresentation,
  shouldProbePersonVideo,
  shouldRefreshTicketOnEnter,
} from "./personPresentationRules";
import {
  firstAvailableModule,
  resolveActiveProfileModule,
  resolveVisibleProfileModules,
} from "../components/profile-modules/usePersonProfileModules";

describe("personPresentationRules (visibilidad global autenticada)", () => {
  it("probe sin exigir hasFullProfile; bloquea vacante / sin personId / panel cerrado", () => {
    expect(
      shouldProbePersonVideo({
        personId: "10",
        isVacancy: false,
      }),
    ).toBe(true);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        hasFullProfile: false,
        isVacancy: false,
      }),
    ).toBe(true);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        isVacancy: true,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: null,
        isVacancy: false,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: "10",
        isVacancy: false,
        panelOpen: false,
      }),
    ).toBe(false);
    expect(
      shouldProbePersonVideo({
        personId: "10",
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

  it("vista limitada + video: Presentación en módulos; sin competencias", () => {
    const limited = resolveVisibleProfileModules({
      hasFullProfile: false,
      isVacancy: false,
      hasPresentation: true,
    });
    expect(limited.map((m) => m.code)).toEqual(["ficha", "presentacion"]);
    expect(firstAvailableModule(limited)).toBe("ficha");
  });

  it("vista limitada + sin video: solo ficha (sin tablist vacío)", () => {
    const limited = resolveVisibleProfileModules({
      hasFullProfile: false,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(limited.map((m) => m.code)).toEqual(["ficha"]);
  });

  it("aparición tardía de Presentación no mueve active válido", () => {
    const without = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(without.map((m) => m.code)).toEqual(["ficha", "competencias"]);
    expect(resolveActiveProfileModule("ficha", without)).toBe("ficha");

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
    expect(resolveActiveProfileModule("ficha", withPres)).toBe("ficha");
    expect(resolveActiveProfileModule("competencias", withPres)).toBe(
      "competencias",
    );
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
