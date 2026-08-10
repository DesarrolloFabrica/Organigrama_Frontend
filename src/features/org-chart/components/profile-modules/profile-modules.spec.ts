import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROFILE_MODULE,
  PERSON_PROFILE_MODULE_DEFINITIONS,
  PROFILE_MODULE_ORDER,
  type ProfileModuleCode,
  type ProfileModuleDefinition,
  type ProfileModuleVisibilityContext,
} from "./profile-module.types";
import {
  fallbackToAvailableModule,
  firstAvailableModule,
  profileModulesShowTablist,
  resolveActiveProfileModule,
  resolveVisibleProfileModules,
} from "./usePersonProfileModules";

describe("profile modules registry (visibilidad Presentación autenticada)", () => {
  it("admite presentacion en el tipo/contrato de orden 10/20/30", () => {
    const codes: ProfileModuleCode[] = [
      "ficha",
      "competencias",
      "presentacion",
    ];
    expect(codes).toContain("presentacion");
    expect(PROFILE_MODULE_ORDER.presentacion).toBe(30);
    expect(PROFILE_MODULE_ORDER.ficha).toBe(10);
    expect(PROFILE_MODULE_ORDER.competencias).toBe(20);
  });

  it("Presentación está en el registro con lazyLoad y unmountOnExit", () => {
    const pres = PERSON_PROFILE_MODULE_DEFINITIONS.find(
      (d) => d.code === "presentacion",
    )!;
    expect(pres).toBeTruthy();
    expect(pres.label).toBe("Presentación");
    expect(pres.order).toBe(30);
    expect(pres.lazyLoad).toBe(true);
    expect(pres.unmountOnExit).toBe(true);
    expect(pres.tabId).toBe("person-tab-presentacion");
    expect(pres.panelId).toBe("person-panel-presentacion");
  });

  it("vista completa + video: Ficha, Competencias y Presentación", () => {
    const ctx: ProfileModuleVisibilityContext = {
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: true,
    };
    const visible = resolveVisibleProfileModules(ctx);
    expect(visible.map((m) => m.code)).toEqual([
      "ficha",
      "competencias",
      "presentacion",
    ]);
    expect(visible.map((m) => m.order)).toEqual([10, 20, 30]);
    expect(profileModulesShowTablist(visible)).toBe(true);
  });

  it("sin hasPresentation no aparece Presentación", () => {
    expect(
      resolveVisibleProfileModules({
        hasFullProfile: true,
        isVacancy: false,
      }).map((m) => m.code),
    ).toEqual(["ficha", "competencias"]);
    expect(
      resolveVisibleProfileModules({
        hasFullProfile: true,
        isVacancy: false,
        hasPresentation: false,
      }).map((m) => m.code),
    ).toEqual(["ficha", "competencias"]);
  });

  it("vista limitada + video: Ficha pública + Presentación; sin Competencias", () => {
    const limited = resolveVisibleProfileModules({
      hasFullProfile: false,
      isVacancy: false,
      hasPresentation: true,
    });
    expect(limited.map((m) => m.code)).toEqual(["ficha", "presentacion"]);
    expect(profileModulesShowTablist(limited)).toBe(true);
    expect(
      PERSON_PROFILE_MODULE_DEFINITIONS.find((d) => d.code === "presentacion")!
        .isAvailable({
          hasFullProfile: false,
          isVacancy: false,
          hasPresentation: true,
        }),
    ).toBe(true);
  });

  it("vista limitada + sin video: solo Ficha; sin tablist vacío", () => {
    const limited = resolveVisibleProfileModules({
      hasFullProfile: false,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(limited.map((m) => m.code)).toEqual(["ficha"]);
    expect(profileModulesShowTablist(limited)).toBe(false);
  });

  it("vacante: solo Ficha; Presentación no disponible aunque hasPresentation", () => {
    const vacancy = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: true,
      hasPresentation: true,
    });
    expect(vacancy.map((m) => m.code)).toEqual(["ficha"]);
  });

  it("Presentación como único módulo: firstAvailable y fallback estables", () => {
    const onlyPres: ProfileModuleDefinition[] = [
      PERSON_PROFILE_MODULE_DEFINITIONS.find((d) => d.code === "presentacion")!,
    ];
    expect(firstAvailableModule(onlyPres)).toBe("presentacion");
    expect(fallbackToAvailableModule("ficha", onlyPres)).toBe("presentacion");
    expect(resolveActiveProfileModule("ficha", onlyPres)).toBe("presentacion");
    expect(resolveActiveProfileModule("presentacion", onlyPres)).toBe(
      "presentacion",
    );
    expect(profileModulesShowTablist(onlyPres)).toBe(false);
  });

  it("fallback al primer disponible si Presentación deja de estar", () => {
    const without = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(resolveActiveProfileModule("presentacion", without)).toBe(
      DEFAULT_PROFILE_MODULE,
    );
  });

  it("conserva active válido (no auto-selecciona Presentación al aparecer)", () => {
    const full = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: true,
    });
    expect(resolveActiveProfileModule("ficha", full)).toBe("ficha");
    expect(resolveActiveProfileModule("competencias", full)).toBe(
      "competencias",
    );
    expect(resolveActiveProfileModule("presentacion", full)).toBe(
      "presentacion",
    );
  });

  it("ids ARIA estables", () => {
    const ficha = PERSON_PROFILE_MODULE_DEFINITIONS.find(
      (d) => d.code === "ficha",
    )!;
    const comp = PERSON_PROFILE_MODULE_DEFINITIONS.find(
      (d) => d.code === "competencias",
    )!;
    expect(ficha.tabId).toBe("person-tab-ficha");
    expect(ficha.panelId).toBe("person-panel-ficha");
    expect(comp.tabId).toBe("person-tab-competencias");
    expect(comp.panelId).toBe("person-panel-competencias");
  });

  it("navegación teclado: un módulo y varios tienen códigos ordenados", () => {
    const one = resolveVisibleProfileModules({
      hasFullProfile: false,
      isVacancy: false,
      hasPresentation: false,
    });
    expect(one.map((m) => m.code)).toEqual(["ficha"]);

    const many = resolveVisibleProfileModules({
      hasFullProfile: true,
      isVacancy: false,
      hasPresentation: true,
    });
    const codes = many.map((m) => m.code);
    expect(codes.indexOf("ficha")).toBeLessThan(codes.indexOf("competencias"));
    expect(codes.indexOf("competencias")).toBeLessThan(
      codes.indexOf("presentacion"),
    );
  });
});
