import { describe, expect, it } from "vitest";

import { resolveCoordinationEmblem } from "./coordinationEmblems";

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
  ])("asigna a $name un emblema exclusivo de tarjeta", ({ name, label, icon }) => {
    const emblem = resolveCoordinationEmblem({
      id: "person",
      name,
      role: { name: "Cargo" },
    } as Parameters<typeof resolveCoordinationEmblem>[0]);

    expect(emblem).toMatchObject({ label, flowVisuals: false });
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
