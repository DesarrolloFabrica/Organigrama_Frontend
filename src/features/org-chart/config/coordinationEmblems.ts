import factoryIcon from "../assets/coordination-icons/Fabrica.png";
import academicOperationsIcon from "../assets/coordination-icons/Operación Académica.png";
import specializationsIcon from "../assets/coordination-icons/Especializaciones.png";
import saberProIcon from "../assets/coordination-icons/Saber Pro .png";
import socialOutreachIcon from "../assets/coordination-icons/proyección social.png";
import professionalDevelopmentIcon from "../assets/coordination-icons/Desarrollo profesional.png";
import serviceIcon from "../assets/coordination-icons/Servicio.png";
import engineeringSchoolIcon from "../assets/coordination-icons/Ingenierías.png";
import transversalSchoolIcon from "../assets/coordination-icons/Transversales.png";
import businessSchoolIcon from "../assets/coordination-icons/Negocios.png";
import fineArtsSchoolIcon from "../assets/coordination-icons/Bellas Artes.png";
import businessTransformationSchoolIcon from "../assets/coordination-icons/Transformación Empresarial.png";
import b2bIcon from "../assets/coordination-icons/B2B.png";
import directorOperationsIcon from "../assets/coordination-icons/DirectorOp.png";
import generalCoordinationIcon from "../assets/coordination-icons/CoordinacionGeneral.png";
import focaGifIcon from "../assets/coordination-icons/fabrica/FOCA_GIF.png";
import focaDevelopmentIcon from "../assets/coordination-icons/fabrica/FOCA_DESARROLLO.png";
import focaAnalystsIcon from "../assets/coordination-icons/fabrica/FOCA_ANALISTAS.png";
import focaMarketingIcon from "../assets/coordination-icons/fabrica/FOCA_MARKETING.png";
import type { OrgNode } from "../types";
import { orgNodeMatchesTarget } from "../utils/findNodeInTree";

export type CoordinationEmblemConfig = {
  icon: string;
  /** Canales RGB separados por espacios para rgb(var(...) / alpha). */
  glowColor: `${number} ${number} ${number}`;
  highlightColor: `${number} ${number} ${number}`;
  label: string;
  /** Reduce el halo para iconos cuyo arte fuente ya es muy luminoso. */
  softGlow?: boolean;
  /** Conserva el color del emblema aunque el nodo sea una vacante. */
  vacancyVisuals?: boolean;
  placement?:
    | "foreground"
    | "watermark"
    | "watermarkCorner"
    | "badge"
    | "roleInline"
    | "cornerSmall";
};

