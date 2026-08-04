import { describe, expect, it } from "vitest";
import {
  assertSafePersonVideoStreamPath,
  isPersonVideoTicketFresh,
  resolvePersonVideoStreamUrl,
  UnsafePersonVideoStreamUrlError,
} from "./personVideoStreamUrl";

describe("personVideoStreamUrl", () => {
  const ok =
    "/api/org-chart/person/10/video/stream?ticket=eyJhbGciOiJIUzI1NiJ9.abc";

  it("acepta path relativo válido", () => {
    expect(assertSafePersonVideoStreamPath(ok)).toBe(ok);
  });

  it("resuelve contra base API", () => {
    expect(resolvePersonVideoStreamUrl(ok, "http://localhost:3000")).toBe(
      `http://localhost:3000${ok}`,
    );
  });

  it("rechaza URL externa / Drive / esquemas inseguros", () => {
    expect(() =>
      assertSafePersonVideoStreamPath("https://evil.example/x"),
    ).toThrow(UnsafePersonVideoStreamUrlError);
    expect(() =>
      assertSafePersonVideoStreamPath("javascript:alert(1)"),
    ).toThrow(UnsafePersonVideoStreamUrlError);
    expect(() =>
      assertSafePersonVideoStreamPath(
        "/api/org-chart/person/1/video/stream?ticket=x&drive=1",
      ),
    ).not.toThrow();
    expect(() =>
      assertSafePersonVideoStreamPath(
        "https://drive.google.com/file/d/abc/view",
      ),
    ).toThrow(UnsafePersonVideoStreamUrlError);
  });

  it("ticket fresh / próximo a expirar", () => {
    const now = Date.parse("2026-08-03T18:00:00.000Z");
    expect(
      isPersonVideoTicketFresh("2026-08-03T18:02:00.000Z", 15, now),
    ).toBe(true);
    expect(
      isPersonVideoTicketFresh("2026-08-03T18:00:10.000Z", 15, now),
    ).toBe(false);
    expect(
      isPersonVideoTicketFresh("2026-08-03T17:59:00.000Z", 15, now),
    ).toBe(false);
  });
});
