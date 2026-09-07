import { describe, expect, it } from "vitest";

import {
  coordinationCardAccentCssVars,
  coordinationCardPassiveThemeCssVars,
  coordinationCardThemeCssVars,
} from "./coordinationCardTheme";

const identity = {
  glowColor: "79 70 229",
  highlightColor: "224 231 255",
};

describe("coordinationCardTheme", () => {
  it("expone los canales de la coordinación para los estados de la tarjeta", () => {
    expect(coordinationCardAccentCssVars(identity)).toMatchObject({
      "--coordination-card-glow": "79 70 229",
      "--coordination-card-highlight": "224 231 255",
    });
  });

  it("reemplaza el color jerárquico por la coordinación activa", () => {
    expect(coordinationCardThemeCssVars(identity)).toMatchObject({
      "--org-lvl-primary": "rgb(79 70 229)",
      "--org-lvl-core-mid": "rgb(79 70 229 / 0.46)",
      "--org-lvl-ring-inner": "rgb(224 231 255 / 0.34)",
    });
  });

  it("genera un tinte pasivo más tenue para los hermanos", () => {
    expect(coordinationCardPassiveThemeCssVars(identity)).toMatchObject({
      "--org-lvl-primary": "rgb(79 70 229)",
      "--org-lvl-edge-strong": "rgb(79 70 229 / 0.28)",
      "--org-lvl-ring-inner": "rgb(224 231 255 / 0.17)",
    });
  });
});
