import type { CSSProperties } from "react";

import { getOrgMapLevelTheme } from "./orgMapLevelTheme";

export type RadarThemeLevel = 1 | 2 | 3 | 4 | 5;

const L1_PRIMARY_RGB = "34, 211, 238";

function hexToRgbTriplet(hex: string): string {
  const normalized = hex.trim().replace("#", "");
  if (normalized.length !== 6) {
    return L1_PRIMARY_RGB;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return L1_PRIMARY_RGB;
  }
  return `${r}, ${g}, ${b}`;
}

function rgba(rgb: string, alpha: number | string): string {
  return `rgba(${rgb}, ${alpha})`;
}

/**
 * Paleta del radar: mismos valores de opacidad / estructura SVG que el cyan original;
 * solo sustituye el matiz RGB según el nivel jerárquico (L1–L5).
 */
export function getRadarPalette(level: RadarThemeLevel) {
  const tokens = getOrgMapLevelTheme(level);
  const primary = hexToRgbTriplet(tokens.primary);
  const bright = hexToRgbTriplet(tokens.cornerAccent);

  return {
    svg: {
      fill95: rgba(primary, 0.035),
      fill230: rgba(primary, 0.018),
      stroke500: rgba(primary, 2),
      stroke800: rgba(primary, 1),
      stroke1500: rgba(primary, 50),
      stroke370: rgba(primary, 0.8),
      stroke155: rgba(bright, 0.8),
      stroke275: rgba(bright, 50),
      dotCenter: rgba(bright, 0.65),
      dotAccent: rgba(bright, 0.75),
    },
    cssVars: {
      "--radar-guide-line": rgba(primary, 0.8),
      "--radar-guide-shadow": rgba(primary, 0.25),
      "--radar-sweep-beam": rgba(bright, 1),
      "--radar-sweep-dot": rgba(bright, 0.92),
      "--radar-sweep-dot-shadow": rgba(bright, 0.4),
    } as CSSProperties,
  };
}
