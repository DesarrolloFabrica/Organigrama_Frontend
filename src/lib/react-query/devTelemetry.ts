import type { QueryKey } from "@tanstack/react-query";

const isDev = import.meta.env.DEV;

function formatKey(key: QueryKey): string {
  return JSON.stringify(key);
}

/** Diagnóstico ligero: lectura de cache antes de fetch/prefetch. */
export function logQueryCacheAccess(
  resource: string,
  queryKey: QueryKey,
  hit: boolean,
): void {
  if (!isDev) return;
  console.debug(`[RQ cache] ${hit ? "HIT" : "MISS"} ${resource}`, {
    key: formatKey(queryKey),
  });
}

/** Diagnóstico ligero: tiempo de red real (queryFn ejecutado). */
export function logQueryNetworkTiming(
  resource: string,
  queryKey: QueryKey,
  durationMs: number,
): void {
  if (!isDev) return;
  console.debug(`[RQ network] ${resource} ${durationMs.toFixed(0)}ms`, {
    key: formatKey(queryKey),
  });
}

/** Datos servidos desde cache sin red (p. ej. tras prefetch). */
export function logQueryServedFromCache(
  resource: string,
  queryKey: QueryKey,
  durationMs: number,
): void {
  if (!isDev) return;
  console.debug(`[RQ served] ${resource} from cache ${durationMs.toFixed(0)}ms`, {
    key: formatKey(queryKey),
  });
}
