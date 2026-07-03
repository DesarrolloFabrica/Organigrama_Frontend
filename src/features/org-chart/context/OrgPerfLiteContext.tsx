import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useOrgPerfLiteMode } from "../hooks/useOrgPerfLiteMode";

type OrgPerfLiteMetrics = {
  visibleNodeCount?: number;
  directReportsCount?: number;
};

type OrgPerfLiteContextValue = {
  liteMode: boolean;
  reportMetrics: (source: string, metrics: OrgPerfLiteMetrics) => void;
};

const OrgPerfLiteContext = createContext<OrgPerfLiteContextValue | null>(null);

export function OrgPerfLiteProvider({ children }: { children: ReactNode }) {
  const [metricsBySource, setMetricsBySource] = useState<
    Record<string, OrgPerfLiteMetrics>
  >({});

  const reportMetrics = useCallback(
    (source: string, metrics: OrgPerfLiteMetrics) => {
      setMetricsBySource((previous) => {
        const current = previous[source];
        if (
          current?.visibleNodeCount === metrics.visibleNodeCount &&
          current?.directReportsCount === metrics.directReportsCount
        ) {
          return previous;
        }
        return { ...previous, [source]: metrics };
      });
    },
    [],
  );

  const aggregatedMetrics = useMemo(() => {
    let visibleNodeCount = 0;
    let directReportsCount = 0;

    for (const metrics of Object.values(metricsBySource)) {
      visibleNodeCount = Math.max(
        visibleNodeCount,
        metrics.visibleNodeCount ?? 0,
      );
      directReportsCount = Math.max(
        directReportsCount,
        metrics.directReportsCount ?? 0,
      );
    }

    return { visibleNodeCount, directReportsCount };
  }, [metricsBySource]);

  const liteMode = useOrgPerfLiteMode(aggregatedMetrics);

  const value = useMemo<OrgPerfLiteContextValue>(
    () => ({ liteMode, reportMetrics }),
    [liteMode, reportMetrics],
  );

  return (
    <OrgPerfLiteContext.Provider value={value}>
      <div
        className={[
          "flex min-h-0 flex-1 flex-col",
          liteMode ? "org-ui--lite" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </OrgPerfLiteContext.Provider>
  );
}

export function useOrgPerfLite(): OrgPerfLiteContextValue {
  const context = useContext(OrgPerfLiteContext);
  if (!context) {
    return {
      liteMode: false,
      reportMetrics: () => undefined,
    };
  }
  return context;
}
