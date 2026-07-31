import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RouteTransitionProvider } from "./contexts/RouteTransitionContext";
import { getGoogleClientId } from "./auth/authService";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireProfileComplete } from "./auth/RequireProfileComplete";
import { RequireProfileIncomplete } from "./auth/RequireProfileIncomplete";
import { PageLoadingScreen } from "./components/PageLoadingScreen";
import { OrgChartLayout } from "./features/org-chart/layout/OrgChartLayout";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const OnboardingPage = lazy(() =>
  import("./pages/OnboardingPage").then((module) => ({
    default: module.OnboardingPage,
  })),
);
const BootLoadingPage = lazy(() =>
  import("./pages/BootLoadingPage").then((module) => ({
    default: module.BootLoadingPage,
  })),
);
const OrgChartPage = lazy(() =>
  import("./pages/OrgChartPage").then((module) => ({
    default: module.OrgChartPage,
  })),
);
const OrgChartExplorePage = lazy(() =>
  import("./pages/OrgChartExplorePage").then((module) => ({
    default: module.OrgChartExplorePage,
  })),
);
const CompetencyExplorerPage = lazy(() =>
  import("./features/competency-explorer").then((module) => ({
    default: module.CompetencyExplorerPage,
  })),
);

function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoadingScreen />}>{children}</Suspense>;
}

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
            <Route
              path="/"
              element={
                <RouteSuspense>
                  <LoginPage />
                </RouteSuspense>
              }
            />

            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <RequireProfileIncomplete>
                    <RouteSuspense>
                      <OnboardingPage />
                    </RouteSuspense>
                  </RequireProfileIncomplete>
                </RequireAuth>
              }
            />

            <Route
              path="/loading"
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <RouteSuspense>
                      <BootLoadingPage />
                    </RouteSuspense>
                  </RequireProfileComplete>
                </RequireAuth>
              }
            />

            <Route
              element={
                <RequireAuth>
                  <RequireProfileComplete>
                    <OrgChartLayout />
                  </RequireProfileComplete>
                </RequireAuth>
              }
            >
              <Route
                path="/org"
                element={
                  <RouteSuspense>
                    <OrgChartPage />
                  </RouteSuspense>
                }
              />

              <Route
                path="/org/team/:personId"
                element={
                  <RouteSuspense>
                    <OrgChartExplorePage />
                  </RouteSuspense>
                }
              />

              <Route
                path="/org/competency-explorer"
                element={
                  <RouteSuspense>
                    <CompetencyExplorerPage />
                  </RouteSuspense>
                }
              />

              <Route
                path="/org-chart/team/:personId"
                element={
                  <RouteSuspense>
                    <OrgChartExplorePage />
                  </RouteSuspense>
                }
              />
            </Route>

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
