import { describe, expect, it } from "vitest";

import { COORDINATION_EMBLEMS } from "../config/coordinationEmblems";
import type { OrgChartVacancy, OrgNode, OrgSummaryItem } from "../types";
import {
  buildCoordinationEmblemIndex,
  resolveVacancyCoordinationBadge,
  sortVacanciesByCoordination,
} from "./orgChartVacancyCoordination";

function node(
  id: string,
  name: string,
  roleName: string | null,
  children: OrgNode[] = [],
): OrgNode {
  return {
    id,
    name,
    role: roleName ? { id: "r", name: roleName, description: null } : null,
    children,
  } as unknown as OrgNode;
}

function vacancy(
  id: number,
  coordination: OrgChartVacancy["coordination"],
): OrgChartVacancy {
  return {
    id,
    areaId: 1,
    schoolId: null,
    programId: null,
    positionName: `Cargo ${id}`,
    curricularLine: null,
    quantity: 1,
    operationStatus: "requisition_sent",
    createdAt: null,
    coordination,
  };
}

const specializations = node(
  "1081",
  "Cabeza Especializaciones",
  "COORDINADOR ESCUELA DE ESPECIALIZACIONES",
);
const socialOutreach = node(
  "1193",
  "Cabeza Proyección",
  "COORDINADOR PROYECCION SOCIAL",
);
const general = node("1082", "Coordinación General", "COORDINADOR GENERAL", [
  specializations,
  socialOutreach,
]);
const TREE = node("1144", "Raíz", "DIRECTOR", [general]);

describe("buildCoordinationEmblemIndex", () => {
  it("resuelve los emblemas del árbol con la lógica del mapa", () => {
    const index = buildCoordinationEmblemIndex({ tree: TREE });
    expect(index.get("1081")).toBe(COORDINATION_EMBLEMS.specializations);
    expect(index.get("1193")).toBe(COORDINATION_EMBLEMS.socialOutreach);
    expect(index.has("1144")).toBe(false);
  });

  it("usa las filas del resumen cuando el árbol no trae a la cabeza", () => {
    const areas: OrgSummaryItem[] = [
      {
        id: "1193",
        name: "Cabeza Proyección",
        roleName: "COORDINADOR PROYECCION SOCIAL",
        totalPeople: 3,
        vacancies: 0,
      },
    ];
    const index = buildCoordinationEmblemIndex({
      tree: node("1144", "Raíz", "DIRECTOR"),
      summaryItems: areas,
    });
    expect(index.get("1193")).toBe(COORDINATION_EMBLEMS.socialOutreach);
  });
});

describe("resolveVacancyCoordinationBadge", () => {
  const index = buildCoordinationEmblemIndex({ tree: TREE });

  it("una requisición de coordinación lleva el emblema y el nombre de la coordinación", () => {
    const badge = resolveVacancyCoordinationBadge(
      vacancy(1, {
        kind: "coordination",
        areaName: "ESPECIALIZACIONES",
        headPersonIds: ["1081"],
      }),
      index,
    );
    expect(badge).toEqual({
      emblem: COORDINATION_EMBLEMS.specializations,
      label: "Escuela de Especializaciones",
      kind: "coordination",
    });
  });

  it("sin emblema conocido usa el área como nombre", () => {
    const badge = resolveVacancyCoordinationBadge(
      vacancy(2, {
        kind: "coordination",
        areaName: "OPERACION ACADEMICA",
        headPersonIds: ["9999"],
      }),
      index,
    );
    expect(badge).toEqual({
      emblem: null,
      label: "Operacion academica",
      kind: "coordination",
    });
  });

  it("la Dirección se nombra por su área", () => {
    const badge = resolveVacancyCoordinationBadge(
      vacancy(3, {
        kind: "direction",
        areaName: "DIRECCION GENERAL DE OPERACIONES",
        headPersonIds: ["1144"],
      }),
      index,
    );
    expect(badge?.label).toBe("Direccion general de operaciones");
    expect(badge?.kind).toBe("direction");
  });

  it("sin grupo (o respuesta anterior sin el campo) no hay insignia", () => {
    expect(resolveVacancyCoordinationBadge(vacancy(4, null), index)).toBeNull();
    expect(
      resolveVacancyCoordinationBadge(vacancy(5, undefined), index),
    ).toBeNull();
  });
});

describe("sortVacanciesByCoordination", () => {
  it("agrupa por coordinación, conserva el orden interno y deja al final las sin grupo", () => {
    const index = buildCoordinationEmblemIndex({ tree: TREE });
    const social = {
      kind: "coordination" as const,
      areaName: "PROYECCION SOCIAL",
      headPersonIds: ["1193"],
    };
    const spec = {
      kind: "coordination" as const,
      areaName: "ESPECIALIZACIONES",
      headPersonIds: ["1081"],
    };
    const sorted = sortVacanciesByCoordination(
      [
        vacancy(10, social),
        vacancy(11, null),
        vacancy(12, spec),
        vacancy(13, social),
        vacancy(14, spec),
      ],
      index,
    );
    expect(sorted.map((v) => v.id)).toEqual([12, 14, 10, 13, 11]);
  });
});
