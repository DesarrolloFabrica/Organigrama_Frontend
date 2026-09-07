import { describe, expect, it } from "vitest";

import type { OrgNode } from "../types";
import { findNodeInTree, orgNodeMatchesTarget } from "./findNodeInTree";

function person(id: string, relationId?: string, children: OrgNode[] = []): OrgNode {
  return {
    id,
    name: `Persona ${id}`,
    relation_id: relationId ?? null,
    children,
  } as OrgNode;
}

describe("orgNodeMatchesTarget", () => {
  it("sin relationId coincide cualquier posición de la persona", () => {
    expect(orgNodeMatchesTarget(person("49", "12165"), "49")).toBe(true);
  });

  it("con relationId exige esa posición visual", () => {
    expect(orgNodeMatchesTarget(person("49", "12165"), "49", "12165")).toBe(
      true,
    );
    expect(orgNodeMatchesTarget(person("49", "100"), "49", "12165")).toBe(
      false,
    );
  });
});

describe("findNodeInTree", () => {
  const duplicate = person("49", "12165");
  const tree = person("49", "100", [person("2", "200"), duplicate]);

  it("sin relationId devuelve la primera aparición", () => {
    expect(findNodeInTree(tree, "49")?.relation_id).toBe("100");
  });

  it("con relationId encuentra el segundo cargo de la misma persona", () => {
    expect(findNodeInTree(tree, "49", "12165")?.relation_id).toBe("12165");
  });
});