export const COORDINATION_EMBLEMS = {
  factory: {
    icon: factoryIcon,
    glowColor: "82 190 181",
    highlightColor: "213 255 248",
    label: "Fábrica y Desarrollo",
    placement: "watermark",
  },
  academicOperations: {
    icon: academicOperationsIcon,
    glowColor: "96 210 255",
    highlightColor: "220 246 255",
    label: "Operación Académica",
    placement: "watermark",
  },
  specializations: {
    icon: specializationsIcon,
    glowColor: "255 76 76",
    highlightColor: "255 226 226",
    label: "Escuela de Especializaciones",
    placement: "watermark",
  },
  saberPro: {
    icon: saberProIcon,
    glowColor: "190 242 60",
    highlightColor: "240 253 206",
    label: "Pruebas Saber",
    softGlow: true,
    placement: "watermark",
  },
  socialOutreach: {
    icon: socialOutreachIcon,
    glowColor: "74 222 128",
    highlightColor: "220 252 231",
    label: "Proyección Social",
    softGlow: true,
    placement: "watermark",
  },
  professionalDevelopment: {
    icon: professionalDevelopmentIcon,
    glowColor: "244 114 182",
    highlightColor: "252 231 243",
    label: "Desarrollo Profesional",
    softGlow: true,
    placement: "watermark",
  },
  service: {
    icon: serviceIcon,
    glowColor: "244 63 148",
    highlightColor: "252 231 243",
    label: "Servicio",
    softGlow: true,
    placement: "watermark",
  },
  engineeringSchool: {
    icon: engineeringSchoolIcon,
    glowColor: "188 76 0",
    highlightColor: "255 220 190",
    label: "Escuela de Ingenierías",
    placement: "watermark",
  },
  transversalSchool: {
    icon: transversalSchoolIcon,
    glowColor: "248 177 51",
    highlightColor: "255 237 194",
    label: "Escuela de Transversales",
    placement: "watermark",
  },
  businessSchool: {
    icon: businessSchoolIcon,
    glowColor: "215 80 44",
    highlightColor: "255 218 207",
    label: "Escuela de Negocios",
    placement: "watermark",
  },
  fineArtsSchool: {
    icon: fineArtsSchoolIcon,
    glowColor: "83 53 131",
    highlightColor: "225 214 255",
    label: "Escuela de Bellas Artes",
    placement: "watermark",
  },
  businessTransformationSchool: {
    icon: businessTransformationSchoolIcon,
    glowColor: "84 0 119",
    highlightColor: "235 207 255",
    label: "Escuela de Transformación Empresarial",
    placement: "watermark",
  },
  b2b: {
    icon: b2bIcon,
    glowColor: "239 68 68",
    highlightColor: "254 202 202",
    label: "Coordinación B2B",
    placement: "watermark",
  },
  directorOperations: {
    icon: directorOperationsIcon,
    glowColor: "16 185 129",
    highlightColor: "209 250 229",
    label: "Director de Operaciones",
    placement: "watermark",
  },
  generalCoordination: {
    icon: generalCoordinationIcon,
    glowColor: "245 158 11",
    highlightColor: "254 243 199",
    label: "Coordinación General",
    placement: "watermark",
  },
  factoryGif: {
    icon: focaGifIcon,
    glowColor: "113 148 113",
    highlightColor: "220 252 231",
    label: "Fábrica · GIF",
    softGlow: true,
    placement: "watermark",
  },
  factoryDevelopment: {
    icon: focaDevelopmentIcon,
    glowColor: "79 70 229",
    highlightColor: "224 231 255",
    label: "Fábrica · Desarrollo",
    placement: "watermark",
  },
  factoryAnalysts: {
    icon: focaAnalystsIcon,
    glowColor: "174 0 235",
    highlightColor: "243 232 255",
    label: "Fábrica · Analistas",
    softGlow: true,
    placement: "watermark",
    vacancyVisuals: true,
  },
  factoryMarketing: {
    icon: focaMarketingIcon,
    glowColor: "249 115 22",
    highlightColor: "255 237 213",
    label: "Fábrica · Marketing",
    softGlow: true,
    placement: "watermark",
  },
} as const satisfies Record<string, CoordinationEmblemConfig>;

function normalizePersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

/**
 * Identidad visual de una posición concreta (p. ej. la misma persona en un
 * segundo cargo). Se resuelve antes que el emblema por persona/id.
 */
export function resolveCoordinationEmblemFromAssignmentLabel(
  assignmentLabel: string | null | undefined,
): CoordinationEmblemConfig | null {
  const label = normalizePersonName(assignmentLabel ?? "");
  if (!label) return null;

  if (
    label.includes("ANALISTAS DE DISENO") ||
    label.includes("PRESENTADOR DE CONTENIDO") ||
    label.includes("REALIZADOR MULTIMEDIA") ||
    label.includes("SUBJEFE DE ANALISTAS")
  ) {
    return COORDINATION_EMBLEMS.factoryAnalysts;
  }

  return null;
}

/**
 * Resuelve el emblema de una coordinación por identidad organizacional estable.
 * El id identifica a la persona y el cargo actúa como protección ante reasignaciones.
 */
