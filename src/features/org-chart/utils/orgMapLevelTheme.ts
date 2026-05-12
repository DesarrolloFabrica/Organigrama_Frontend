import type { CSSProperties } from "react";

import type { OrgNode } from "../types";

/**
 * Tema cromático por capa jerárquica (holográfico corporativo).
 * Los valores se inyectan como custom properties en `.org-map-holo` / mini-cards.
 */
export type OrgMapLevelThemeTokens = {
  primary: string;
  border: string;
  glow: string;
  /** Borde principal del módulo (rgba) */
  edgeStrong: string;
  edgeSoft: string;
  /** Sombras de tarjeta (valor completo para box-shadow) */
  shadowCard: string;
  shadowCardHover: string;
  shadowExpanded: string;
  shadowSelected: string;
  /** Capas ::before / HUD lines */
  hudLine: string;
  hudGlow: string;
  cornerAccent: string;
  bottomReader: string;
  /** Núcleo y anillos */
  nucleusFilter: string;
  ringDefault: string;
  ringOuter: string;
  ringInner: string;
  orbitDash: string;
  coreGradientMid: string;
  coreGradientDeep: string;
  coreBorder: string;
  coreShadow: string;
  coreSilhouette: string;
  crosshair: string;
  /** Animación núcleo (dos paradas) */
  breatheWeak: string;
  breatheStrong: string;
  /** Botones base */
  btnBorder: string;
  btnBg: string;
  btnShadow: string;
  btnHoverBg: string;
  btnHoverShadow: string;
  btnFocusRing: string;
  btnIcon: string;
  btnIconGlow: string;
  /** Detalle: tinte neutro mezclado con el nivel */
  btnDetailBorder: string;
  /** Explorar: acento secundario (misma familia cromática, más cálido) */
  btnExploreBorder: string;
  btnExploreBg: string;
  btnExploreHoverBorder: string;
  /** Estado ACTIVO (no sustituye el nivel; refuerzo) */
  statusText: string;
  statusGlow: string;
  statusDot: string;
  statusDotShadow: string;
  /** Nombre — halo tipográfico sutil */
  nameGlow: string;
  /** Aristas React Flow hacia este nivel */
  edgeStroke: string;
  edgeMarker: string;
  /** Filtro drop-shadow del wrapper del nodo en RF */
  nodeDropShadow: string;
  /** Mini-card (equipo interno) */
  miniBorder: string;
  miniInset: string;
  miniShadowHover: string;
  miniAvatarBorder: string;
  miniAvatarBgFrom: string;
  miniAvatarBgTo: string;
  miniAvatarText: string;
  miniAvatarGlow: string;
  miniDetailBorder: string;
  miniDetailText: string;
  miniDetailHoverBorder: string;
  miniDetailHoverBg: string;
  miniExploreBorder: string;
  miniExploreBg: string;
  miniExploreHoverBorder: string;
  miniExploreHoverBg: string;
  miniPulse: string;
  miniPulseShadow: string;
  miniActiveLabel: string;
  teamDivider: string;
  teamHeading: string;
};

