import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { OrgNode } from "../../features/org-chart/types";
import { fetchOrgChartNode } from "../../features/org-chart/services/orgChartService";
import { orgQueryKeys } from "./queryKeys";
import {
  logQueryCacheAccess,
  logQueryNetworkTiming,
  logQueryServedFromCache,
} from "./devTelemetry";

const inflightPrefetchKeys = new Set<string>();
const prefetchedParentHints = new Map<string, string>();
const MAX_CONCURRENT_PREFETCH = 4;
let activePrefetchCount = 0;
const prefetchQueue: Array<() => void> = [];

function queryKeyId(queryKey: QueryKey): string {
  return JSON.stringify(queryKey);
}

function parentHintKey(
  parentId: string,
  versionId?: number,
  scopeVersionId?: number | "none",
): string {
  return `${versionId ?? "default"}:${scopeVersionId ?? "auto"}:${parentId}`;
}

function childrenSignature(children: OrgNode[]): string {
  return children.map((child) => child.id).join(",");
}

function drainPrefetchQueue(): void {
  while (
    activePrefetchCount < MAX_CONCURRENT_PREFETCH &&
    prefetchQueue.length > 0
  ) {
    const next = prefetchQueue.shift();
    next?.();
  }
}

function schedulePrefetch(task: () => Promise<void>): void {
  const run = () => {
    activePrefetchCount += 1;
    void task().finally(() => {
      activePrefetchCount -= 1;
      drainPrefetchQueue();
    });
  };

  if (activePrefetchCount < MAX_CONCURRENT_PREFETCH) {
    run();
  } else {
    prefetchQueue.push(run);
  }
}

export function clearPrefetchHintsState(): void {
  inflightPrefetchKeys.clear();
  prefetchedParentHints.clear();
  prefetchQueue.length = 0;
}

/**
 * Prefetch de exploración solo para hijos directos visibles (no recursivo).
 * Solo precarga org-node; el summary se obtiene bajo demanda en NodeSummaryPanel.
 */
export function prefetchDirectChildrenHints(
  queryClient: QueryClient,
  parentId: string,
  children: OrgNode[],
  versionId?: number,
  scopeVersionId?: number | "none",
): void {
  if (children.length === 0) return;

  const hintKey = parentHintKey(parentId, versionId, scopeVersionId);
  const signature = childrenSignature(children);
  if (prefetchedParentHints.get(hintKey) === signature) {
    return;
  }
  prefetchedParentHints.set(hintKey, signature);

  for (const child of children) {
    if (!child?.id) continue;

    const childRelationId = child.relation_id ?? null;
    const nodeKey = orgQueryKeys.node(
      child.id,
      versionId,
      childRelationId,
      scopeVersionId,
    );
    schedulePrefetch(() =>
      prefetchOne(
        queryClient,
        "org-node",
        nodeKey,
        () =>
          fetchOrgChartNode(child.id, {
            ...(versionId !== undefined ? { versionId } : {}),
            ...(scopeVersionId !== undefined ? { scopeVersionId } : {}),
            ...(childRelationId != null ? { relationId: childRelationId } : {}),
          }),
      ),
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
