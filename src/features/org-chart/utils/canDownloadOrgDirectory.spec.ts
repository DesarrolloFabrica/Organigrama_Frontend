import { afterEach, describe, expect, it, vi } from "vitest";
import { canDownloadOrgDirectory } from "./canDownloadOrgDirectory";

/** Correos sintéticos: ninguno corresponde a una persona real. */
const AUTHORIZED = "exportador.sintetico@example.test";

describe("canDownloadOrgDirectory", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["", "   ", " , "])(
    "deshabilitado por defecto: VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS=%j",
    (value) => {
      vi.stubEnv("VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS", value);
      expect(canDownloadOrgDirectory({ eduEmail: AUTHORIZED })).toBe(false);
      // Ninguna de las cuentas del antiguo valor por defecto queda habilitada.
      expect(
        canDownloadOrgDirectory({ eduEmail: "desarrollofabrica@cun.edu.co" }),
      ).toBe(false);
    },
  );

  it("true para un correo listado, sin distinguir mayúsculas", () => {
    vi.stubEnv("VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS", ` ${AUTHORIZED} ,otro@example.test`);
    expect(canDownloadOrgDirectory({ eduEmail: "Exportador.Sintetico@example.test" })).toBe(true);
  });

  it("false para un correo no listado", () => {
    vi.stubEnv("VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS", AUTHORIZED);
    expect(canDownloadOrgDirectory({ eduEmail: "usuario@example.test" })).toBe(false);
  });

  it("false si user es null o sin correo", () => {
    vi.stubEnv("VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS", AUTHORIZED);
    expect(canDownloadOrgDirectory(null)).toBe(false);
    expect(canDownloadOrgDirectory({ eduEmail: null })).toBe(false);
  });
});
