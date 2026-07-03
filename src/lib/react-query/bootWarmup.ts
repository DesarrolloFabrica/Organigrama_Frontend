import { getAuthUser } from "../../auth/authStorage";
import { canUseOrgVersioning } from "../../features/org-chart/utils/canUseOrgVersioning";
import {
  fetchOrgChartRoot,
  fetchOrgChartVersions,
} from "../../features/org-chart/services/orgChartService";
import type { QueryClient } from "@tanstack/react-query";
import { orgQueryKeys } from "./queryKeys";

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
    if (versions.length === 0) return undefined;
    const active = versions.find((version) => version.isActive) ?? versions[0];
    return active?.id;
  } catch {
    return undefined;
  }
}

export async function prefetchOrgChartRootForBoot(
  queryClient: QueryClient,
): Promise<void> {
  const versionId = await resolveBootWarmupVersionId(queryClient);
  const key = orgQueryKeys.root(versionId);
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => fetchOrgChartRoot(versionId ? { versionId } : undefined),
  });
}
