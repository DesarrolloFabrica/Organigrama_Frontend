import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getAuthUser } from "../../../auth/authStorage";
import { useFlowAreaIdentity } from "../../../contexts/RouteTransitionContext";
import { fetchOrgChartVersions } from "../services/orgChartService";
import type {
  OrgChartRequestOptions,
  OrgChartScopeVersionId,
  OrgChartVersion,
} from "../types/orgChartVersion";
import { clearOrgChartMainSession } from "../state/orgChartMainSession";
import { canUseOrgVersioning } from "../utils/canUseOrgVersioning";
import {
  filterVisibleOrgChartVersions,
  groupScopedOrgChartVersions,
  type OrgChartVersionScopeGroup,
} from "../utils/filterVisibleOrgChartVersions";
import { readOrgTeamNavState } from "../utils/orgChartTeamNavigation";
import { filterVisibleScopedVersionGroups, teamPersonIdFromPathname } from "../utils/scopedOrgChartVersionView";
import { orgQueryKeys } from "../../../lib/react-query/queryKeys";
import { clearPrefetchHintsState } from "../../../lib/react-query/orgChartPrefetch";

function isOrgChartDataQuery(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return (
    typeof root === "string" &&
    (orgQueryKeys.allOrgData as readonly string[]).includes(root)
  );
}

type OrgChartVersionContextValue = {
  canVersion: boolean;
  selectedVersionId: number | undefined;
  setSelectedVersionId: (versionId: number) => void;
  selectedScopeVersionId: OrgChartScopeVersionId | undefined;
  setSelectedScopeVersionId: (scopeVersionId: OrgChartScopeVersionId) => void;
  versions: OrgChartVersion[];
  scopedVersionGroups: OrgChartVersionScopeGroup[];
  /** Coordinaciones con menú propio, solo si el usuario está en esa coordinación. */
  visibleScopedVersionGroups: OrgChartVersionScopeGroup[];
  isLoadingVersions: boolean;
  refetchVersions: () => void;
};

const OrgChartVersionContext = createContext<OrgChartVersionContextValue | null>(
  null,
);

const FALLBACK_CONTEXT: OrgChartVersionContextValue = {
  canVersion: false,
  selectedVersionId: undefined,
  setSelectedVersionId: () => undefined,
  selectedScopeVersionId: undefined,
  setSelectedScopeVersionId: () => undefined,
  versions: [],
  scopedVersionGroups: [],
  visibleScopedVersionGroups: [],
  isLoadingVersions: false,
  refetchVersions: () => undefined,
};

function invalidateOrgChartQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  clearOrgChartMainSession();
  clearPrefetchHintsState();
  void queryClient.cancelQueries({
    predicate: (query) => isOrgChartDataQuery(query.queryKey),
  });
  void queryClient.removeQueries({
    predicate: (query) => isOrgChartDataQuery(query.queryKey),
  });
}

