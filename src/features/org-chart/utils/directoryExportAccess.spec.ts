import { describe, expect, it, vi } from "vitest";
import {
  getDirectoryExportAccess,
  hasAnyDirectoryExport,
  resyncDirectoryExportAccess,
  withDirectoryExportAccess,
} from "./directoryExportAccess";

const HTML = "ORG_DIRECTORY_EXPORT_HTML";
const XLS = "ORG_DIRECTORY_EXPORT_XLS";
const LEGACY = ["ORG_ADMIN", "ORG_READ_ALL", "ORG_CONTACT_READ_ALL"];

describe("getDirectoryExportAccess", () => {
  it.each([
    [[], { html: false, xls: false }],
    [[HTML], { html: true, xls: false }],
    [[XLS], { html: false, xls: true }],
    [[HTML, XLS], { html: true, xls: true }],
  ])("permisos %j → %j", (permissions, expected) => {
    expect(getDirectoryExportAccess({ permissions })).toEqual(expected);
  });

  it("ORG_ADMIN / ORG_READ_ALL / ORG_CONTACT_READ_ALL no muestran botones", () => {
    const access = getDirectoryExportAccess({ permissions: LEGACY });
    expect(access).toEqual({ html: false, xls: false });
    expect(hasAnyDirectoryExport(access)).toBe(false);
  });

  it("sin usuario o sin permisos no hay acciones", () => {
    expect(hasAnyDirectoryExport(getDirectoryExportAccess(null))).toBe(false);
    expect(hasAnyDirectoryExport(getDirectoryExportAccess(undefined))).toBe(false);
  });
});

describe("withDirectoryExportAccess", () => {
  it("ajusta solo los códigos de exportación y conserva el resto", () => {
    expect(
      withDirectoryExportAccess([...LEGACY, HTML, XLS], { html: false, xls: true }),
    ).toEqual([...LEGACY, XLS]);
    expect(withDirectoryExportAccess(LEGACY, { html: true, xls: false })).toEqual([
      ...LEGACY,
      HTML,
    ]);
  });
});

describe("resyncDirectoryExportAccess (tras un 403)", () => {
  it("usa los permisos vigentes que devuelve el backend", async () => {
    const fetchCurrent = vi.fn().mockResolvedValue({ html: false, xls: true });
    await expect(
      resyncDirectoryExportAccess("html", { html: true, xls: true }, fetchCurrent),
    ).resolves.toEqual({ html: false, xls: true });
    expect(fetchCurrent).toHaveBeenCalledTimes(1);
  });

  it("si la consulta falla, retira al menos el formato rechazado", async () => {
    const fetchCurrent = vi.fn().mockRejectedValue(new Error("red"));
    await expect(
      resyncDirectoryExportAccess("xls", { html: true, xls: true }, fetchCurrent),
    ).resolves.toEqual({ html: true, xls: false });
  });

  it("normaliza respuestas incompletas a false", async () => {
    const fetchCurrent = vi.fn().mockResolvedValue({ html: true });
    await expect(
      resyncDirectoryExportAccess("xls", { html: true, xls: true }, fetchCurrent as never),
    ).resolves.toEqual({ html: true, xls: false });
  });
});
