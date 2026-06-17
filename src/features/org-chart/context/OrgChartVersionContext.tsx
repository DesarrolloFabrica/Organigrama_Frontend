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

type OrgChartVersionContextValue = {
  canVersion: boolean;
  selectedVersionId: number | undefined;
  setSelectedVersionId: (versionId: number) => void;
  versions: OrgChartVersion[];
  isLoadingVersions: boolean;
  refetchVersions: () => void;
  showAdvancedHistorical: boolean;
  setShowAdvancedHistorical: (value: boolean) => void;
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
  const [showAdvancedHistorical, setShowAdvancedHistorical] = useState(false);

  const versionsQuery = useQuery({
    queryKey: orgQueryKeys.versions,
    queryFn: fetchOrgChartVersions,
    enabled: canVersion,
  });

  const visibleVersions = useMemo(
    () =>
      filterVisibleOrgChartVersions(versionsQuery.data ?? [], {
        showAdvancedHistorical,
      }),
    [versionsQuery.data, showAdvancedHistorical],
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
      setSelectedVersionIdState(versionId);
      clearOrgChartMainSession();
      void queryClient.removeQueries({
        predicate: (query) => {
          const root = query.queryKey[0];
          return (
            root === "org-root" ||
            root === "org-node" ||
            root === "org-children" ||
            root === "org-summary" ||
            root === "org-person-detail" ||
            root === "org-search"
          );
        },
      });
    },
    [canVersion, queryClient],
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
      showAdvancedHistorical,
      setShowAdvancedHistorical,
    }),
    [
      canVersion,
      selectedVersionId,
      setSelectedVersionId,
      visibleVersions,
      versionsQuery.isLoading,
      versionsQuery,
      showAdvancedHistorical,
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
      showAdvancedHistorical: false,
      setShowAdvancedHistorical: () => undefined,
    };
  }
  return context;
}

/** versionId para React Query: undefined para usuarios normales. */
export function useOrgChartVersionQueryId(): number | undefined {
  const { canVersion, selectedVersionId } = useOrgChartVersion();
  return canVersion ? selectedVersionId : undefined;
}
