import { describe, expect, it } from "vitest";
import { canUseOrgVersioning } from "./canUseOrgVersioning";

const FORMER_VERSION_ADMIN_EMAILS = [
  "iron_fuentes@cun.edu.co",
  "raul_valencia@cun.edu.co",
  "haider_bello@cun.edu.co",
  "sara_murillofo@cun.edu.co",
] as const;

describe("canUseOrgVersioning", () => {
  it("true solo para la cuenta de desarrollo", () => {
    expect(
      canUseOrgVersioning({
        personId: "1229",
        eduEmail: "DesarrolloFabrica@cun.edu.co",
      }),
    ).toBe(true);
  });

  it.each(FORMER_VERSION_ADMIN_EMAILS)(
    "false para %s (ve solo la versión oficial)",
    (eduEmail) => {
      expect(
        canUseOrgVersioning({
          personId: "9999",
          eduEmail,
        }),
      ).toBe(false);
    },
  );

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
