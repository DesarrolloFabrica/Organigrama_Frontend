import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { OrgChartPage } from "./pages/OrgChartPage";
import { OrgChartExplorePage } from "./pages/OrgChartExplorePage";

/** Shell de la app: organigrama global y exploración por equipo. */
function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen min-h-0 flex-col bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<OrgChartPage />} />
          <Route path="/org-chart" element={<Navigate to="/" replace />} />
          <Route
            path="/org-chart/team/:personId"
            element={<OrgChartExplorePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
