import { describe, expect, it } from "vitest";
import { canUseOrgVersioning } from "./canUseOrgVersioning";

describe("canUseOrgVersioning", () => {
  it("true para técnico autorizado (1229 + desarrollofabrica)", () => {
    expect(
      canUseOrgVersioning({
        personId: "1229",
        eduEmail: "desarrollofabrica@cun.edu.co",
      }),
    ).toBe(true);
  });

  it("false para mismo email con distinto personId", () => {
    expect(
      canUseOrgVersioning({
        personId: "1144",
        eduEmail: "desarrollofabrica@cun.edu.co",
      }),
    ).toBe(false);
  });

  it("false para mismo personId con distinto email", () => {
    expect(
      canUseOrgVersioning({
        personId: "1229",
        eduEmail: "otro@cun.edu.co",
      }),
    ).toBe(false);
  });

  it("false para ORG_ADMIN genérico", () => {
    expect(
      canUseOrgVersioning({
        personId: "100",
        eduEmail: "admin.generico@cun.edu.co",
      }),
    ).toBe(false);
  });

  it("false para usuario normal", () => {
    expect(
      canUseOrgVersioning({
        personId: "1144",
        eduEmail: "camilo_quintero@cun.edu.co",
      }),
    ).toBe(false);
  });

  it("false si user es null", () => {
    expect(canUseOrgVersioning(null)).toBe(false);
  });
});
