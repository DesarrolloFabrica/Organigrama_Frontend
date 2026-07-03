import { useOrgChartHealthQuery } from "../../../lib/react-query/hooks/useOrgChartHealth";
import type { OrgChartConnState } from "../components/OrgChartConnectionStatus";

export function useOrgChartConnection(): OrgChartConnState {
  const { isLoading, isError } = useOrgChartHealthQuery();

  if (isLoading) return "checking";
  if (isError) return "offline";
  return "online";
}
