import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DirectoryExportForbiddenError,
  fetchDirectoryExportPermissions,
  requestOrgChartExport,
} from "./orgChartService";
import { getAuthUser, updateAuthUserPermissions } from "../../../auth/authStorage";

/** sessionStorage mínimo para entorno node. Datos sintéticos. */
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

describe("exportación del organigrama (cliente)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const storage = memoryStorage();
    storage.setItem("organigrama.accessToken", "token-sintetico");
    storage.setItem(
      "organigrama.authUser",
      JSON.stringify({
        personId: "500",
        fullName: "Persona Sintética",
        eduEmail: "persona@example.test",
        googleEmail: "persona@example.test",
        pictureUrl: null,
        permissions: ["ORG_ADMIN", "ORG_DIRECTORY_EXPORT_HTML", "ORG_DIRECTORY_EXPORT_XLS"],
      }),
    );
    vi.stubGlobal("sessionStorage", storage);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["html", "/api/org-chart/export/html", "text/html"],
    ["xls", "/api/org-chart/export/directory", "application/vnd.ms-excel"],
  ] as const)("%s: pide %s con el token de la sesión", async (format, path, accept) => {
    fetchMock.mockResolvedValue(
      new Response("contenido", {
        status: 200,
        headers: {
          "content-type": accept,
          "content-disposition": 'attachment; filename="organigrama-sintetico.x"',
        },
      }),
    );
    const file = await requestOrgChartExport(format);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith(path)).toBe(true);
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer token-sintetico",
    );
    expect(file.filename).toBe("organigrama-sintetico.x");
  });

  it("403 → DirectoryExportForbiddenError con el formato rechazado", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "DIRECTORY_EXPORT_FORBIDDEN" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    );
    const error = await requestOrgChartExport("xls").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DirectoryExportForbiddenError);
    expect((error as DirectoryExportForbiddenError).format).toBe("xls");
    expect((error as Error).message).toContain("Acceso denegado");
  });

  it("401 → mensaje de sesión expirada; otros errores sin volcar el cuerpo", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));
    await expect(requestOrgChartExport("html")).rejects.toThrow("sesión expiró");
    fetchMock.mockResolvedValueOnce(new Response("detalle interno", { status: 503 }));
    const error = (await requestOrgChartExport("html").catch((e: unknown) => e)) as Error;
    expect(error.message).toBe("No se pudo descargar el HTML (HTTP 503).");
  });

  it("consulta los permisos vigentes en /export/permissions", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ html: false, xls: true }), { status: 200 }),
    );
    await expect(fetchDirectoryExportPermissions()).resolves.toEqual({
      html: false,
      xls: true,
    });
    expect((fetchMock.mock.calls[0] as [string])[0]).toMatch(
      /\/api\/org-chart\/export\/permissions$/,
    );
  });

  it("updateAuthUserPermissions actualiza la sesión guardada sin tocar el token", () => {
    updateAuthUserPermissions(["ORG_ADMIN", "ORG_DIRECTORY_EXPORT_XLS"]);
    expect(getAuthUser()?.permissions).toEqual(["ORG_ADMIN", "ORG_DIRECTORY_EXPORT_XLS"]);
    expect(sessionStorage.getItem("organigrama.accessToken")).toBe("token-sintetico");
  });
});