export function resolveCoordinationEmblem(
  node: Pick<OrgNode, "id" | "name" | "role" | "nodeKind" | "assignment_label">,
): CoordinationEmblemConfig | null {
  const fromAssignment = resolveCoordinationEmblemFromAssignmentLabel(
    node.assignment_label,
  );
  if (fromAssignment) return fromAssignment;

  const roleName = node.role?.name?.trim().toUpperCase() ?? "";
  const personName = normalizePersonName(node.name);

  if (personName === "IRON ALEXANDER FUENTES RODRIGUEZ") {
    return COORDINATION_EMBLEMS.directorOperations;
  }

  if (personName === "RAUL VALENCIA CIFUENTES") {
    return COORDINATION_EMBLEMS.generalCoordination;
  }

  if (personName === "SARA JULIANA MARTINEZ LOPEZ") {
    return COORDINATION_EMBLEMS.factoryGif;
  }

  if (personName === "JOHAN SEBASTIAN DAZA SARMIENTO") {
    return COORDINATION_EMBLEMS.factoryDevelopment;
  }

  if (personName === "FELIPE GUERRERO BUENAVENTURA") {
    return COORDINATION_EMBLEMS.factoryMarketing;
  }

  if (
    node.nodeKind === "vacancy" &&
    personName.includes("COORDINADOR FABRICA DE CONTENIDOS")
  ) {
    return COORDINATION_EMBLEMS.factoryAnalysts;
  }

  if (
    node.id === "49" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("FABRICA")
  ) {
    return COORDINATION_EMBLEMS.factory;
  }

  if (
    node.id === "1077" &&
    (roleName.includes("COODINADOR") || roleName.includes("COORDINADOR")) &&
    roleName.includes("OPERATIVO ACADEMICO")
  ) {
    return COORDINATION_EMBLEMS.academicOperations;
  }

  if (
    node.id === "1081" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE ESPECIALIZACIONES")
  ) {
    return COORDINATION_EMBLEMS.specializations;
  }

  if (
    node.id === "1192" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("PRUEBAS SABER")
  ) {
    return COORDINATION_EMBLEMS.saberPro;
  }

  if (
    node.id === "1193" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("PROYECCION SOCIAL")
  ) {
    return COORDINATION_EMBLEMS.socialOutreach;
  }

  if (
    node.id === "1352" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("DESARROLLO PROFESIONAL")
  ) {
    return COORDINATION_EMBLEMS.professionalDevelopment;
  }

  if (node.id === "1145" && roleName.includes("LIDER DE SERVICIO")) {
    return COORDINATION_EMBLEMS.service;
  }

  if (
    node.id === "601" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE INGENIERIA")
  ) {
    return COORDINATION_EMBLEMS.engineeringSchool;
  }

  if (
    node.id === "1078" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE TRANSVERSALES")
  ) {
    return COORDINATION_EMBLEMS.transversalSchool;
  }

  if (
    node.id === "1079" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE NEGOCIOS")
  ) {
    return COORDINATION_EMBLEMS.businessSchool;
  }

  if (
    node.id === "1080" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE BELLAS ARTES")
  ) {
    return COORDINATION_EMBLEMS.fineArtsSchool;
  }

  if (
    node.id === "1297" &&
    roleName.includes("COORDINADOR") &&
    roleName.includes("ESCUELA DE TRANSFORMACION EMPRESARIAL")
  ) {
    return COORDINATION_EMBLEMS.businessTransformationSchool;
  }

  if (
    roleName.includes("B2B") &&
    (roleName.includes("SUPERVISOR") || roleName.includes("COORDINADOR"))
  ) {
    return COORDINATION_EMBLEMS.b2b;
  }

  return null;
}

export type OrgNodeCoordinationContext = {
  /** Identidad propia o heredada del ancestro de coordinación más cercano. */
  identity: CoordinationEmblemConfig | null;
  /** Identidad efectiva del jefe inmediato dentro de la ruta visible. */
  managerIdentity: CoordinationEmblemConfig | null;
};

/**
 * Resuelve la identidad cromática de una persona dentro de un árbol visible.
 * Una coordinación declarada en el nodo reemplaza la heredada; sus descendientes
 * conservan esa identidad hasta encontrar una subcoordinación más específica.
 */
export function resolveNodeCoordinationContext(
  root: OrgNode,
  targetId: string,
  targetRelationId?: string | null,
): OrgNodeCoordinationContext | null {
  function visit(
    node: OrgNode,
    inheritedIdentity: CoordinationEmblemConfig | null,
  ): OrgNodeCoordinationContext | null {
    const identity = resolveCoordinationEmblem(node) ?? inheritedIdentity;

    if (orgNodeMatchesTarget(node, targetId, targetRelationId)) {
      return {
        identity,
        managerIdentity: inheritedIdentity,
      };
    }

    for (const child of node.children) {
      const resolved = visit(child, identity);
      if (resolved) return resolved;
    }

    return null;
  }

  return visit(root, null);
}
