import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RouteTransitionProvider } from "./contexts/RouteTransitionContext";
import { getGoogleClientId } from "./auth/authService";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireProfileComplete } from "./auth/RequireProfileComplete";
import { RequireProfileIncomplete } from "./auth/RequireProfileIncomplete";
import { OrgChartPage } from "./pages/OrgChartPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OrgChartExplorePage } from "./pages/OrgChartExplorePage";
import { LoginPage } from "./pages/LoginPage";
import { BootLoadingPage } from "./pages/BootLoadingPage";
import { OrgChartVersionProvider } from "./features/org-chart/context/OrgChartVersionContext";

/** Shell de la app: organigrama global y exploración por equipo. */
function App() {
  return (
    <GoogleOAuthProvider clientId={getGoogleClientId()}>
    <BrowserRouter>
      <div className="relative flex min-h-screen min-h-0 flex-col overflow-hidden bg-[#020617] text-slate-100">
        {/* Atmósfera global: da sensación de cabina de control sin tocar la lógica. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(20,184,166,0.10),transparent_28%),linear-gradient(180deg,#020617_0%,#06111f_45%,#020617_100%)]"
        />

        {/* Viñeta sutil: oscurece bordes y concentra la atención en el mapa. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(0,0,0,0.48)_100%)]"
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <RouteTransitionProvider>
          <Routes>
            {/* Login temporal */}
            <Route path="/" element={<LoginPage />} />

            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <RequireProfileIncomplete>
                    <OnboardingPage />
                  </RequireProfileIncomplete>
                </RequireAuth>
              }
            />

            <Route
              path="/loading"
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <BootLoadingPage />
                  </RequireProfileComplete>
                </RequireAuth>
              }
            />

            {/* Organigrama principal */}
            <Route
              path="/org"
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <OrgChartVersionProvider>
                      <OrgChartPage />
                    </OrgChartVersionProvider>
                  </RequireProfileComplete>
                </RequireAuth>
              }
            />

            {/* Flujo de exploración actual */}
            <Route
              path="/org/team/:personId"
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <OrgChartVersionProvider>
                      <OrgChartExplorePage />
                    </OrgChartVersionProvider>
                  </RequireProfileComplete>
                </RequireAuth>
              }
            />

            {/* Compatibilidad con la ruta anterior */}
            <Route
              path="/org-chart/team/:personId"
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <OrgChartExplorePage />
                  </RequireProfileComplete>
                </RequireAuth>
              }
            />

            {/* Redirección antigua al organigrama */}
            <Route path="/org-chart" element={<Navigate to="/org" replace />} />

            {/* Cualquier ruta inválida vuelve al login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </RouteTransitionProvider>
        </div>
      </div>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
