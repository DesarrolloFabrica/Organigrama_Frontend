import factoryIcon from "../assets/coordination-icons/Fabrica.png";
import academicOperationsIcon from "../assets/coordination-icons/Operación Académica.png";
import specializationsIcon from "../assets/coordination-icons/Especializaciones.png";
import saberProIcon from "../assets/coordination-icons/Saber Pro .png";
import socialOutreachIcon from "../assets/coordination-icons/proyección social.png";
import professionalDevelopmentIcon from "../assets/coordination-icons/Desarrollo profesional.png";
import serviceIcon from "../assets/coordination-icons/Servicio.png";
import type { OrgNode } from "../types";

export type CoordinationEmblemConfig = {
  icon: string;
  /** Canales RGB separados por espacios para rgb(var(...) / alpha). */
  glowColor: `${number} ${number} ${number}`;
  highlightColor: `${number} ${number} ${number}`;
  label: string;
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
    placement: "cornerSmall",
  },
  academicOperations: {
    icon: academicOperationsIcon,
    glowColor: "96 210 255",
    highlightColor: "220 246 255",
    label: "Operación Académica",
    placement: "cornerSmall",
  },
  specializations: {
    icon: specializationsIcon,
    glowColor: "255 76 76",
    highlightColor: "255 226 226",
    label: "Escuela de Especializaciones",
    placement: "cornerSmall",
  },
  saberPro: {
    icon: saberProIcon,
    glowColor: "190 242 60",
    highlightColor: "240 253 206",
    label: "Pruebas Saber",
    placement: "cornerSmall",
  },
  socialOutreach: {
    icon: socialOutreachIcon,
    glowColor: "74 222 128",
    highlightColor: "220 252 231",
    label: "Proyección Social",
    placement: "cornerSmall",
  },
  professionalDevelopment: {
    icon: professionalDevelopmentIcon,
    glowColor: "244 114 182",
    highlightColor: "252 231 243",
    label: "Desarrollo Profesional",
    placement: "cornerSmall",
  },
  service: {
    icon: serviceIcon,
    glowColor: "244 63 148",
    highlightColor: "252 231 243",
    label: "Servicio",
    placement: "cornerSmall",
  },
} as const satisfies Record<string, CoordinationEmblemConfig>;

/**
 * Resuelve el emblema de una coordinación por identidad organizacional estable.
 * El id identifica a la persona y el cargo actúa como protección ante reasignaciones.
 */
export function resolveCoordinationEmblem(
  node: Pick<OrgNode, "id" | "role">,
): CoordinationEmblemConfig | null {
  const roleName = node.role?.name?.trim().toUpperCase() ?? "";

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

  return null;
}