const L1: OrgMapLevelThemeTokens = {
  primary: "#5ee9f0",
  border: "#7ef1f7",
  glow: "rgba(94, 233, 240, 0.32)",
  edgeStrong: "rgba(94, 233, 240, 0.48)",
  edgeSoft: "rgba(94, 233, 240, 0.22)",
  shadowCard: `0 0 0 1px rgba(94, 233, 240, 0.2), 0 0 18px rgba(94, 233, 240, 0.12), 0 0 32px rgba(59, 130, 246, 0.1), 0 0 42px rgba(94, 233, 240, 0.08), 0 18px 48px rgba(0, 0, 0, 0.55)`,
  shadowCardHover: `0 0 0 1px rgba(125, 211, 252, 0.18) inset, 0 0 32px rgba(94, 233, 240, 0.14), 0 26px 48px rgba(0, 0, 0, 0.46)`,
  shadowExpanded: `0 0 0 1px rgba(94, 233, 240, 0.2) inset, 0 0 28px rgba(94, 233, 240, 0.14), 0 22px 44px rgba(0, 0, 0, 0.48)`,
  shadowSelected: `0 0 0 1px rgba(255, 255, 255, 0.12) inset, 0 0 0 2px rgba(94, 233, 240, 0.32), 0 0 40px rgba(94, 233, 240, 0.2), 0 24px 56px rgba(0, 0, 0, 0.5)`,
  hudLine: "rgba(94, 233, 240, 0.38)",
  hudGlow: "rgba(94, 233, 240, 0.28)",
  cornerAccent: "#7ef1f7",
  bottomReader: "rgba(94, 233, 240, 0.92)",
  nucleusFilter: `drop-shadow(0 0 10px rgba(94, 233, 240, 0.28)) drop-shadow(0 0 22px rgba(94, 233, 240, 0.14))`,
  ringDefault: "rgba(94, 233, 240, 0.32)",
  ringOuter: "rgba(186, 245, 250, 0.42)",
  ringInner: "rgba(94, 233, 240, 0.14)",
  orbitDash: "rgba(165, 243, 252, 0.62)",
  coreGradientMid: "rgba(103, 232, 249, 0.88)",
  coreGradientDeep: "rgba(59, 130, 246, 0.38)",
  coreBorder: "rgba(165, 243, 252, 0.22)",
  coreShadow: `0 0 16px rgba(94, 233, 240, 0.45), 0 0 40px rgba(94, 233, 240, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.16)`,
  coreSilhouette: `drop-shadow(0 0 6px rgba(94, 233, 240, 0.65)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.32))`,
  crosshair: "rgba(94, 233, 240, 0.09)",
  breatheWeak: `0 0 14px rgba(94, 233, 240, 0.16), inset 0 0 18px rgba(56, 189, 248, 0.1)`,
  breatheStrong: `0 0 22px rgba(94, 233, 240, 0.26), inset 0 0 24px rgba(56, 189, 248, 0.16)`,
  btnBorder: "rgba(94, 233, 240, 0.28)",
  btnBg: `linear-gradient(180deg, rgba(8, 47, 73, 0.38), rgba(2, 6, 23, 0.72))`,
  btnShadow: `inset 0 0 14px rgba(94, 233, 240, 0.08), 0 0 12px rgba(94, 233, 240, 0.08)`,
  btnHoverBg: `linear-gradient(180deg, rgba(94, 233, 240, 0.14), rgba(8, 47, 73, 0.58))`,
  btnHoverShadow: `inset 0 0 18px rgba(94, 233, 240, 0.14), 0 0 18px rgba(94, 233, 240, 0.2)`,
  btnFocusRing: "rgba(94, 233, 240, 0.42)",
  btnIcon: "#a5f3fc",
  btnIconGlow: "rgba(94, 233, 240, 0.42)",
  btnDetailBorder: "rgba(148, 163, 184, 0.24)",
  btnExploreBorder: "rgba(52, 211, 153, 0.32)",
  btnExploreBg: `linear-gradient(180deg, rgba(6, 78, 59, 0.32) 0%, rgba(2, 44, 34, 0.42) 100%)`,
  btnExploreHoverBorder: "rgba(52, 211, 153, 0.52)",
  statusText: "rgba(186, 245, 250, 0.95)",
  statusGlow: "rgba(94, 233, 240, 0.28)",
  statusDot: "#7ef1f7",
  statusDotShadow: `0 0 8px rgba(94, 233, 240, 0.55), 0 0 16px rgba(94, 233, 240, 0.2)`,
  nameGlow: "rgba(94, 233, 240, 0.12)",
  edgeStroke: "rgba(94, 233, 240, 0.42)",
  edgeMarker: "rgba(94, 233, 240, 0.52)",
  nodeDropShadow: `drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(94, 233, 240, 0.14))`,
  miniBorder: "rgba(94, 233, 240, 0.14)",
  miniInset: "rgba(94, 233, 240, 0.06)",
  miniShadowHover: "0 0 18px rgba(94, 233, 240, 0.12)",
  miniAvatarBorder: "rgba(94, 233, 240, 0.22)",
  miniAvatarBgFrom: "rgba(8, 47, 73, 0.75)",
  miniAvatarBgTo: "rgba(2, 6, 23, 0.88)",
  miniAvatarText: "rgba(207, 250, 254, 0.9)",
  miniAvatarGlow: "rgba(94, 233, 240, 0.1)",
  miniDetailBorder: "rgba(94, 233, 240, 0.26)",
  miniDetailText: "rgba(207, 250, 254, 0.88)",
  miniDetailHoverBorder: "rgba(94, 233, 240, 0.48)",
  miniDetailHoverBg: "rgba(8, 47, 73, 0.38)",
  miniExploreBorder: "rgba(52, 211, 153, 0.32)",
  miniExploreBg: "rgba(6, 78, 59, 0.32)",
  miniExploreHoverBorder: "rgba(52, 211, 153, 0.5)",
  miniExploreHoverBg: "rgba(6, 78, 59, 0.48)",
  miniPulse: "rgba(94, 233, 240, 0.88)",
  miniPulseShadow: "rgba(94, 233, 240, 0.45)",
  miniActiveLabel: "rgba(186, 245, 250, 0.78)",
  teamDivider: "rgba(94, 233, 240, 0.26)",
  teamHeading: "rgba(94, 233, 240, 0.55)",
};

