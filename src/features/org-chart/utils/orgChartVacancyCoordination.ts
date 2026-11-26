import {
  resolveCoordinationEmblem,
  type CoordinationEmblemConfig,
} from "../config/coordinationEmblems";
import type { OrgChartVacancy, OrgNode, OrgSummaryItem } from "../types";

/** Emblema por persona (cabeza de coordinación) con la lógica del mapa. */
export type CoordinationEmblemIndex = ReadonlyMap<
  string,
  CoordinationEmblemConfig
>;

/**
 * Índice persona → emblema con el MISMO resolver que usa el mapa
 * (`resolveCoordinationEmblem`): el árbol cargado (con los cargos que ve el
 * usuario) y, como respaldo, las filas del resumen del nodo actual (para la
 * Coordinación General, sus reportes directos son las cabezas).
 */
export function buildCoordinationEmblemIndex(sources: {
  tree?: OrgNode | null;
  summaryItems?: readonly OrgSummaryItem[];
}): CoordinationEmblemIndex {
  const index = new Map<string, CoordinationEmblemConfig>();

  const seen = new Set<OrgNode>();
  const visit = (node: OrgNode) => {
    if (seen.has(node)) return;
    seen.add(node);
    if (!index.has(node.id)) {
      const emblem = resolveCoordinationEmblem(node);
      if (emblem) index.set(node.id, emblem);
    }
    for (const child of node.children ?? []) visit(child);
  };
  if (sources.tree) visit(sources.tree);

  for (const item of sources.summaryItems ?? []) {
    if (index.has(item.id)) continue;
    const emblem = resolveCoordinationEmblem({
      id: item.id,
      name: item.name,
      nodeKind: item.nodeKind,
      role: item.roleName
        ? { id: "", name: item.roleName, description: null }
        : null,
      assignment_label: null,
    });
    if (emblem) index.set(item.id, emblem);
  }
  return index;
}

/** Nombre de área legible: «PROYECCION SOCIAL» → «Proyección social». */
function formatAreaName(areaName: string): string {
  const trimmed = areaName.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const lower = trimmed.toLocaleLowerCase("es");
  return lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
}

export type VacancyCoordinationBadge = {
  /** Emblema de la coordinación; null si no se pudo resolver. */
  emblem: CoordinationEmblemConfig | null;
  /** Nombre visible del grupo. */
  label: string;
  kind: "coordination" | "direction";
};

/**
 * Emblema y nombre de la coordinación de una requisición. `null` si el
 * backend no la asoció a ningún grupo (área sin cabeza o sin área).
 */
export function resolveVacancyCoordinationBadge(
  vacancy: Pick<OrgChartVacancy, "coordination">,
  emblems: CoordinationEmblemIndex,
): VacancyCoordinationBadge | null {
  const group = vacancy.coordination;
  if (!group) return null;
  const emblem =
    group.headPersonIds
      .map((id) => emblems.get(id))
      .find((e): e is CoordinationEmblemConfig => Boolean(e)) ?? null;
  // La Dirección se nombra por su área (su emblema es el de la raíz).
  const label =
    group.kind === "coordination" && emblem
      ? emblem.label
      : formatAreaName(group.areaName) ||
        (group.kind === "direction" ? "Dirección" : "Coordinación");
  return { emblem, label, kind: group.kind };
}

/**
 * Orden del listado cuando hay varias coordinaciones: agrupa por
 * coordinación (alfabético), las sin grupo al final; dentro de cada grupo
 * conserva el orden del backend (más recientes primero).
 */
export function sortVacanciesByCoordination<T extends OrgChartVacancy>(
  items: readonly T[],
  emblems: CoordinationEmblemIndex,
): T[] {
  const keyed = items.map((item, position) => ({
    item,
    position,
    label: resolveVacancyCoordinationBadge(item, emblems)?.label ?? null,
  }));
  keyed.sort((a, b) => {
    if (a.label !== b.label) {
      if (a.label === null) return 1;
      if (b.label === null) return -1;
      return a.label.localeCompare(b.label, "es");
    }
    return a.position - b.position;
  });
  return keyed.map((k) => k.item);
}
