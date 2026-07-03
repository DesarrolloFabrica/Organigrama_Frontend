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
import { getAuthUser } from "../../../auth/authStorage";
import { fetchOrgChartVersions } from "../services/orgChartService";
import type { OrgChartVersion } from "../types/orgChartVersion";
import { clearOrgChartMainSession } from "../state/orgChartMainSession";
import { canUseOrgVersioning } from "../utils/canUseOrgVersioning";
import { filterVisibleOrgChartVersions } from "../utils/filterVisibleOrgChartVersions";
import { orgQueryKeys } from "../../../lib/react-query/queryKeys";
import { clearPrefetchHintsState } from "../../../lib/react-query/orgChartPrefetch";

function isOrgChartDataQuery(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return (
    typeof root === "string" &&
    (orgQueryKeys.allOrgData as readonly string[]).includes(root)
  );
}

function orgQueryBelongsToVersion(
  queryKey: readonly unknown[],
  versionId: number,
): boolean {
  if (!isOrgChartDataQuery(queryKey)) return false;
  return queryKey.includes(versionId);
}

type OrgChartVersionContextValue = {
  canVersion: boolean;
  selectedVersionId: number | undefined;
  setSelectedVersionId: (versionId: number) => void;
  versions: OrgChartVersion[];
  isLoadingVersions: boolean;
  refetchVersions: () => void;
};

const OrgChartVersionContext = createContext<OrgChartVersionContextValue | null>(
  null,
);

export function OrgChartVersionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const authUser = getAuthUser();
  const canVersion = canUseOrgVersioning(authUser);
  const [selectedVersionId, setSelectedVersionIdState] = useState<
    number | undefined
  >(undefined);
  const versionsQuery = useQuery({
    queryKey: orgQueryKeys.versions,
    queryFn: fetchOrgChartVersions,
    enabled: canVersion,
  });

  const visibleVersions = useMemo(
    () => filterVisibleOrgChartVersions(versionsQuery.data ?? []),
    [versionsQuery.data],
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

  const setSelectedVersionId = useCallback(
    (versionId: number) => {
      if (!canVersion) return;
      if (versionId === selectedVersionId) return;

      const previousVersionId = selectedVersionId;

      setSelectedVersionIdState(versionId);
      clearOrgChartMainSession();
      clearPrefetchHintsState();

      void queryClient.cancelQueries({
        predicate: (query) => isOrgChartDataQuery(query.queryKey),
      });

      if (previousVersionId !== undefined) {
        void queryClient.removeQueries({
          predicate: (query) =>
            orgQueryBelongsToVersion(query.queryKey, previousVersionId),
        });
      }
    },
    [canVersion, queryClient, selectedVersionId],
  );

  const value = useMemo<OrgChartVersionContextValue>(
    () => ({
      canVersion,
      selectedVersionId: canVersion ? selectedVersionId : undefined,
      setSelectedVersionId,
      versions: visibleVersions,
      isLoadingVersions: versionsQuery.isLoading,
      refetchVersions: () => {
        void versionsQuery.refetch();
      },
    }),
    [
      canVersion,
      selectedVersionId,
      setSelectedVersionId,
      visibleVersions,
      versionsQuery.isLoading,
      versionsQuery,
    ],
  );

  return (
    <OrgChartVersionContext.Provider value={value}>
      {children}
    </OrgChartVersionContext.Provider>
  );
}

/** Versión activa para queries del organigrama (solo usuario técnico 1229). */
export function useOrgChartVersion() {
  const context = useContext(OrgChartVersionContext);
  if (!context) {
    return {
      canVersion: false,
      selectedVersionId: undefined as number | undefined,
      setSelectedVersionId: () => undefined,
      versions: [] as OrgChartVersion[],
      isLoadingVersions: false,
      refetchVersions: () => undefined,
    };
  }
  return context;
}

/** versionId para React Query: undefined para usuarios normales. */
export function useOrgChartVersionQueryId(): number | undefined {
  const { canVersion, selectedVersionId } = useOrgChartVersion();
  return canVersion ? selectedVersionId : undefined;
}

/** true cuando las queries del organigrama pueden ejecutarse (versión resuelta si aplica). */
export function useOrgChartVersionReady(): boolean {
  const { canVersion, selectedVersionId, isLoadingVersions } =
    useOrgChartVersion();
  if (!canVersion) return true;
  return !isLoadingVersions && selectedVersionId !== undefined;
}
