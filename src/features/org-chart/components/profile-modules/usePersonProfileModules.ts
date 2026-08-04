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

/**
 * Si el activo no está en la lista visible → fallback a ficha.
 */
export function resolveActiveProfileModule(
  active: ProfileModuleCode,
  visible: readonly ProfileModuleDefinition[],
): ProfileModuleCode {
  if (visible.some((m) => m.code === active)) {
    return active;
  }
  return DEFAULT_PROFILE_MODULE;
}

export function profileModulesShowTablist(
  visible: readonly ProfileModuleDefinition[],
): boolean {
  return visible.length > 1;
}

/**
 * Hook de selección de módulo.
 * `personId` fuerza reset a ficha al cambiar de persona.
 */
export function usePersonProfileModules(
  personId: string,
  ctx: ProfileModuleVisibilityContext,
) {
  const visibleModules = useMemo(
    () => resolveVisibleProfileModules(ctx),
    [ctx.hasFullProfile, ctx.isVacancy, ctx.hasPresentation],
  );

  const [activeModule, setActiveModule] =
    useState<ProfileModuleCode>(DEFAULT_PROFILE_MODULE);
  const [boundPersonId, setBoundPersonId] = useState(personId);

  if (boundPersonId !== personId) {
    setBoundPersonId(personId);
    setActiveModule(DEFAULT_PROFILE_MODULE);
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
