import { describe, expect, it } from "vitest";
import { orgQueryKeys } from "../queryKeys";
import {
  ORG_CHART_CHANGE_TOKEN_UNAVAILABLE,
  shouldInvalidateOnChangeToken,
} from "./useOrgChartChangeToken";

describe("shouldInvalidateOnChangeToken", () => {
  it("la primera huella solo se registra", () => {
    expect(shouldInvalidateOnChangeToken(null, "a")).toBe(false);
  });

  it("misma huella no recarga", () => {
    expect(shouldInvalidateOnChangeToken("a", "a")).toBe(false);
  });

  it("huella distinta (cambio en Orbit) recarga", () => {
    expect(shouldInvalidateOnChangeToken("a", "b")).toBe(true);
  });

  it("unavailable o vacío nunca recarga", () => {
    expect(
      shouldInvalidateOnChangeToken("a", ORG_CHART_CHANGE_TOKEN_UNAVAILABLE),
    ).toBe(false);
    expect(shouldInvalidateOnChangeToken("a", null)).toBe(false);
    expect(shouldInvalidateOnChangeToken("a", "")).toBe(false);
  });
});

describe("orgQueryKeys.changeToken", () => {
  it("no forma parte de las familias que invalida", () => {
    expect(orgQueryKeys.allOrgData as readonly string[]).not.toContain(
      orgQueryKeys.changeToken[0],
    );
  });
});