const L2: OrgMapLevelThemeTokens = {
  primary: "#34f5b5",
  border: "#5ff7c8",
  glow: "rgba(52, 245, 181, 0.28)",
  edgeStrong: "rgba(52, 245, 181, 0.44)",
  edgeSoft: "rgba(52, 245, 181, 0.2)",
  shadowCard: `0 0 0 1px rgba(52, 245, 181, 0.18), 0 0 18px rgba(52, 245, 181, 0.1), 0 0 32px rgba(16, 185, 129, 0.08), 0 0 42px rgba(52, 245, 181, 0.06), 0 18px 48px rgba(0, 0, 0, 0.55)`,
  shadowCardHover: `0 0 0 1px rgba(110, 231, 183, 0.16) inset, 0 0 32px rgba(52, 245, 181, 0.12), 0 26px 48px rgba(0, 0, 0, 0.46)`,
  shadowExpanded: `0 0 0 1px rgba(52, 245, 181, 0.18) inset, 0 0 28px rgba(52, 245, 181, 0.12), 0 22px 44px rgba(0, 0, 0, 0.48)`,
  shadowSelected: `0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 2px rgba(52, 245, 181, 0.3), 0 0 40px rgba(52, 245, 181, 0.18), 0 24px 56px rgba(0, 0, 0, 0.5)`,
  hudLine: "rgba(52, 245, 181, 0.34)",
  hudGlow: "rgba(52, 245, 181, 0.24)",
  cornerAccent: "#5ff7c8",
  bottomReader: "rgba(52, 245, 181, 0.9)",
  nucleusFilter: `drop-shadow(0 0 10px rgba(52, 245, 181, 0.26)) drop-shadow(0 0 22px rgba(16, 185, 129, 0.12))`,
  ringDefault: "rgba(52, 245, 181, 0.3)",
  ringOuter: "rgba(167, 243, 208, 0.4)",
  ringInner: "rgba(52, 245, 181, 0.12)",
  orbitDash: "rgba(167, 243, 208, 0.58)",
  coreGradientMid: "rgba(110, 231, 183, 0.88)",
  coreGradientDeep: "rgba(5, 150, 105, 0.36)",
  coreBorder: "rgba(167, 243, 208, 0.22)",
  coreShadow: `0 0 16px rgba(52, 245, 181, 0.42), 0 0 40px rgba(52, 245, 181, 0.16), inset 0 0 18px rgba(255, 255, 255, 0.14)`,
  coreSilhouette: `drop-shadow(0 0 6px rgba(52, 245, 181, 0.58)) drop-shadow(0 0 12px rgba(16, 185, 129, 0.28))`,
  crosshair: "rgba(52, 245, 181, 0.08)",
  breatheWeak: `0 0 14px rgba(52, 245, 181, 0.14), inset 0 0 18px rgba(16, 185, 129, 0.09)`,
  breatheStrong: `0 0 22px rgba(52, 245, 181, 0.22), inset 0 0 24px rgba(16, 185, 129, 0.14)`,
  btnBorder: "rgba(52, 245, 181, 0.26)",
  btnBg: `linear-gradient(180deg, rgba(6, 78, 59, 0.4), rgba(2, 24, 18, 0.75))`,
  btnShadow: `inset 0 0 14px rgba(52, 245, 181, 0.07), 0 0 12px rgba(52, 245, 181, 0.07)`,
  btnHoverBg: `linear-gradient(180deg, rgba(52, 245, 181, 0.12), rgba(6, 78, 59, 0.55))`,
  btnHoverShadow: `inset 0 0 18px rgba(52, 245, 181, 0.12), 0 0 18px rgba(52, 245, 181, 0.18)`,
  btnFocusRing: "rgba(52, 245, 181, 0.4)",
  btnIcon: "#a7f3d0",
  btnIconGlow: "rgba(52, 245, 181, 0.38)",
  btnDetailBorder: "rgba(148, 163, 184, 0.22)",
  btnExploreBorder: "rgba(45, 212, 191, 0.34)",
  btnExploreBg: `linear-gradient(180deg, rgba(6, 95, 70, 0.34) 0%, rgba(2, 44, 34, 0.44) 100%)`,
  btnExploreHoverBorder: "rgba(45, 212, 191, 0.52)",
  statusText: "rgba(209, 250, 229, 0.95)",
  statusGlow: "rgba(52, 245, 181, 0.26)",
  statusDot: "#5ff7c8",
  statusDotShadow: `0 0 8px rgba(52, 245, 181, 0.5), 0 0 16px rgba(52, 245, 181, 0.18)`,
  nameGlow: "rgba(52, 245, 181, 0.1)",
  edgeStroke: "rgba(52, 245, 181, 0.38)",
  edgeMarker: "rgba(52, 245, 181, 0.48)",
  nodeDropShadow: `drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(52, 245, 181, 0.12))`,
  miniBorder: "rgba(52, 245, 181, 0.12)",
  miniInset: "rgba(52, 245, 181, 0.05)",
  miniShadowHover: "0 0 18px rgba(52, 245, 181, 0.1)",
  miniAvatarBorder: "rgba(52, 245, 181, 0.2)",
  miniAvatarBgFrom: "rgba(6, 78, 59, 0.72)",
  miniAvatarBgTo: "rgba(2, 6, 23, 0.88)",
  miniAvatarText: "rgba(209, 250, 229, 0.9)",
  miniAvatarGlow: "rgba(52, 245, 181, 0.09)",
  miniDetailBorder: "rgba(52, 245, 181, 0.24)",
  miniDetailText: "rgba(209, 250, 229, 0.86)",
  miniDetailHoverBorder: "rgba(52, 245, 181, 0.44)",
  miniDetailHoverBg: "rgba(6, 78, 59, 0.36)",
  miniExploreBorder: "rgba(45, 212, 191, 0.3)",
  miniExploreBg: "rgba(6, 95, 70, 0.3)",
  miniExploreHoverBorder: "rgba(45, 212, 191, 0.48)",
  miniExploreHoverBg: "rgba(6, 95, 70, 0.44)",
  miniPulse: "rgba(52, 245, 181, 0.85)",
  miniPulseShadow: "rgba(52, 245, 181, 0.4)",
  miniActiveLabel: "rgba(209, 250, 229, 0.75)",
  teamDivider: "rgba(52, 245, 181, 0.24)",
  teamHeading: "rgba(52, 245, 181, 0.52)",
};

