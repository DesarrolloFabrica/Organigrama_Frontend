import { describe, expect, it } from "vitest";
import type { OrgNode } from "../types";
import {
  buildOrgMap,
  orgMapNodeKey,
  parseOrgMapNodeKey,
} from "./orgMapLayout";

const person = (id: string, relationId?: string | null): OrgNode =>
  ({
    id,
    document: id,
    name: id,
    role_id: null,
    role: null,
    relation_id: relationId ?? null,
    hierarchy_id: null,
    area_id: null,
    school_id: null,
    program_id: null,
    email: null,
    edu_email: null,
    phone: null,
    children: [],
  }) as unknown as OrgNode;

describe("orgMapNodeKey", () => {
  it("usa solo el person id en la raíz sin relación", () => {
    expect(orgMapNodeKey(person("49"))).toBe("49");
  });

  it("distingue una segunda posición de la misma persona", () => {
    expect(orgMapNodeKey(person("49", "9001"))).toBe("49::9001");
  });
});

describe("parseOrgMapNodeKey", () => {
  it("conserva un personId simple", () => {
    expect(parseOrgMapNodeKey("1082")).toEqual({
      personId: "1082",
      relationId: null,
    });
  });

  it.each([
    ["1082::8536", "1082", "8536"],
    ["601::11376", "601", "11376"],
  ])(
    "separa la clave posicional %s antes de llamar endpoints de persona",
    (nodeKey, personId, relationId) => {
      expect(parseOrgMapNodeKey(nodeKey)).toEqual({ personId, relationId });
    },
  );
});

describe("buildOrgMap", () => {
  it("no colisiona si Haider aparece como padre y como hijo", () => {
    const duplicate = person("49", "9001");
    const root = {
      ...person("49"),
      children: [person("2"), person("52"), duplicate],
    };
    const graph = buildOrgMap(root);
    const ids = graph.nodes.map((node) => node.id);
    expect(ids).toEqual(["49", "2", "52", "49::9001"]);
    expect(new Set(ids).size).toBe(4);
  });
});
