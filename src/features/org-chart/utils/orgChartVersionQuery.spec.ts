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

  it("usa & si el path ya tiene query", () => {
    expect(
      buildVersionQuery("/api/org-chart/search?q=david", { versionId: 4 }),
    ).toBe("/api/org-chart/search?q=david&versionId=4");
  });
});