const L3: OrgMapLevelThemeTokens = {
  primary: "#f0d060",
  border: "#f5de8a",
  glow: "rgba(240, 208, 96, 0.26)",
  edgeStrong: "rgba(240, 208, 96, 0.42)",
  edgeSoft: "rgba(240, 208, 96, 0.2)",
  shadowCard: `0 0 0 1px rgba(240, 208, 96, 0.18), 0 0 18px rgba(240, 208, 96, 0.1), 0 0 32px rgba(202, 138, 4, 0.08), 0 0 42px rgba(240, 208, 96, 0.06), 0 18px 48px rgba(0, 0, 0, 0.55)`,
  shadowCardHover: `0 0 0 1px rgba(253, 224, 71, 0.14) inset, 0 0 32px rgba(240, 208, 96, 0.12), 0 26px 48px rgba(0, 0, 0, 0.46)`,
  shadowExpanded: `0 0 0 1px rgba(240, 208, 96, 0.16) inset, 0 0 28px rgba(240, 208, 96, 0.12), 0 22px 44px rgba(0, 0, 0, 0.48)`,
  shadowSelected: `0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 2px rgba(240, 208, 96, 0.28), 0 0 40px rgba(240, 208, 96, 0.16), 0 24px 56px rgba(0, 0, 0, 0.5)`,
  hudLine: "rgba(240, 208, 96, 0.32)",
  hudGlow: "rgba(240, 208, 96, 0.22)",
  cornerAccent: "#f5de8a",
  bottomReader: "rgba(240, 208, 96, 0.9)",
  nucleusFilter: `drop-shadow(0 0 10px rgba(240, 208, 96, 0.24)) drop-shadow(0 0 22px rgba(202, 138, 4, 0.1))`,
  ringDefault: "rgba(240, 208, 96, 0.28)",
  ringOuter: "rgba(253, 230, 138, 0.38)",
  ringInner: "rgba(240, 208, 96, 0.12)",
  orbitDash: "rgba(253, 224, 71, 0.55)",
  coreGradientMid: "rgba(253, 224, 71, 0.85)",
  coreGradientDeep: "rgba(180, 83, 9, 0.34)",
  coreBorder: "rgba(253, 230, 138, 0.22)",
  coreShadow: `0 0 16px rgba(240, 208, 96, 0.4), 0 0 40px rgba(240, 208, 96, 0.14), inset 0 0 18px rgba(255, 255, 255, 0.14)`,
  coreSilhouette: `drop-shadow(0 0 6px rgba(240, 208, 96, 0.52)) drop-shadow(0 0 12px rgba(202, 138, 4, 0.26))`,
  crosshair: "rgba(240, 208, 96, 0.08)",
  breatheWeak: `0 0 14px rgba(240, 208, 96, 0.12), inset 0 0 18px rgba(202, 138, 4, 0.08)`,
  breatheStrong: `0 0 22px rgba(240, 208, 96, 0.2), inset 0 0 24px rgba(202, 138, 4, 0.12)`,
  btnBorder: "rgba(240, 208, 96, 0.26)",
  btnBg: `linear-gradient(180deg, rgba(66, 32, 6, 0.42), rgba(24, 12, 2, 0.75))`,
  btnShadow: `inset 0 0 14px rgba(240, 208, 96, 0.07), 0 0 12px rgba(240, 208, 96, 0.07)`,
  btnHoverBg: `linear-gradient(180deg, rgba(240, 208, 96, 0.12), rgba(66, 32, 6, 0.52))`,
  btnHoverShadow: `inset 0 0 18px rgba(240, 208, 96, 0.12), 0 0 18px rgba(240, 208, 96, 0.16)`,
  btnFocusRing: "rgba(240, 208, 96, 0.38)",
  btnIcon: "#fde68a",
  btnIconGlow: "rgba(240, 208, 96, 0.36)",
  btnDetailBorder: "rgba(148, 163, 184, 0.22)",
  btnExploreBorder: "rgba(250, 204, 21, 0.34)",
  btnExploreBg: `linear-gradient(180deg, rgba(66, 32, 6, 0.36) 0%, rgba(24, 12, 2, 0.48) 100%)`,
  btnExploreHoverBorder: "rgba(250, 204, 21, 0.5)",
  statusText: "rgba(254, 243, 199, 0.95)",
  statusGlow: "rgba(240, 208, 96, 0.24)",
  statusDot: "#f5de8a",
  statusDotShadow: `0 0 8px rgba(240, 208, 96, 0.48), 0 0 16px rgba(240, 208, 96, 0.16)`,
  nameGlow: "rgba(240, 208, 96, 0.1)",
  edgeStroke: "rgba(240, 208, 96, 0.36)",
  edgeMarker: "rgba(240, 208, 96, 0.46)",
  nodeDropShadow: `drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(240, 208, 96, 0.12))`,
  miniBorder: "rgba(240, 208, 96, 0.12)",
  miniInset: "rgba(240, 208, 96, 0.05)",
  miniShadowHover: "0 0 18px rgba(240, 208, 96, 0.1)",
  miniAvatarBorder: "rgba(240, 208, 96, 0.2)",
  miniAvatarBgFrom: "rgba(66, 32, 6, 0.7)",
  miniAvatarBgTo: "rgba(2, 6, 23, 0.88)",
  miniAvatarText: "rgba(254, 243, 199, 0.9)",
  miniAvatarGlow: "rgba(240, 208, 96, 0.09)",
  miniDetailBorder: "rgba(240, 208, 96, 0.24)",
  miniDetailText: "rgba(254, 243, 199, 0.86)",
  miniDetailHoverBorder: "rgba(240, 208, 96, 0.42)",
  miniDetailHoverBg: "rgba(66, 32, 6, 0.36)",
  miniExploreBorder: "rgba(250, 204, 21, 0.3)",
  miniExploreBg: "rgba(66, 32, 6, 0.3)",
  miniExploreHoverBorder: "rgba(250, 204, 21, 0.46)",
  miniExploreHoverBg: "rgba(66, 32, 6, 0.42)",
  miniPulse: "rgba(240, 208, 96, 0.85)",
  miniPulseShadow: "rgba(240, 208, 96, 0.38)",
  miniActiveLabel: "rgba(254, 243, 199, 0.75)",
  teamDivider: "rgba(240, 208, 96, 0.22)",
  teamHeading: "rgba(240, 208, 96, 0.5)",
};

