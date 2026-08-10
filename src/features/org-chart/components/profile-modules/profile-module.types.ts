/**
 * Contrato de módulos del panel de detalle de persona.
 * Extensible sin plugin framework.
 */

import type { ReactNode } from "react";

export type ProfileModuleCode = "ficha" | "competencias" | "presentacion";

/** Contexto de visibilidad para filtrar pestañas. */
export type ProfileModuleVisibilityContext = {
  hasFullProfile: boolean;
  isVacancy: boolean;
  /** Resultado del probe `hasVideo` (éxito + true). */
  hasPresentation?: boolean;
};

export type ProfileModuleDefinition = {
  code: ProfileModuleCode;
  label: string;
  order: number;
  tabId: string;
  panelId: string;
  lazyLoad: boolean;
  unmountOnExit: boolean;
  isAvailable: (ctx: ProfileModuleVisibilityContext) => boolean;
};

/** Módulo resuelto listo para renderizar (solo disponibles). */
export type ResolvedProfileModule = {
  code: ProfileModuleCode;
  label: string;
  order: number;
  tabId: string;
  panelId: string;
  lazyLoad: boolean;
  unmountOnExit: boolean;
  render: () => ReactNode;
};

/**
 * Registro: Ficha, Competencias, Presentación (condicional).
 *
 * - Ficha: siempre (vista completa o pública mínima).
 * - Competencias: ficha completa y no vacante.
 * - Presentación: no vacante + hasPresentation (cualquier autenticado; sin hasFull).
 */
export const PERSON_PROFILE_MODULE_DEFINITIONS: readonly ProfileModuleDefinition[] =
  [
    {
      code: "ficha",
      label: "Ficha",
      order: 10,
      tabId: "person-tab-ficha",
      panelId: "person-panel-ficha",
      lazyLoad: false,
      unmountOnExit: false,
      isAvailable: () => true,
    },
    {
      code: "competencias",
      label: "Competencias",
      order: 20,
      tabId: "person-tab-competencias",
      panelId: "person-panel-competencias",
      lazyLoad: true,
      unmountOnExit: true,
      isAvailable: (ctx) => ctx.hasFullProfile && !ctx.isVacancy,
    },
    {
      code: "presentacion",
      label: "Presentación",
      order: 30,
      tabId: "person-tab-presentacion",
      panelId: "person-panel-presentacion",
      lazyLoad: true,
      unmountOnExit: true,
      isAvailable: (ctx) =>
        !ctx.isVacancy && ctx.hasPresentation === true,
    },
  ] as const;

/** Orden documentado (Presentación = 30). */
export const PROFILE_MODULE_ORDER: Record<ProfileModuleCode, number> = {
  ficha: 10,
  competencias: 20,
  presentacion: 30,
};

/** Preferencia inicial cuando Ficha está disponible. */
export const DEFAULT_PROFILE_MODULE: ProfileModuleCode = "ficha";
