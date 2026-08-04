import { describe, expect, it } from "vitest";
import { parsePersonVideoResponse } from "../services/orgChartService";

describe("parsePersonVideoResponse", () => {
  it("acepta unavailable", () => {
    expect(parsePersonVideoResponse({ hasVideo: false })).toEqual({
      hasVideo: false,
    });
  });

  it("acepta available completo", () => {
    const raw = {
      hasVideo: true,
      fileName: "a.mp4",
      mimeType: "video/mp4",
      sizeBytes: 10,
      lastSync: "2026-08-01T00:00:00.000Z",
      streamTicket: "tok",
      streamTicketExpiresAt: "2026-08-03T18:02:00.000Z",
      streamUrl:
        "/api/org-chart/person/10/video/stream?ticket=tok",
    };
    expect(parsePersonVideoResponse(raw)).toEqual(raw);
  });

  it("rechaza contrato inválido", () => {
    expect(() => parsePersonVideoResponse(null)).toThrow(/inválida/);
    expect(() =>
      parsePersonVideoResponse({ hasVideo: true, fileName: "x" }),
    ).toThrow(/incompletos/);
  });

  it("rechaza streamUrl externo o inseguro", () => {
    expect(() =>
      parsePersonVideoResponse({
        hasVideo: true,
        fileName: "a.mp4",
        mimeType: "video/mp4",
        sizeBytes: null,
        lastSync: null,
        streamTicket: "tok",
        streamTicketExpiresAt: "2026-08-03T18:02:00.000Z",
        streamUrl: "https://drive.google.com/file/d/x",
      }),
    ).toThrow();
  });
});
