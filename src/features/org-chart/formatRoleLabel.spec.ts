import { describe, expect, it } from "vitest";

import { formatRoleLabel, type OrgNode } from "./types";

const coordinatorRole = {
  id: "r",
  name: "COORDINADOR AREA FABRICA Y DESARROLLO",
  description: null,
};

function node(partial: Partial<OrgNode>): OrgNode {
  return {
    id: "1",
    name: "Persona",
    role: null,
    children: [],
    ...partial,
  } as OrgNode;
}

describe("formatRoleLabel", () => {
  it("muestra el cargo base cuando no hay distinción de posición", () => {
    expect(formatRoleLabel(node({ role: coordinatorRole }))).toBe(
      "COORDINADOR AREA FABRICA Y DESARROLLO",
    );
  });

  it("compone cargo / distinción para un segundo equipo de la misma persona", () => {
    expect(
      formatRoleLabel(
        node({
          role: coordinatorRole,
          assignment_label:
            "analistas de diseño / presentador de contenido / realizador multimedia",
        }),
      ),
    ).toBe(
      "COORDINADOR AREA FABRICA Y DESARROLLO / analistas de diseño / presentador de contenido / realizador multimedia",
    );
  });

  it("no duplica el cargo si la etiqueta ya lo incluye", () => {
    expect(
      formatRoleLabel(
        node({
          role: coordinatorRole,
          assignment_label:
            "COORDINADOR AREA FABRICA Y DESARROLLO / analistas de diseño",
        }),
      ),
    ).toBe("COORDINADOR AREA FABRICA Y DESARROLLO / analistas de diseño");
  });
});
