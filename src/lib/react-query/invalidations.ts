import type { QueryClient } from "@tanstack/react-query";
import type { ProfileMe } from "../../features/profile/types";
import {
  onboardingQueryKeys,
  orgQueryKeys,
  profileQueryKeys,
} from "./queryKeys";
import { queryClient } from "./queryClient";

function isOrgQueryKeyRoot(queryKey: readonly unknown[]): boolean {
  return queryKey[0] === "org-root";
}

function isOrgQueryKeyForPerson(
  queryKey: readonly unknown[],
  prefix: string,
  personId: string,
): boolean {
  return queryKey[0] === prefix && queryKey[1] === personId;
}

function isOrgChartDataQuery(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return (
    typeof root === "string" &&
    (orgQueryKeys.allOrgData as readonly string[]).includes(root)
  );
}

export function invalidateProfileQueries(client: QueryClient = queryClient) {
  return client.invalidateQueries({ queryKey: profileQueryKeys.profile });
}

export function invalidateOnboardingStatus(client: QueryClient = queryClient) {
  return client.invalidateQueries({ queryKey: onboardingQueryKeys.status });
}

/** Invalida todas las variantes de org-root (con y sin versionId). */
export function invalidateOrgChartRoot(client: QueryClient = queryClient) {
  return client.invalidateQueries({
    predicate: (query) => isOrgQueryKeyRoot(query.queryKey),
  });
}

/**
 * Tras cambios de perfil/foto/datos personales: solo el usuario afectado y el árbol raíz.
 * No invalida todas las exploraciones ni fichas de terceros en cache.
 */
export function invalidateAfterProfileChange(
  client: QueryClient = queryClient,
  profile: ProfileMe,
) {
  const personId = profile.personId;

  return Promise.all([
    invalidateProfileQueries(client),
    invalidateOnboardingStatus(client),
    invalidateOrgChartRoot(client),
    client.invalidateQueries({
      predicate: (query) =>
        isOrgQueryKeyForPerson(query.queryKey, "org-node", personId),
    }),
    client.invalidateQueries({
      predicate: (query) =>
        isOrgQueryKeyForPerson(query.queryKey, "org-person-detail", personId),
    }),
    client.invalidateQueries({
      predicate: (query) =>
        isOrgQueryKeyForPerson(query.queryKey, "org-summary", personId),
    }),
  ]);
}

/** Invalida toda la familia de datos del organigrama (todas las versiones). */
export function invalidateAllOrgChartData(client: QueryClient = queryClient) {
  return client.invalidateQueries({
    predicate: (query) => isOrgChartDataQuery(query.queryKey),
  });
}
