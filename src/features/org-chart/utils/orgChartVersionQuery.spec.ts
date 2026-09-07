import { describe, expect, it } from "vitest";
import { buildVersionQuery } from "./orgChartVersionQuery";

describe("buildVersionQuery", () => {
  it("no añade query si versionId es undefined", () => {
    expect(buildVersionQuery("/api/org-chart/root")).toBe("/api/org-chart/root");
    expect(buildVersionQuery("/api/org-chart/root", {})).toBe(
      "/api/org-chart/root",
    );
  });

  it("añade versionId como query param", () => {
    expect(buildVersionQuery("/api/org-chart/root", { versionId: 4 })).toBe(
      "/api/org-chart/root?versionId=4",
    );
  });

  it("añade scopeVersionId cuando se indica", () => {
    expect(
      buildVersionQuery("/api/org-chart/root", {
        versionId: 4,
        scopeVersionId: 9,
      }),
    ).toBe("/api/org-chart/root?versionId=4&scopeVersionId=9");
  });

  it("permite heredar el subárbol de la versión global", () => {
    expect(
      buildVersionQuery("/api/org-chart/root", {
        versionId: 4,
        scopeVersionId: "none",
      }),
    ).toBe("/api/org-chart/root?versionId=4&scopeVersionId=none");
  });

  it("usa & si el path ya tiene query", () => {
    expect(
      buildVersionQuery("/api/org-chart/search?q=david", { versionId: 4 }),
    ).toBe("/api/org-chart/search?q=david&versionId=4");
  });
});
