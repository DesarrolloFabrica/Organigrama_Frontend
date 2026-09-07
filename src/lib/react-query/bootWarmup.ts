import { getAuthUser } from "../../auth/authStorage";
import { canUseOrgVersioning } from "../../features/org-chart/utils/canUseOrgVersioning";
import {
  fetchOrgChartRoot,
  fetchOrgChartVersions,
} from "../../features/org-chart/services/orgChartService";
import type { QueryClient } from "@tanstack/react-query";
import { orgQueryKeys } from "./queryKeys";
import {
  filterVisibleOrgChartVersions,
} from "../../features/org-chart/utils/filterVisibleOrgChartVersions";

/**
 * Resuelve el versionId activo (misma clave que useOrgChartRoot).
 */
export async function resolveBootWarmupVersionId(
  queryClient?: QueryClient,
): Promise<number | undefined> {
  const user = getAuthUser();
  if (!canUseOrgVersioning(user)) {
    return undefined;
  }

  try {
    const versions = queryClient
      ? await queryClient.fetchQuery({
          queryKey: orgQueryKeys.versions,
          queryFn: fetchOrgChartVersions,
        })
      : await fetchOrgChartVersions();
    const globalVersions = filterVisibleOrgChartVersions(versions);
    if (globalVersions.length === 0) return undefined;
    const active =
      globalVersions.find((version) => version.isActive) ?? globalVersions[0];
    return active?.id;
  } catch {
    return undefined;
  }
}

export async function prefetchOrgChartRootForBoot(
  queryClient: QueryClient,
): Promise<void> {
  const user = getAuthUser();
  const versionId = await resolveBootWarmupVersionId(queryClient);
  const scopeVersionId = canUseOrgVersioning(user) ? "none" : undefined;
  const key = orgQueryKeys.root(versionId, scopeVersionId);
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () =>
      fetchOrgChartRoot({
        ...(versionId !== undefined ? { versionId } : {}),
        ...(scopeVersionId !== undefined ? { scopeVersionId } : {}),
      }),
  });
}
