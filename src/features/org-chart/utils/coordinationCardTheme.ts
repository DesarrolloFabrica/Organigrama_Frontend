import type { CSSProperties } from "react";

export type CoordinationCardThemeIdentity = {
  glowColor: string;
  highlightColor?: string;
};

function rgb(channels: string, alpha?: number): string {
  return alpha === undefined
    ? `rgb(${channels})`
    : `rgb(${channels} / ${alpha})`;
}

/** Variables mínimas para bordes y estados de coordinación. */
export function coordinationCardAccentCssVars(
  identity: CoordinationCardThemeIdentity,
): CSSProperties {
  return {
    "--coordination-card-glow": identity.glowColor,
    "--coordination-card-highlight":
      identity.highlightColor ?? identity.glowColor,
  } as CSSProperties;
}

/**
 * Sustituye la paleta jerárquica de una tarjeta activa por la coordinación.
 * El nivel continúa mostrándose como información, pero deja de definir el color.
 */
export function coordinationCardThemeCssVars(
  identity: CoordinationCardThemeIdentity,
): CSSProperties {
  const glow = identity.glowColor;
  const highlight = identity.highlightColor ?? glow;

  return {
    ...coordinationCardAccentCssVars(identity),
    "--org-lvl-primary": rgb(glow),
    "--org-lvl-border": rgb(glow, 0.58),
    "--org-lvl-glow": rgb(glow, 0.24),
    "--org-lvl-edge-strong": rgb(glow, 0.54),
    "--org-lvl-edge-soft": rgb(glow, 0.3),
    "--org-lvl-shadow-card": `inset 0 0 24px ${rgb(glow, 0.07)}, 0 14px 36px rgb(0 0 0 / 0.4), 0 0 24px ${rgb(glow, 0.14)}`,
    "--org-lvl-shadow-card-hover": `inset 0 0 28px ${rgb(glow, 0.1)}, 0 16px 40px rgb(0 0 0 / 0.44), 0 0 30px ${rgb(glow, 0.2)}`,
    "--org-lvl-shadow-expanded": `inset 0 0 34px ${rgb(glow, 0.11)}, 0 18px 44px rgb(0 0 0 / 0.46), 0 0 34px ${rgb(glow, 0.22)}`,
    "--org-lvl-shadow-selected": `inset 0 0 32px ${rgb(glow, 0.13)}, 0 18px 46px rgb(0 0 0 / 0.46), 0 0 38px ${rgb(glow, 0.28)}`,
    "--org-lvl-hud-line": rgb(glow, 0.42),
    "--org-lvl-hud-glow": rgb(glow, 0.22),
    "--org-lvl-corner": rgb(highlight, 0.76),
    "--org-lvl-bottom-reader": rgb(glow, 0.62),
    "--org-lvl-ring": rgb(glow, 0.28),
    "--org-lvl-ring-outer": rgb(glow, 0.48),
    "--org-lvl-ring-inner": rgb(highlight, 0.34),
    "--org-lvl-orbit": rgb(glow, 0.46),
    "--org-lvl-core-mid": rgb(glow, 0.46),
    "--org-lvl-core-deep": rgb(glow, 0.18),
    "--org-lvl-core-border": rgb(highlight, 0.42),
    "--org-lvl-core-shadow": `inset 0 0 20px ${rgb(glow, 0.2)}, 0 0 24px ${rgb(glow, 0.24)}`,
    "--org-lvl-core-silhouette": `drop-shadow(0 0 7px ${rgb(glow, 0.48)})`,
    "--org-lvl-crosshair": rgb(highlight, 0.26),
    "--org-lvl-breathe-weak": `0 0 16px ${rgb(glow, 0.16)}`,
    "--org-lvl-breathe-strong": `0 0 28px ${rgb(glow, 0.28)}`,
    "--org-lvl-btn-border": rgb(glow, 0.34),
    "--org-lvl-btn-bg": rgb(glow, 0.08),
    "--org-lvl-btn-shadow": `inset 0 0 12px ${rgb(glow, 0.05)}`,
    "--org-lvl-btn-hover-bg": rgb(glow, 0.17),
    "--org-lvl-btn-hover-shadow": `inset 0 0 16px ${rgb(glow, 0.09)}, 0 0 16px ${rgb(glow, 0.14)}`,
    "--org-lvl-btn-focus": rgb(highlight, 0.66),
    "--org-lvl-btn-icon": rgb(highlight, 0.9),
    "--org-lvl-btn-icon-glow": rgb(glow, 0.38),
    "--org-lvl-btn-detail-border": rgb(glow, 0.4),
    "--org-lvl-btn-explore-border": rgb(glow, 0.5),
    "--org-lvl-btn-explore-bg": rgb(glow, 0.12),
    "--org-lvl-btn-explore-hover-border": rgb(highlight, 0.68),
    "--org-lvl-status-text": rgb(highlight, 0.9),
    "--org-lvl-status-glow": rgb(glow, 0.36),
    "--org-lvl-status-dot": rgb(highlight, 0.92),
    "--org-lvl-status-dot-shadow": `0 0 9px ${rgb(glow, 0.68)}`,
    "--org-lvl-name-glow": rgb(glow, 0.24),
    "--org-lvl-mini-border": rgb(glow, 0.38),
    "--org-lvl-mini-inset": rgb(highlight, 0.06),
    "--org-lvl-mini-shadow-hover": `inset 0 0 18px ${rgb(glow, 0.08)}, 0 0 20px ${rgb(glow, 0.13)}`,
    "--org-lvl-mini-avatar-border": rgb(glow, 0.46),
    "--org-lvl-mini-avatar-from": rgb(glow, 0.18),
    "--org-lvl-mini-avatar-to": rgb(glow, 0.07),
    "--org-lvl-mini-avatar-text": rgb(highlight, 0.9),
    "--org-lvl-mini-avatar-glow": rgb(glow, 0.2),
    "--org-lvl-mini-detail-border": rgb(glow, 0.4),
    "--org-lvl-mini-detail-text": rgb(highlight, 0.84),
    "--org-lvl-mini-detail-hover-border": rgb(highlight, 0.65),
    "--org-lvl-mini-detail-hover-bg": rgb(glow, 0.16),
    "--org-lvl-mini-explore-border": rgb(glow, 0.46),
    "--org-lvl-mini-explore-bg": rgb(glow, 0.11),
    "--org-lvl-mini-explore-hover-border": rgb(highlight, 0.68),
    "--org-lvl-mini-explore-hover-bg": rgb(glow, 0.18),
    "--org-lvl-mini-pulse": rgb(highlight, 0.92),
    "--org-lvl-mini-pulse-shadow": `0 0 8px ${rgb(glow, 0.64)}`,
    "--org-lvl-mini-active-label": rgb(highlight, 0.76),
    "--org-lvl-team-divider": rgb(glow, 0.3),
    "--org-lvl-team-heading": rgb(highlight, 0.68),
  } as CSSProperties;
}

