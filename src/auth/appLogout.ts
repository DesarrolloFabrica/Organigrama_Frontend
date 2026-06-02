import type { QueryClient } from "@tanstack/react-query";
import { clearOrgChartMainSession } from "../features/org-chart/state/orgChartMainSession";
import { clearPrefetchHintsState } from "../lib/react-query/orgChartPrefetch";
import { clearAuthSession } from "./authStorage";
import { clearProfileCompletedCache } from "./profileGateStorage";

/** Limpieza centralizada al cerrar sesión (cache visual + React Query). */
export function performAppLogout(queryClient?: QueryClient): void {
  clearAuthSession();
  clearProfileCompletedCache();
  clearOrgChartMainSession();
  clearPrefetchHintsState();
  queryClient?.clear();
}
