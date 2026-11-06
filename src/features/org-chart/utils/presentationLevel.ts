/**
 * Nivel visual del módulo Presentación (1–3). Solo cromática/decoración.
 *
 * Reutiliza la señal que ya colorea el mapa (`hierarchy.name`, ver
 * `resolveOrgMapVisualLevel`), sin el fallback por profundidad: la profundidad
 * depende del lienzo/versión y no identifica el nivel de la persona.
 * Docentes (L5 en el mapa) y niveles 4+ → `null` (marco base sin número).
 */
import type { OrgNodeHierarchy, OrgNodeRole } from "../types";
import { isOrgNodeDocenteRole } from "../types";
import { parseOrgHierarchyLevelNumber } from "./orgMapLevelTheme";

export type PresentationLevel = 1 | 2 | 3;

/** Nodo del árbol u otra fuente con jerarquía/rol (p. ej. ficha completa). */
export type PresentationLevelSource = {
  hierarchy?: OrgNodeHierarchy | null;
  role?: OrgNodeRole | null;
};

function isPresentationLevel(n: number): n is PresentationLevel {
  return n === 1 || n === 2 || n === 3;
}

/**
 * Primera fuente que declara nivel decide (orden = prioridad).
 * Recomendado: nodo seleccionado en el árbol (llega a cualquier viewer),
 * luego `profile` de la ficha completa (búsquedas fuera del árbol cargado).
 */
export function resolvePresentationLevel(
  sources: ReadonlyArray<PresentationLevelSource | null | undefined>,
): PresentationLevel | null {
  for (const source of sources) {
    if (!source) continue;
    if (isOrgNodeDocenteRole({ role: source.role ?? null })) return null;
    const level = parseOrgHierarchyLevelNumber(source.hierarchy?.name);
    if (level == null) continue;
    return isPresentationLevel(level) ? level : null;
  }
  return null;
}