/** Tinte tenue que identifica a los hermanos por la paleta de su padre. */
export function coordinationCardPassiveThemeCssVars(
  identity: CoordinationCardThemeIdentity,
): CSSProperties {
  const glow = identity.glowColor;
  const highlight = identity.highlightColor ?? glow;

  return {
    ...coordinationCardAccentCssVars(identity),
    "--org-lvl-primary": rgb(glow),
    "--org-lvl-border": rgb(glow, 0.3),
    "--org-lvl-glow": rgb(glow, 0.1),
    "--org-lvl-edge-strong": rgb(glow, 0.28),
    "--org-lvl-edge-soft": rgb(glow, 0.16),
    "--org-lvl-shadow-card": `inset 0 0 18px ${rgb(glow, 0.035)}, 0 12px 30px rgb(0 0 0 / 0.38), 0 0 16px ${rgb(glow, 0.07)}`,
    "--org-lvl-shadow-card-hover": `inset 0 0 22px ${rgb(glow, 0.055)}, 0 14px 34px rgb(0 0 0 / 0.42), 0 0 22px ${rgb(glow, 0.11)}`,
    "--org-lvl-hud-line": rgb(glow, 0.2),
    "--org-lvl-hud-glow": rgb(glow, 0.09),
    "--org-lvl-corner": rgb(highlight, 0.34),
    "--org-lvl-bottom-reader": rgb(glow, 0.28),
    "--org-lvl-ring": rgb(glow, 0.14),
    "--org-lvl-ring-outer": rgb(glow, 0.24),
    "--org-lvl-ring-inner": rgb(highlight, 0.17),
    "--org-lvl-orbit": rgb(glow, 0.22),
    "--org-lvl-core-mid": rgb(glow, 0.22),
    "--org-lvl-core-deep": rgb(glow, 0.08),
    "--org-lvl-core-border": rgb(highlight, 0.2),
    "--org-lvl-core-shadow": `inset 0 0 16px ${rgb(glow, 0.08)}, 0 0 16px ${rgb(glow, 0.1)}`,
    "--org-lvl-core-silhouette": `drop-shadow(0 0 5px ${rgb(glow, 0.2)})`,
    "--org-lvl-crosshair": rgb(highlight, 0.13),
    "--org-lvl-breathe-weak": `0 0 10px ${rgb(glow, 0.06)}`,
    "--org-lvl-breathe-strong": `0 0 17px ${rgb(glow, 0.11)}`,
    "--org-lvl-btn-border": rgb(glow, 0.2),
    "--org-lvl-btn-bg": rgb(glow, 0.04),
    "--org-lvl-btn-shadow": `inset 0 0 10px ${rgb(glow, 0.025)}`,
    "--org-lvl-btn-hover-bg": rgb(glow, 0.09),
    "--org-lvl-btn-hover-shadow": `inset 0 0 12px ${rgb(glow, 0.045)}, 0 0 10px ${rgb(glow, 0.07)}`,
    "--org-lvl-btn-focus": rgb(highlight, 0.4),
    "--org-lvl-btn-icon": rgb(highlight, 0.66),
    "--org-lvl-btn-icon-glow": rgb(glow, 0.16),
    "--org-lvl-btn-detail-border": rgb(glow, 0.23),
    "--org-lvl-btn-explore-border": rgb(glow, 0.28),
    "--org-lvl-btn-explore-bg": rgb(glow, 0.055),
    "--org-lvl-btn-explore-hover-border": rgb(highlight, 0.42),
    "--org-lvl-status-text": rgb(highlight, 0.64),
    "--org-lvl-status-glow": rgb(glow, 0.14),
    "--org-lvl-status-dot": rgb(highlight, 0.68),
    "--org-lvl-status-dot-shadow": `0 0 6px ${rgb(glow, 0.28)}`,
    "--org-lvl-name-glow": rgb(glow, 0.1),
    "--org-lvl-mini-border": rgb(glow, 0.24),
    "--org-lvl-mini-inset": rgb(highlight, 0.035),
    "--org-lvl-mini-shadow-hover": `inset 0 0 14px ${rgb(glow, 0.04)}, 0 0 14px ${rgb(glow, 0.07)}`,
    "--org-lvl-mini-avatar-border": rgb(glow, 0.28),
    "--org-lvl-mini-avatar-from": rgb(glow, 0.1),
    "--org-lvl-mini-avatar-to": rgb(glow, 0.035),
    "--org-lvl-mini-avatar-text": rgb(highlight, 0.7),
    "--org-lvl-mini-avatar-glow": rgb(glow, 0.09),
    "--org-lvl-mini-detail-border": rgb(glow, 0.24),
    "--org-lvl-mini-detail-text": rgb(highlight, 0.68),
    "--org-lvl-mini-detail-hover-border": rgb(highlight, 0.4),
    "--org-lvl-mini-detail-hover-bg": rgb(glow, 0.09),
    "--org-lvl-mini-explore-border": rgb(glow, 0.28),
    "--org-lvl-mini-explore-bg": rgb(glow, 0.055),
    "--org-lvl-mini-explore-hover-border": rgb(highlight, 0.42),
    "--org-lvl-mini-explore-hover-bg": rgb(glow, 0.1),
    "--org-lvl-mini-pulse": rgb(highlight, 0.7),
    "--org-lvl-mini-pulse-shadow": `0 0 5px ${rgb(glow, 0.26)}`,
    "--org-lvl-mini-active-label": rgb(highlight, 0.58),
    "--org-lvl-team-divider": rgb(glow, 0.16),
    "--org-lvl-team-heading": rgb(highlight, 0.42),
  } as CSSProperties;
}
