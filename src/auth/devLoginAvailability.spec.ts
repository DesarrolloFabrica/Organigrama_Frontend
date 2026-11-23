import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDevLoginAvailable } from "./authService";

describe("fetchDevLoginAvailable", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("true solo si el backend responde { enabled: true }", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enabled: true }), { status: 200 }));
    await expect(fetchDevLoginAvailable()).resolves.toBe(true);
    expect((fetchMock.mock.calls[0] as [string])[0]).toMatch(/\/api\/auth\/dev-login\/status$/);
  });

  it("false si el backend lo tiene deshabilitado", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enabled: false }), { status: 200 }));
    await expect(fetchDevLoginAvailable()).resolves.toBe(false);
  });

  it.each([404, 401, 500])("false ante HTTP %i (p. ej. 404 en producción)", async (status) => {
    fetchMock.mockResolvedValue(new Response("{}", { status }));
    await expect(fetchDevLoginAvailable()).resolves.toBe(false);
  });

  it("false ante error de red o respuesta no JSON", async () => {
    fetchMock.mockRejectedValueOnce(new Error("red"));
    await expect(fetchDevLoginAvailable()).resolves.toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
    await expect(fetchDevLoginAvailable()).resolves.toBe(false);
  });

  it("false si enabled no es exactamente true", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enabled: "true" }), { status: 200 }));
    await expect(fetchDevLoginAvailable()).resolves.toBe(false);
  });
});
