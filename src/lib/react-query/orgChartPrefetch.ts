import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { OrgNode } from "../../features/org-chart/types";
import {
  fetchOrgChartNode,
  fetchOrgSummary,
} from "../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "./queryKeys";
import {
  logQueryCacheAccess,
  logQueryNetworkTiming,
  logQueryServedFromCache,
} from "./devTelemetry";

const inflightPrefetchKeys = new Set<string>();

function queryKeyId(queryKey: QueryKey): string {
  return JSON.stringify(queryKey);
}

export function clearPrefetchHintsState(): void {
  inflightPrefetchKeys.clear();
}

/**
 * Prefetch de exploración/resumen solo para hijos directos visibles (no recursivo).
 * No recorre `children[].children`.
 */
export function prefetchDirectChildrenHints(
  queryClient: QueryClient,
  children: OrgNode[],
  versionId?: number,
): void {
  for (const child of children) {
    if (!child?.id) continue;

    const nodeKey = orgQueryKeys.node(child.id, versionId);
    const summaryKey = orgQueryKeys.summary(child.id, versionId);

    void prefetchOne(
      queryClient,
      "org-node",
      nodeKey,
      () => fetchOrgChartNode(child.id, versionId ? { versionId } : undefined),
    );
    void prefetchOne(
      queryClient,
      "org-summary",
      summaryKey,
      () => fetchOrgSummary(child.id, versionId ? { versionId } : undefined),
    );
  }
}

async function prefetchOne(
  queryClient: QueryClient,
  resource: string,
  queryKey: QueryKey,
  queryFn: () => Promise<unknown>,
): Promise<void> {
  const id = queryKeyId(queryKey);
  const cached = queryClient.getQueryData(queryKey);
  const t0 = performance.now();
  logQueryCacheAccess(resource, queryKey, cached !== undefined);

  if (cached !== undefined) {
    logQueryServedFromCache(resource, queryKey, performance.now() - t0);
    return;
  }

  if (inflightPrefetchKeys.has(id)) {
    if (import.meta.env.DEV) {
      console.debug(`[RQ prefetch] skip in-flight ${resource}`, { key: id });
    }
    return;
  }

  inflightPrefetchKeys.add(id);
  try {
    await queryClient.prefetchQuery({ queryKey, queryFn });
    logQueryNetworkTiming(resource, queryKey, performance.now() - t0);
  } catch {
    // Prefetch best-effort: no bloquea expansión ni navegación.
  } finally {
    inflightPrefetchKeys.delete(id);
  }
}
