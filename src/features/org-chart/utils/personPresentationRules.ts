/**
 * Reglas puras del módulo Presentación (Fase 4B) — testeables sin DOM.
 */

import type { ProfileModuleCode } from "../components/profile-modules/profile-module.types";
import { isPersonVideoTicketFresh } from "./personVideoStreamUrl";

/** ¿Se puede lanzar el probe GET …/video? */
export function shouldProbePersonVideo(opts: {
  personId: string | null | undefined;
  hasFullProfile: boolean;
  isVacancy: boolean;
  panelOpen?: boolean;
}): boolean {
  if (!opts.personId) return false;
  if (opts.panelOpen === false) return false;
  return opts.hasFullProfile && !opts.isVacancy;
}

/**
 * Presentación visible solo con éxito + hasVideo.
 * Error de probe ≠ hasVideo false (ambos ocultan la pestaña).
 */
export function resolveHasPresentation(opts: {
  probeEnabled: boolean;
  probeSuccess: boolean;
  hasVideo: boolean | undefined;
}): boolean {
  return (
    opts.probeEnabled &&
    opts.probeSuccess &&
    opts.hasVideo === true
  );
}

/** Renovar ticket al entrar si falta vigencia (>15s de margen). */
export function shouldRefreshTicketOnEnter(
  expiresAtIso: string | null | undefined,
  skewSeconds = 15,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAtIso) return true;
  return !isPersonVideoTicketFresh(expiresAtIso, skewSeconds, nowMs);
}

/** Ancho desktop del overlay (px). Móvil no usa este valor. */
export function entityDetailOverlayWidthPx(
  activeModule: ProfileModuleCode | null,
): 420 | 600 {
  return activeModule === "presentacion" ? 600 : 420;
}

export function entityDetailOverlayWidthClass(
  activeModule: ProfileModuleCode | null,
): string {
  if (activeModule === "presentacion") {
    return "max-w-[600px] sm:w-[min(600px,calc(100vw-2rem))] transition-[max-width,width] duration-300 ease-out";
  }
  return "max-w-[420px] sm:w-[min(420px,calc(100vw-2rem))] transition-[max-width,width] duration-300 ease-out";
}

/** Máximo 1 reintento automático por montaje / persona. */
export function canAutoRetryVideoError(autoRetryUsed: boolean): boolean {
  return !autoRetryUsed;
}
