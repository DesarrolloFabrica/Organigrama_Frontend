import { describe, expect, it } from "vitest";
import { canDownloadOrgDirectory } from "./canDownloadOrgDirectory";

const AUTHORIZED_EMAILS = [
  "desarrollofabrica@cun.edu.co",
  "lorena_gomez@cun.edu.co",
  "maria_ballen@cun.edu.co",
  "raul_valencia@cun.edu.co",
  "sara_murillofo@cun.edu.co",
] as const;

describe("canDownloadOrgDirectory", () => {
  it.each(AUTHORIZED_EMAILS)("true para %s", (eduEmail) => {
    expect(canDownloadOrgDirectory({ eduEmail })).toBe(true);
  });

  it("false para usuario normal", () => {
    expect(
      canDownloadOrgDirectory({
        eduEmail: "camilo_quintero@cun.edu.co",
      }),
    ).toBe(false);
  });

  it("false si user es null", () => {
    expect(canDownloadOrgDirectory(null)).toBe(false);
  });
});
