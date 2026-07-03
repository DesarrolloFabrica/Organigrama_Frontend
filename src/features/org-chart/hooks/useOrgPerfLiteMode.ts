import { useEffect, useState } from "react";

type OrgPerfLiteModeInput = {
  /** Nodos visibles en el grafo actual (React Flow). */
  visibleNodeCount?: number;
  /** Reportes directos del nodo raíz del mapa/lista. */
  directReportsCount?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCompactViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function evaluateLiteMode(input: OrgPerfLiteModeInput): boolean {
  if (prefersReducedMotion()) return true;
  if (isCompactViewport()) return true;

  const directReports = input.directReportsCount ?? 0;
  if (directReports > 10) return true;

  const visibleNodes = input.visibleNodeCount ?? 0;
  if (visibleNodes > 12) return true;

  return false;
}

/**
 * Activa modo lite (menos animaciones, sin radar, sin blur pesado) según
 * tamaño del equipo, nodos visibles, viewport o preferencias de accesibilidad.
 */
export function useOrgPerfLiteMode(input: OrgPerfLiteModeInput = {}): boolean {
  const [liteMode, setLiteMode] = useState(() => evaluateLiteMode(input));

  useEffect(() => {
    const update = () => setLiteMode(evaluateLiteMode(input));

    update();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewportQuery = window.matchMedia("(max-width: 767px)");

    motionQuery.addEventListener("change", update);
    viewportQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      motionQuery.removeEventListener("change", update);
      viewportQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [input.directReportsCount, input.visibleNodeCount]);

  return liteMode;
}
