import type { QueryClient } from "@tanstack/react-query";
import type { ProfileMe } from "../../features/profile/types";
import {
  onboardingQueryKeys,
  orgQueryKeys,
  profileQueryKeys,
} from "./queryKeys";
import { queryClient } from "./queryClient";

export function invalidateProfileQueries(client: QueryClient = queryClient) {
  return client.invalidateQueries({ queryKey: profileQueryKeys.profile });
}

export function invalidateOnboardingStatus(client: QueryClient = queryClient) {
  return client.invalidateQueries({ queryKey: onboardingQueryKeys.status });
}

export function invalidateOrgChartRoot(client: QueryClient = queryClient) {
  return client.invalidateQueries({ queryKey: orgQueryKeys.root });
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
    client.invalidateQueries({ queryKey: orgQueryKeys.node(personId) }),
    client.invalidateQueries({ queryKey: orgQueryKeys.personDetail(personId) }),
    client.invalidateQueries({ queryKey: orgQueryKeys.summary(personId) }),
  ]);
}
