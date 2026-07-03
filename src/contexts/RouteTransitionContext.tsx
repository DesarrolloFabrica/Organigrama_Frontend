import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { PageLoadingScreen } from "../components/PageLoadingScreen";

const SKIP_LOADER_PATHS = new Set(["/", "/loading"]);
const MIN_FLASH_MS = 150;
const EXIT_ANIMATION_MS = 220;

type RouteTransitionContextValue = {
  holdTransition: () => () => void;
};

const RouteTransitionContext =
  createContext<RouteTransitionContextValue | null>(null);

/** Mantiene el overlay mientras `active` sea true (p. ej. fetch o guard). */
export function useHoldRouteTransition(active: boolean) {
  const ctx = useContext(RouteTransitionContext);

  useEffect(() => {
    if (!ctx || !active) {
      return;
    }
    return ctx.holdTransition();
  }, [ctx, active]);
}

function isOrgChartRoute(pathname: string): boolean {
  return (
    pathname === "/org" ||
    pathname.startsWith("/org/team/") ||
    pathname.startsWith("/org-chart/team/")
  );
}

function shouldShowLoader(pathname: string, previousPathname: string | null): boolean {
  if (SKIP_LOADER_PATHS.has(pathname)) return false;
  if (
    previousPathname &&
    isOrgChartRoute(pathname) &&
    isOrgChartRoute(previousPathname)
  ) {
    return false;
  }
  return true;
}

type RouteTransitionProviderProps = {
  children: ReactNode;
};

/**
 * Overlay global al cambiar de ruta. Permanece solo el mínimo anti-flash
 * o mientras algún guard o página reporte carga con `useHoldRouteTransition`.
 */
export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  const location = useLocation();
  const [overlayPhase, setOverlayPhase] = useState<"off" | "on" | "out">("off");
  const holdCountRef = useRef(0);
  const minDoneRef = useRef(true);
  const hideTimerRef = useRef<number | null>(null);
  const transitionStartedAtRef = useRef(0);
  const previousPathnameRef = useRef<string | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const tryHide = useCallback(() => {
    if (!minDoneRef.current || holdCountRef.current > 0) {
      return;
    }

    clearHideTimer();
    setOverlayPhase((phase) => {
      if (phase === "off" || phase === "out") {
        return phase;
      }
      return "out";
    });

    hideTimerRef.current = window.setTimeout(() => {
      setOverlayPhase("off");
      hideTimerRef.current = null;
    }, EXIT_ANIMATION_MS);
  }, [clearHideTimer]);

  const holdTransition = useCallback(() => {
    holdCountRef.current += 1;
    clearHideTimer();
    setOverlayPhase("on");
    return () => {
      holdCountRef.current = Math.max(0, holdCountRef.current - 1);
      tryHide();
    };
  }, [clearHideTimer, tryHide]);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = location.pathname;

    if (!shouldShowLoader(location.pathname, previousPathname)) {
      holdCountRef.current = 0;
      minDoneRef.current = true;
      clearHideTimer();
      setOverlayPhase("off");
      return;
    }

    clearHideTimer();
    transitionStartedAtRef.current = performance.now();
    minDoneRef.current = false;
    setOverlayPhase("on");

    const elapsed = () => performance.now() - transitionStartedAtRef.current;
    const scheduleMinDone = () => {
      const remaining = MIN_FLASH_MS - elapsed();
      if (remaining <= 0) {
        minDoneRef.current = true;
        tryHide();
        return;
      }
      window.setTimeout(() => {
        minDoneRef.current = true;
        tryHide();
      }, remaining);
    };

    const minTimer = window.setTimeout(scheduleMinDone, 0);

    return () => {
      window.clearTimeout(minTimer);
    };
  }, [location.pathname, tryHide, clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const value: RouteTransitionContextValue = { holdTransition };

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      {overlayPhase !== "off" && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] isolate"
              role="presentation"
            >
              <PageLoadingScreen
                className={[
                  "min-h-full",
                  overlayPhase === "out" ? "loading-screen--exit" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>,
            document.body,
          )
        : null}
    </RouteTransitionContext.Provider>
  );
}
