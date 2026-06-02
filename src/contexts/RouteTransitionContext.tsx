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
const MIN_LOADER_MS = 720;

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

function shouldShowLoader(pathname: string): boolean {
  return !SKIP_LOADER_PATHS.has(pathname);
}

type RouteTransitionProviderProps = {
  children: ReactNode;
};

/**
 * Overlay global al cambiar de ruta. Permanece hasta el tiempo mínimo y
 * mientras algún guard o página reporte carga con `useHoldRouteTransition`.
 */
export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const holdCountRef = useRef(0);
  const minDoneRef = useRef(true);

  const tryHide = useCallback(() => {
    if (minDoneRef.current && holdCountRef.current === 0) {
      setVisible(false);
    }
  }, []);

  const holdTransition = useCallback(() => {
    holdCountRef.current += 1;
    return () => {
      holdCountRef.current = Math.max(0, holdCountRef.current - 1);
      tryHide();
    };
  }, [tryHide]);

  useEffect(() => {
    if (!shouldShowLoader(location.pathname)) {
      holdCountRef.current = 0;
      minDoneRef.current = true;
      setVisible(false);
      return;
    }

    minDoneRef.current = false;
    setVisible(true);

    const minTimer = window.setTimeout(() => {
      minDoneRef.current = true;
      tryHide();
    }, MIN_LOADER_MS);

    return () => {
      window.clearTimeout(minTimer);
    };
  }, [location.pathname, tryHide]);

  const value: RouteTransitionContextValue = { holdTransition };

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      {visible && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] isolate bg-[#020817]"
              role="presentation"
            >
              <PageLoadingScreen className="min-h-full" />
            </div>,
            document.body,
          )
        : null}
    </RouteTransitionContext.Provider>
  );
}
