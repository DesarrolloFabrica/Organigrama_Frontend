import { Outlet } from "react-router-dom";
import { OrgPerfLiteProvider } from "../context/OrgPerfLiteContext";
import { OrgChartVersionProvider } from "../context/OrgChartVersionContext";
import { useOrgChartHealthQuery } from "../../../lib/react-query/hooks/useOrgChartHealth";

function OrgChartLayoutBody() {
  useOrgChartHealthQuery();
  return <Outlet />;
}

/**
 * Layout persistente del organigrama: versiones, health check y modo lite global.
 */
export function OrgChartLayout() {
  return (
    <OrgChartVersionProvider>
      <OrgPerfLiteProvider>
        <OrgChartLayoutBody />
      </OrgPerfLiteProvider>
    </OrgChartVersionProvider>
  );
}