const L4: OrgMapLevelThemeTokens = {
  primary: "#c49cff",
  border: "#d9b8ff",
  glow: "rgba(196, 156, 255, 0.26)",
  edgeStrong: "rgba(196, 156, 255, 0.42)",
  edgeSoft: "rgba(196, 156, 255, 0.2)",
  shadowCard: `0 0 0 1px rgba(196, 156, 255, 0.18), 0 0 18px rgba(196, 156, 255, 0.1), 0 0 32px rgba(124, 58, 237, 0.08), 0 0 42px rgba(196, 156, 255, 0.06), 0 18px 48px rgba(0, 0, 0, 0.55)`,
  shadowCardHover: `0 0 0 1px rgba(221, 214, 254, 0.14) inset, 0 0 32px rgba(196, 156, 255, 0.12), 0 26px 48px rgba(0, 0, 0, 0.46)`,
  shadowExpanded: `0 0 0 1px rgba(196, 156, 255, 0.16) inset, 0 0 28px rgba(196, 156, 255, 0.12), 0 22px 44px rgba(0, 0, 0, 0.48)`,
  shadowSelected: `0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 2px rgba(196, 156, 255, 0.28), 0 0 40px rgba(196, 156, 255, 0.16), 0 24px 56px rgba(0, 0, 0, 0.5)`,
  hudLine: "rgba(196, 156, 255, 0.32)",
  hudGlow: "rgba(196, 156, 255, 0.22)",
  cornerAccent: "#d9b8ff",
  bottomReader: "rgba(196, 156, 255, 0.9)",
  nucleusFilter: `drop-shadow(0 0 10px rgba(196, 156, 255, 0.24)) drop-shadow(0 0 22px rgba(124, 58, 237, 0.1))`,
  ringDefault: "rgba(196, 156, 255, 0.28)",
  ringOuter: "rgba(221, 214, 254, 0.38)",
  ringInner: "rgba(196, 156, 255, 0.12)",
  orbitDash: "rgba(221, 214, 254, 0.55)",
  coreGradientMid: "rgba(196, 181, 253, 0.88)",
  coreGradientDeep: "rgba(91, 33, 182, 0.36)",
  coreBorder: "rgba(221, 214, 254, 0.22)",
  coreShadow: `0 0 16px rgba(196, 156, 255, 0.4), 0 0 40px rgba(196, 156, 255, 0.14), inset 0 0 18px rgba(255, 255, 255, 0.14)`,
  coreSilhouette: `drop-shadow(0 0 6px rgba(196, 156, 255, 0.52)) drop-shadow(0 0 12px rgba(124, 58, 237, 0.26))`,
  crosshair: "rgba(196, 156, 255, 0.08)",
  breatheWeak: `0 0 14px rgba(196, 156, 255, 0.12), inset 0 0 18px rgba(124, 58, 237, 0.08)`,
  breatheStrong: `0 0 22px rgba(196, 156, 255, 0.2), inset 0 0 24px rgba(124, 58, 237, 0.12)`,
  btnBorder: "rgba(196, 156, 255, 0.26)",
  btnBg: `linear-gradient(180deg, rgba(46, 16, 101, 0.42), rgba(15, 23, 42, 0.78))`,
  btnShadow: `inset 0 0 14px rgba(196, 156, 255, 0.07), 0 0 12px rgba(196, 156, 255, 0.07)`,
  btnHoverBg: `linear-gradient(180deg, rgba(196, 156, 255, 0.12), rgba(46, 16, 101, 0.55))`,
  btnHoverShadow: `inset 0 0 18px rgba(196, 156, 255, 0.12), 0 0 18px rgba(196, 156, 255, 0.16)`,
  btnFocusRing: "rgba(196, 156, 255, 0.38)",
  btnIcon: "#ddd6fe",
  btnIconGlow: "rgba(196, 156, 255, 0.36)",
  btnDetailBorder: "rgba(148, 163, 184, 0.22)",
  btnExploreBorder: "rgba(167, 139, 250, 0.34)",
  btnExploreBg: `linear-gradient(180deg, rgba(46, 16, 101, 0.36) 0%, rgba(24, 10, 48, 0.48) 100%)`,
  btnExploreHoverBorder: "rgba(167, 139, 250, 0.5)",
  statusText: "rgba(237, 233, 254, 0.95)",
  statusGlow: "rgba(196, 156, 255, 0.24)",
  statusDot: "#d9b8ff",
  statusDotShadow: `0 0 8px rgba(196, 156, 255, 0.48), 0 0 16px rgba(196, 156, 255, 0.16)`,
  nameGlow: "rgba(196, 156, 255, 0.1)",
  edgeStroke: "rgba(196, 156, 255, 0.36)",
  edgeMarker: "rgba(196, 156, 255, 0.46)",
  nodeDropShadow: `drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(196, 156, 255, 0.12))`,
  miniBorder: "rgba(196, 156, 255, 0.12)",
  miniInset: "rgba(196, 156, 255, 0.05)",
  miniShadowHover: "0 0 18px rgba(196, 156, 255, 0.1)",
  miniAvatarBorder: "rgba(196, 156, 255, 0.2)",
  miniAvatarBgFrom: "rgba(46, 16, 101, 0.7)",
  miniAvatarBgTo: "rgba(2, 6, 23, 0.88)",
  miniAvatarText: "rgba(237, 233, 254, 0.9)",
  miniAvatarGlow: "rgba(196, 156, 255, 0.09)",
  miniDetailBorder: "rgba(196, 156, 255, 0.24)",
  miniDetailText: "rgba(237, 233, 254, 0.86)",
  miniDetailHoverBorder: "rgba(196, 156, 255, 0.42)",
  miniDetailHoverBg: "rgba(46, 16, 101, 0.36)",
  miniExploreBorder: "rgba(167, 139, 250, 0.3)",
  miniExploreBg: "rgba(46, 16, 101, 0.3)",
  miniExploreHoverBorder: "rgba(167, 139, 250, 0.46)",
  miniExploreHoverBg: "rgba(46, 16, 101, 0.42)",
  miniPulse: "rgba(196, 156, 255, 0.85)",
  miniPulseShadow: "rgba(196, 156, 255, 0.38)",
  miniActiveLabel: "rgba(237, 233, 254, 0.75)",
  teamDivider: "rgba(196, 156, 255, 0.22)",
  teamHeading: "rgba(196, 156, 255, 0.5)",
};

