import { describe, expect, it } from "vitest";
import { resolvePresentationLevel } from "./presentationLevel";
import {
  parseOrgHierarchyLevelNumber,
  resolveOrgMapVisualLevel,
} from "./orgMapLevelTheme";
import type { OrgNode } from "../types";

const hierarchy = (name: string) => ({ id: "h", name, description: null });
const role = (name: string) => ({ id: "r", name, description: null });

describe("resolvePresentationLevel", () => {
  it("lee NIVEL 1–3 del nombre de jerarquía", () => {
    expect(resolvePresentationLevel([{ hierarchy: hierarchy("NIVEL 1") }])).toBe(1);
    expect(resolvePresentationLevel([{ hierarchy: hierarchy("Nivel 2") }])).toBe(2);
    expect(resolvePresentationLevel([{ hierarchy: hierarchy("NIVEL 3") }])).toBe(3);
  });

  it("niveles 4+ y docentes no muestran número", () => {
    expect(resolvePresentationLevel([{ hierarchy: hierarchy("NIVEL 4") }])).toBeNull();
    expect(
      resolvePresentationLevel([
        { hierarchy: hierarchy("NIVEL 2"), role: role("DOCENTE") },
      ]),
    ).toBeNull();
  });

  it("sin señal → null (no usa profundidad)", () => {
    expect(resolvePresentationLevel([])).toBeNull();
    expect(resolvePresentationLevel([null, undefined, {}])).toBeNull();
    expect(resolvePresentationLevel([{ hierarchy: hierarchy("OPERATIVO") }])).toBeNull();
  });

  it("la primera fuente con nivel decide; las vacías se saltan", () => {
    expect(
      resolvePresentationLevel([
        { hierarchy: null },
        { hierarchy: hierarchy("NIVEL 2") },
      ]),
    ).toBe(2);
    expect(
      resolvePresentationLevel([
        { hierarchy: hierarchy("NIVEL 4") },
        { hierarchy: hierarchy("NIVEL 2") },
      ]),
    ).toBeNull();
  });
});

describe("parseOrgHierarchyLevelNumber / mapa (sin regresión)", () => {
  it("parsea igual que antes", () => {
    expect(parseOrgHierarchyLevelNumber("NIVEL 3")).toBe(3);
    expect(parseOrgHierarchyLevelNumber("Level: 2")).toBe(2);
    expect(parseOrgHierarchyLevelNumber("capa 7")).toBe(7);
    expect(parseOrgHierarchyLevelNumber("NIVEL 0")).toBeNull();
    expect(parseOrgHierarchyLevelNumber("  ")).toBeNull();
  });

  it("el mapa conserva docente → 5, nombre acotado y fallback por profundidad", () => {
    const node = (h: string | null, r: string | null = null) =>
      ({
        hierarchy: h ? hierarchy(h) : null,
        role: r ? role(r) : null,
      }) as unknown as OrgNode;
    expect(resolveOrgMapVisualLevel(node("NIVEL 2", "DOCENTE"), 0)).toBe(5);
    expect(resolveOrgMapVisualLevel(node("NIVEL 7"), 0)).toBe(5);
    expect(resolveOrgMapVisualLevel(node("NIVEL 3"), 0)).toBe(3);
    expect(resolveOrgMapVisualLevel(node(null), 1)).toBe(2);
  });
});
