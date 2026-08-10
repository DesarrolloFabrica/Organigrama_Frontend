/**
 * Resolución de módulos visibles y módulo activo del panel de persona.
 */
import { useMemo, useState } from "react";
import {
  DEFAULT_PROFILE_MODULE,
  PERSON_PROFILE_MODULE_DEFINITIONS,
  type ProfileModuleCode,
  type ProfileModuleDefinition,
  type ProfileModuleVisibilityContext,
} from "./profile-module.types";

export function resolveVisibleProfileModules(
  ctx: ProfileModuleVisibilityContext,
  definitions: readonly ProfileModuleDefinition[] = PERSON_PROFILE_MODULE_DEFINITIONS,
): ProfileModuleDefinition[] {
  return definitions
    .filter((def) => def.isAvailable(ctx))
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Primer módulo disponible por orden; null si la lista está vacía. */
export function firstAvailableModule(
  visible: readonly ProfileModuleDefinition[],
): ProfileModuleCode | null {
  return visible[0]?.code ?? null;
}

/**
 * Conserva `active` si sigue disponible; si no, cae al primer módulo visible.
 * No asume que `ficha` siempre exista.
 */
export function fallbackToAvailableModule(
  active: ProfileModuleCode,
  visible: readonly ProfileModuleDefinition[],
): ProfileModuleCode | null {
  if (visible.some((m) => m.code === active)) {
    return active;
  }
  return firstAvailableModule(visible);
}

/**
 * Si el activo no está en la lista visible → primer módulo disponible.
 * Si no hay módulos, conserva `DEFAULT_PROFILE_MODULE` como último recurso de tipo.
 */
export function resolveActiveProfileModule(
  active: ProfileModuleCode,
  visible: readonly ProfileModuleDefinition[],
): ProfileModuleCode {
  return (
    fallbackToAvailableModule(active, visible) ?? DEFAULT_PROFILE_MODULE
  );
}

/**
 * Tablist visible con 2+ módulos.
 * Un solo módulo (p. ej. solo Presentación o solo Ficha): sin tablist visual;
 * el contenido se muestra directo (consistencia con el diseño actual de un módulo).
 */
export function profileModulesShowTablist(
  visible: readonly ProfileModuleDefinition[],
): boolean {
  return visible.length > 1;
}

/**
 * Hook de selección de módulo.
 * Cambio de `personId` → reset al primer módulo disponible (estable).
 */
export function usePersonProfileModules(
  personId: string,
  ctx: ProfileModuleVisibilityContext,
) {
  const visibleModules = useMemo(
    () => resolveVisibleProfileModules(ctx),
    [ctx.hasFullProfile, ctx.isVacancy, ctx.hasPresentation],
  );

  const initialModule =
    firstAvailableModule(visibleModules) ?? DEFAULT_PROFILE_MODULE;

  const [activeModule, setActiveModule] =
    useState<ProfileModuleCode>(initialModule);
  const [boundPersonId, setBoundPersonId] = useState(personId);

  if (boundPersonId !== personId) {
    setBoundPersonId(personId);
    setActiveModule(
      firstAvailableModule(visibleModules) ?? DEFAULT_PROFILE_MODULE,
    );
  }

  const effectiveModule = resolveActiveProfileModule(
    activeModule,
    visibleModules,
  );

  if (effectiveModule !== activeModule) {
    setActiveModule(effectiveModule);
  }

  const showTablist = profileModulesShowTablist(visibleModules);

  return {
    visibleModules,
    activeModule: effectiveModule,
    setActiveModule,
    showTablist,
  };
}