const L5: OrgMapLevelThemeTokens = {
  primary: "#ff9f6e",
  border: "#ffb896",
  glow: "rgba(255, 159, 110, 0.26)",
  edgeStrong: "rgba(255, 159, 110, 0.42)",
  edgeSoft: "rgba(255, 159, 110, 0.2)",
  shadowCard: `0 0 0 1px rgba(255, 159, 110, 0.18), 0 0 18px rgba(255, 159, 110, 0.1), 0 0 32px rgba(234, 88, 12, 0.08), 0 0 42px rgba(255, 159, 110, 0.06), 0 18px 48px rgba(0, 0, 0, 0.55)`,
  shadowCardHover: `0 0 0 1px rgba(255, 237, 213, 0.14) inset, 0 0 32px rgba(255, 159, 110, 0.12), 0 26px 48px rgba(0, 0, 0, 0.46)`,
  shadowExpanded: `0 0 0 1px rgba(255, 159, 110, 0.16) inset, 0 0 28px rgba(255, 159, 110, 0.12), 0 22px 44px rgba(0, 0, 0, 0.48)`,
  shadowSelected: `0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 2px rgba(255, 159, 110, 0.28), 0 0 40px rgba(255, 159, 110, 0.16), 0 24px 56px rgba(0, 0, 0, 0.5)`,
  hudLine: "rgba(255, 159, 110, 0.32)",
  hudGlow: "rgba(255, 159, 110, 0.22)",
  cornerAccent: "#ffb896",
  bottomReader: "rgba(255, 159, 110, 0.9)",
  nucleusFilter: `drop-shadow(0 0 10px rgba(255, 159, 110, 0.24)) drop-shadow(0 0 22px rgba(234, 88, 12, 0.1))`,
  ringDefault: "rgba(255, 159, 110, 0.28)",
  ringOuter: "rgba(255, 237, 213, 0.38)",
  ringInner: "rgba(255, 159, 110, 0.12)",
  orbitDash: "rgba(255, 213, 170, 0.55)",
  coreGradientMid: "rgba(255, 200, 150, 0.88)",
  coreGradientDeep: "rgba(180, 60, 20, 0.34)",
  coreBorder: "rgba(255, 237, 213, 0.22)",
  coreShadow: `0 0 16px rgba(255, 159, 110, 0.4), 0 0 40px rgba(255, 159, 110, 0.14), inset 0 0 18px rgba(255, 255, 255, 0.12)`,
  coreSilhouette: `drop-shadow(0 0 6px rgba(255, 159, 110, 0.52)) drop-shadow(0 0 12px rgba(234, 88, 12, 0.24))`,
  crosshair: "rgba(255, 159, 110, 0.08)",
  breatheWeak: `0 0 14px rgba(255, 159, 110, 0.12), inset 0 0 18px rgba(234, 88, 12, 0.08)`,
  breatheStrong: `0 0 22px rgba(255, 159, 110, 0.2), inset 0 0 24px rgba(234, 88, 12, 0.12)`,
  btnBorder: "rgba(255, 159, 110, 0.26)",
  btnBg: `linear-gradient(180deg, rgba(67, 20, 7, 0.44), rgba(24, 8, 4, 0.78))`,
  btnShadow: `inset 0 0 14px rgba(255, 159, 110, 0.07), 0 0 12px rgba(255, 159, 110, 0.07)`,
  btnHoverBg: `linear-gradient(180deg, rgba(255, 159, 110, 0.12), rgba(67, 20, 7, 0.55))`,
  btnHoverShadow: `inset 0 0 18px rgba(255, 159, 110, 0.12), 0 0 18px rgba(255, 159, 110, 0.16)`,
  btnFocusRing: "rgba(255, 159, 110, 0.38)",
  btnIcon: "#ffedd5",
  btnIconGlow: "rgba(255, 159, 110, 0.36)",
  btnDetailBorder: "rgba(148, 163, 184, 0.22)",
  btnExploreBorder: "rgba(251, 146, 60, 0.34)",
  btnExploreBg: `linear-gradient(180deg, rgba(67, 20, 7, 0.36) 0%, rgba(40, 12, 4, 0.48) 100%)`,
  btnExploreHoverBorder: "rgba(251, 146, 60, 0.5)",
  statusText: "rgba(255, 237, 213, 0.95)",
  statusGlow: "rgba(255, 159, 110, 0.24)",
  statusDot: "#ffb896",
  statusDotShadow: `0 0 8px rgba(255, 159, 110, 0.48), 0 0 16px rgba(255, 159, 110, 0.16)`,
  nameGlow: "rgba(255, 159, 110, 0.1)",
  edgeStroke: "rgba(255, 159, 110, 0.36)",
  edgeMarker: "rgba(255, 159, 110, 0.46)",
  nodeDropShadow: `drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(255, 159, 110, 0.12))`,
  miniBorder: "rgba(255, 159, 110, 0.12)",
  miniInset: "rgba(255, 159, 110, 0.05)",
  miniShadowHover: "0 0 18px rgba(255, 159, 110, 0.1)",
  miniAvatarBorder: "rgba(255, 159, 110, 0.2)",
  miniAvatarBgFrom: "rgba(67, 20, 7, 0.7)",
  miniAvatarBgTo: "rgba(2, 6, 23, 0.88)",
  miniAvatarText: "rgba(255, 237, 213, 0.9)",
  miniAvatarGlow: "rgba(255, 159, 110, 0.09)",
  miniDetailBorder: "rgba(255, 159, 110, 0.24)",
  miniDetailText: "rgba(255, 237, 213, 0.86)",
  miniDetailHoverBorder: "rgba(255, 159, 110, 0.42)",
  miniDetailHoverBg: "rgba(67, 20, 7, 0.36)",
  miniExploreBorder: "rgba(251, 146, 60, 0.3)",
  miniExploreBg: "rgba(67, 20, 7, 0.3)",
  miniExploreHoverBorder: "rgba(251, 146, 60, 0.46)",
  miniExploreHoverBg: "rgba(67, 20, 7, 0.42)",
  miniPulse: "rgba(255, 159, 110, 0.85)",
  miniPulseShadow: "rgba(255, 159, 110, 0.38)",
  miniActiveLabel: "rgba(255, 237, 213, 0.75)",
  teamDivider: "rgba(255, 159, 110, 0.22)",
  teamHeading: "rgba(255, 159, 110, 0.5)",
};