export function OrgChartVersionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const flowIdentity = useFlowAreaIdentity();
  const authUser = getAuthUser();
  const canVersion = canUseOrgVersioning(authUser);
  const [selectedVersionId, setSelectedVersionIdState] = useState<
    number | undefined
  >(undefined);
  const [selectedScopeVersionId, setSelectedScopeVersionIdState] = useState<
    OrgChartScopeVersionId | undefined
  >(undefined);
  const versionsQuery = useQuery({
    queryKey: orgQueryKeys.versions,
    queryFn: fetchOrgChartVersions,
    enabled: canVersion,
  });

  const allVersions = versionsQuery.data ?? [];
  const visibleVersions = useMemo(
    () => filterVisibleOrgChartVersions(allVersions),
    [allVersions],
  );
  const scopedVersionGroups = useMemo(
    () => groupScopedOrgChartVersions(allVersions),
    [allVersions],
  );
  const teamNavState = readOrgTeamNavState(location.state);
  const visibleScopedVersionGroups = useMemo(
    () =>
      filterVisibleScopedVersionGroups(scopedVersionGroups, {
        pathname: location.pathname,
        personId: teamPersonIdFromPathname(location.pathname),
        breadcrumb: teamNavState?.breadcrumb,
        flowIdentityLabel: flowIdentity?.label,
      }),
    [
      scopedVersionGroups,
      location.pathname,
      teamNavState?.breadcrumb,
      flowIdentity?.label,
    ],
  );

  useEffect(() => {
    if (!canVersion || visibleVersions.length === 0) return;

    const selectedStillVisible =
      selectedVersionId !== undefined &&
      visibleVersions.some((version) => version.id === selectedVersionId);

    if (selectedStillVisible) return;

    const active =
      visibleVersions.find((version) => version.isActive) ?? visibleVersions[0];
    setSelectedVersionIdState(active.id);
  }, [canVersion, visibleVersions, selectedVersionId]);

  useEffect(() => {
    if (!canVersion) return;
    if (visibleScopedVersionGroups.length === 0) return;

    const scopedIds = new Set(
      visibleScopedVersionGroups.flatMap((group) =>
        group.versions.map((version) => version.id),
      ),
    );
    const selectedStillVisible =
      selectedScopeVersionId === "none" ||
      (typeof selectedScopeVersionId === "number" &&
        scopedIds.has(selectedScopeVersionId));
    if (selectedStillVisible) return;

    const preferred =
      visibleScopedVersionGroups[0]?.versions.find(
        (version) => version.isActive,
      ) ?? visibleScopedVersionGroups[0]?.versions[0];
    if (preferred) {
      setSelectedScopeVersionIdState(preferred.id);
    }
  }, [canVersion, visibleScopedVersionGroups, selectedScopeVersionId]);

  const setSelectedVersionId = useCallback(
    (versionId: number) => {
      if (!canVersion) return;
      if (versionId === selectedVersionId) return;
      setSelectedVersionIdState(versionId);
      invalidateOrgChartQueries(queryClient);
    },
    [canVersion, queryClient, selectedVersionId],
  );

  const setSelectedScopeVersionId = useCallback(
    (scopeVersionId: OrgChartScopeVersionId) => {
      if (!canVersion) return;
      if (scopeVersionId === selectedScopeVersionId) return;
      setSelectedScopeVersionIdState(scopeVersionId);
      invalidateOrgChartQueries(queryClient);
    },
    [canVersion, queryClient, selectedScopeVersionId],
  );

  const value = useMemo<OrgChartVersionContextValue>(
    () => ({
      canVersion,
      selectedVersionId: canVersion ? selectedVersionId : undefined,
      setSelectedVersionId,
      selectedScopeVersionId: canVersion ? selectedScopeVersionId : undefined,
      setSelectedScopeVersionId,
      versions: visibleVersions,
      scopedVersionGroups,
      visibleScopedVersionGroups,
      isLoadingVersions: versionsQuery.isLoading,
      refetchVersions: () => {
        void versionsQuery.refetch();
      },
    }),
    [
      canVersion,
      selectedVersionId,
      setSelectedVersionId,
      selectedScopeVersionId,
      setSelectedScopeVersionId,
      visibleVersions,
      scopedVersionGroups,
      visibleScopedVersionGroups,
      versionsQuery,
    ],
  );

  return (
    <OrgChartVersionContext.Provider value={value}>
      {children}
    </OrgChartVersionContext.Provider>
  );
}

/** Versión activa para queries del organigrama (allowlist de versionamiento). */
export function useOrgChartVersion() {
  const context = useContext(OrgChartVersionContext);
  return context ?? FALLBACK_CONTEXT;
}

/** versionId para React Query: undefined para usuarios normales. */
export function useOrgChartVersionQueryId(): number | undefined {
  const { canVersion, selectedVersionId } = useOrgChartVersion();
  return canVersion ? selectedVersionId : undefined;
}

/** scopeVersionId efectivo para queries: overlay solo dentro de la coordinación. */
export function useOrgChartScopeVersionQueryId():
  | OrgChartScopeVersionId
  | undefined {
  const { canVersion, selectedScopeVersionId, visibleScopedVersionGroups } =
    useOrgChartVersion();
  if (!canVersion) return undefined;
  if (visibleScopedVersionGroups.length === 0) return "none";
  return selectedScopeVersionId;
}

export function useOrgChartRequestOptions(): OrgChartRequestOptions {
  const versionId = useOrgChartVersionQueryId();
  const scopeVersionId = useOrgChartScopeVersionQueryId();
  if (versionId === undefined && scopeVersionId === undefined) {
    return {};
  }
  return {
    ...(versionId !== undefined ? { versionId } : {}),
    ...(scopeVersionId !== undefined ? { scopeVersionId } : {}),
  };
}

/** true cuando las queries del organigrama pueden ejecutarse (versión resuelta si aplica). */
export function useOrgChartVersionReady(): boolean {
  const {
    canVersion,
    selectedVersionId,
    selectedScopeVersionId,
    visibleScopedVersionGroups,
    isLoadingVersions,
  } = useOrgChartVersion();
  if (!canVersion) return true;
  if (isLoadingVersions || selectedVersionId === undefined) return false;
  if (visibleScopedVersionGroups.length === 0) return true;
  return selectedScopeVersionId !== undefined;
}
