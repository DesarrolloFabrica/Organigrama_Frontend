import { describe, expect, it } from "vitest";
import { canUseOrgVersioning } from "./canUseOrgVersioning";

const AUTHORIZED_EMAILS = [
  "desarrollofabrica@cun.edu.co",
  "iron_fuentes@cun.edu.co",
  "raul_valencia@cun.edu.co",
  "haider_bello@cun.edu.co",
  "sara_murillofo@cun.edu.co",
] as const;

describe("canUseOrgVersioning", () => {
  it.each(AUTHORIZED_EMAILS)("true para %s", (eduEmail) => {
    expect(
      canUseOrgVersioning({
        personId: "9999",
        eduEmail,
      }),
    ).toBe(true);
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