/** Niveles 6+ comparten el tema “control / alerta suave”. */
export const ORG_MAP_LEVEL_THEME_MAP: Record<1 | 2 | 3 | 4 | 5, OrgMapLevelThemeTokens> =
  {
    1: L1,
    2: L2,
    3: L3,
    4: L4,
    5: L5,
  };

const HIERARCHY_LEVEL_RE =
  /\b(?:nivel|level|lv\.?|capa)\s*[:.]?\s*(\d{1,2})\b/i;

/**
 * Índice de tema 1..5 (el 5 agrupa nivel 5 y superiores en datos).
 */
export function clampOrgMapThemeLevel(raw: number): 1 | 2 | 3 | 4 | 5 {
  if (raw < 1) return 1;
  if (raw > 5) return 5;
  return raw as 1 | 2 | 3 | 4 | 5;
}

/**
 * Resuelve el nivel visual: nombre de jerarquía (“Nivel 2”) si existe; si no, profundidad en el mapa.
 * `mapLayoutDepth`: 0 = raíz del lienzo, 1 = reportes directos en fila 2, etc.
 */
export function resolveOrgMapVisualLevel(
  orgNode: OrgNode | undefined,
  mapLayoutDepth: number,
): 1 | 2 | 3 | 4 | 5 {
  const name = orgNode?.hierarchy?.name?.trim();
  if (name) {
    const m = name.match(HIERARCHY_LEVEL_RE);
    if (m) {
      const n = Number.parseInt(m[1]!, 10);
      if (Number.isFinite(n) && n >= 1) {
        return clampOrgMapThemeLevel(n);
      }
    }
    const digit = name.match(/\b(\d{1,2})\b/);
    if (digit) {
      const n = Number.parseInt(digit[1]!, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 99) {
        return clampOrgMapThemeLevel(n);
      }
    }
  }
  return clampOrgMapThemeLevel(mapLayoutDepth + 1);
}

