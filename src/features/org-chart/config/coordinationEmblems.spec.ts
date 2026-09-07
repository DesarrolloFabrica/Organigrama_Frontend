import { describe, expect, it } from "vitest";

import type { OrgNode } from "../types";
import {
  resolveCoordinationEmblem,
  resolveCoordinationEmblemFromAssignmentLabel,
  resolveNodeCoordinationContext,
} from "./coordinationEmblems";

describe("resolveCoordinationEmblem B2B", () => {
  it("asigna el pájaro carpintero a Supervisor B2B", () => {
    const emblem = resolveCoordinationEmblem({
      id: "b2b-head",
      name: "Cabeza B2B",
      role: { name: "Supervisor B2B" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toMatchObject({
      label: "Coordinación B2B",
      glowColor: "239 68 68",
      highlightColor: "254 202 202",
      placement: "watermark",
    });
    expect(emblem?.icon).toContain("B2B.png");
  });

  it("no asigna el emblema a un integrante B2B sin cargo de cabeza", () => {
    const emblem = resolveCoordinationEmblem({
      id: "b2b-member",
      name: "Integrante B2B",
      role: { name: "Asesor B2B" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toBeNull();
  });

  it.each([
    {
      name: "IRON ALEXANDER FUENTES RODRIGUEZ",
      label: "Director de Operaciones",
      icon: "DirectorOp.png",
    },
    {
      name: "Raúl Valencia Cifuentes",
      label: "Coordinación General",
      icon: "CoordinacionGeneral.png",
    },
  ])("asigna a $name su identidad de coordinación", ({ name, label, icon }) => {
    const emblem = resolveCoordinationEmblem({
      id: "person",
      name,
      role: { name: "Cargo" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toMatchObject({ label });
    expect(emblem?.icon).toContain(icon);
  });

  it.each([
    ["SARA JULIANA MARTÍNEZ LÓPEZ", "Fábrica · GIF", "FOCA_GIF.png"],
    ["JOHAN SEBASTIAN DAZA SARMIENTO", "Fábrica · Desarrollo", "FOCA_DESARROLLO.png"],
    ["FELIPE GUERRERO BUENAVENTURA", "Fábrica · Marketing", "FOCA_MARKETING.png"],
  ])("asigna la identidad interna %s", (name, label, icon) => {
    const emblem = resolveCoordinationEmblem({
      id: "factory-child",
      name,
      nodeKind: "person",
      role: { name: "Cargo de Fábrica" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toMatchObject({ label, placement: "watermark" });
    expect(emblem?.icon).toContain(icon);
  });

  it("asigna FOCA_ANALISTAS a la vacante de Fábrica y conserva su color", () => {
    const emblem = resolveCoordinationEmblem({
      id: "factory-vacancy",
      name: "VACANTE — COORDINADOR FÁBRICA DE CONTENIDOS - DISEÑADORES DE CONTENIDO",
      nodeKind: "vacancy",
      role: { name: "Coordinador Fábrica de Contenidos" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toMatchObject({
      label: "Fábrica · Analistas",
      vacancyVisuals: true,
    });
    expect(emblem?.icon).toContain("FOCA_ANALISTAS.png");
  });
});

describe("resolveNodeCoordinationContext", () => {
  const member = {
    id: "member",
    name: "Integrante de desarrollo",
    role: { name: "Desarrollador" },
    children: [],
  } as unknown as OrgNode;
  const developmentLead = {
    id: "development-lead",
    name: "JOHAN SEBASTIAN DAZA SARMIENTO",
    role: { name: "Líder de desarrollo" },
    children: [member],
  } as unknown as OrgNode;
  const generalLead = {
    id: "general-lead",
    name: "RAUL VALENCIA CIFUENTES",
    role: { name: "Coordinador general" },
    children: [developmentLead],
  } as unknown as OrgNode;

  it("hereda al integrante la subcoordinación más cercana", () => {
    const context = resolveNodeCoordinationContext(generalLead, member.id);

    expect(context?.identity?.label).toBe("Fábrica · Desarrollo");
    expect(context?.managerIdentity?.label).toBe("Fábrica · Desarrollo");
  });

  it("conserva por separado la paleta del jefe inmediato", () => {
    const context = resolveNodeCoordinationContext(
      generalLead,
      developmentLead.id,
    );

    expect(context?.identity?.label).toBe("Fábrica · Desarrollo");
    expect(context?.managerIdentity?.label).toBe("Coordinación General");
  });
});

describe("posición duplicada de la misma persona", () => {
  const analystsLabel =
    "analistas de diseño / presentador de contenido / realizador multimedia";
  const coordinator = {
    id: "49",
    name: "HAIDER YESID BELLO MELO",
    nodeKind: "person",
    relation_id: "100",
    role: { name: "COORDINADOR AREA FABRICA Y DESARROLLO" },
    children: [],
  } as unknown as OrgNode;
  const analystsLead = {
    id: "49",
    name: "HAIDER YESID BELLO MELO",
    nodeKind: "person",
    relation_id: "12165",
    assignment_label: analystsLabel,
    role: { name: "COORDINADOR AREA FABRICA Y DESARROLLO" },
    children: [],
  } as unknown as OrgNode;
  const tree = {
    ...coordinator,
    children: [analystsLead],
  } as unknown as OrgNode;

  it("mantiene Fábrica en el cargo de coordinador", () => {
    const emblem = resolveCoordinationEmblem(coordinator);

    expect(emblem).toMatchObject({ label: "Fábrica y Desarrollo" });
    expect(emblem?.icon).toContain("Fabrica.png");
  });

  it("asigna FOCA_ANALISTAS al segundo cargo por la etiqueta de posición", () => {
    expect(
      resolveCoordinationEmblemFromAssignmentLabel(analystsLabel)?.label,
    ).toBe("Fábrica · Analistas");

    const emblem = resolveCoordinationEmblem(analystsLead);
    expect(emblem).toMatchObject({
      label: "Fábrica · Analistas",
      glowColor: "174 0 235",
    });
    expect(emblem?.icon).toContain("FOCA_ANALISTAS.png");
  });

  it("resuelve cada posición de Haider con su propia identidad", () => {
    const asCoordinator = resolveNodeCoordinationContext(tree, "49", "100");
    const asAnalystsLead = resolveNodeCoordinationContext(tree, "49", "12165");

    expect(asCoordinator?.identity?.label).toBe("Fábrica y Desarrollo");
    expect(asAnalystsLead?.identity?.label).toBe("Fábrica · Analistas");
    expect(asAnalystsLead?.managerIdentity?.label).toBe("Fábrica y Desarrollo");
  });
});