export function getOrgMapLevelTheme(level: 1 | 2 | 3 | 4 | 5): OrgMapLevelThemeTokens {
  return ORG_MAP_LEVEL_THEME_MAP[level];
}

/** Custom properties para inyectar en el contenedor (nodo o mini-card). */
export function orgMapLevelThemeToCssVars(
  level: 1 | 2 | 3 | 4 | 5,
): CSSProperties {
  const t = getOrgMapLevelTheme(level);
  const prefix = "--org-lvl" as const;
  return {
    [`${prefix}-primary`]: t.primary,
    [`${prefix}-border`]: t.border,
    [`${prefix}-glow`]: t.glow,
    [`${prefix}-edge-strong`]: t.edgeStrong,
    [`${prefix}-edge-soft`]: t.edgeSoft,
    [`${prefix}-shadow-card`]: t.shadowCard,
    [`${prefix}-shadow-card-hover`]: t.shadowCardHover,
    [`${prefix}-shadow-expanded`]: t.shadowExpanded,
    [`${prefix}-shadow-selected`]: t.shadowSelected,
    [`${prefix}-hud-line`]: t.hudLine,
    [`${prefix}-hud-glow`]: t.hudGlow,
    [`${prefix}-corner`]: t.cornerAccent,
    [`${prefix}-bottom-reader`]: t.bottomReader,
    [`${prefix}-nucleus-filter`]: t.nucleusFilter,
    [`${prefix}-ring`]: t.ringDefault,
    [`${prefix}-ring-outer`]: t.ringOuter,
    [`${prefix}-ring-inner`]: t.ringInner,
    [`${prefix}-orbit`]: t.orbitDash,
    [`${prefix}-core-mid`]: t.coreGradientMid,
    [`${prefix}-core-deep`]: t.coreGradientDeep,
    [`${prefix}-core-border`]: t.coreBorder,
    [`${prefix}-core-shadow`]: t.coreShadow,
    [`${prefix}-core-silhouette`]: t.coreSilhouette,
    [`${prefix}-crosshair`]: t.crosshair,
    [`${prefix}-breathe-weak`]: t.breatheWeak,
    [`${prefix}-breathe-strong`]: t.breatheStrong,
    [`${prefix}-btn-border`]: t.btnBorder,
    [`${prefix}-btn-bg`]: t.btnBg,
    [`${prefix}-btn-shadow`]: t.btnShadow,
    [`${prefix}-btn-hover-bg`]: t.btnHoverBg,
    [`${prefix}-btn-hover-shadow`]: t.btnHoverShadow,
    [`${prefix}-btn-focus`]: t.btnFocusRing,
    [`${prefix}-btn-icon`]: t.btnIcon,
    [`${prefix}-btn-icon-glow`]: t.btnIconGlow,
    [`${prefix}-btn-detail-border`]: t.btnDetailBorder,
    [`${prefix}-btn-explore-border`]: t.btnExploreBorder,
    [`${prefix}-btn-explore-bg`]: t.btnExploreBg,
    [`${prefix}-btn-explore-hover-border`]: t.btnExploreHoverBorder,
    [`${prefix}-status-text`]: t.statusText,
    [`${prefix}-status-glow`]: t.statusGlow,
    [`${prefix}-status-dot`]: t.statusDot,
    [`${prefix}-status-dot-shadow`]: t.statusDotShadow,
    [`${prefix}-name-glow`]: t.nameGlow,
    [`${prefix}-edge-stroke`]: t.edgeStroke,
    [`${prefix}-edge-marker`]: t.edgeMarker,
    [`${prefix}-node-drop`]: t.nodeDropShadow,
    [`${prefix}-mini-border`]: t.miniBorder,
    [`${prefix}-mini-inset`]: t.miniInset,
    [`${prefix}-mini-shadow-hover`]: t.miniShadowHover,
    [`${prefix}-mini-avatar-border`]: t.miniAvatarBorder,
    [`${prefix}-mini-avatar-from`]: t.miniAvatarBgFrom,
    [`${prefix}-mini-avatar-to`]: t.miniAvatarBgTo,
    [`${prefix}-mini-avatar-text`]: t.miniAvatarText,
    [`${prefix}-mini-avatar-glow`]: t.miniAvatarGlow,
    [`${prefix}-mini-detail-border`]: t.miniDetailBorder,
    [`${prefix}-mini-detail-text`]: t.miniDetailText,
    [`${prefix}-mini-detail-hover-border`]: t.miniDetailHoverBorder,
    [`${prefix}-mini-detail-hover-bg`]: t.miniDetailHoverBg,
    [`${prefix}-mini-explore-border`]: t.miniExploreBorder,
    [`${prefix}-mini-explore-bg`]: t.miniExploreBg,
    [`${prefix}-mini-explore-hover-border`]: t.miniExploreHoverBorder,
    [`${prefix}-mini-explore-hover-bg`]: t.miniExploreHoverBg,
    [`${prefix}-mini-pulse`]: t.miniPulse,
    [`${prefix}-mini-pulse-shadow`]: t.miniPulseShadow,
    [`${prefix}-mini-active-label`]: t.miniActiveLabel,
    [`${prefix}-team-divider`]: t.teamDivider,
    [`${prefix}-team-heading`]: t.teamHeading,
  } as CSSProperties;
}
