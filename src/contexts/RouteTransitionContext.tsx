import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  PageLoadingScreen,
  type FlowLoadingIdentity,
} from "../components/PageLoadingScreen";

const SKIP_LOADER_PATHS = new Set(["/", "/loading"]);
const MIN_VISIBLE_MS = 800;
const EXIT_ANIMATION_MS = 220;
const FLOW_IDENTITY_STORAGE_KEY = "org-chart:flow-identity";

function isTeamRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/org/team/") ||
    pathname.startsWith("/org-chart/team/")
  );
}

function readStoredFlowIdentity(pathname: string): FlowLoadingIdentity | null {
  if (typeof window === "undefined" || !isTeamRoute(pathname)) return null;
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(FLOW_IDENTITY_STORAGE_KEY) ?? "null",
    ) as Partial<FlowLoadingIdentity> | null;
    return parsed &&
      typeof parsed.icon === "string" &&
      typeof parsed.label === "string" &&
      typeof parsed.glowColor === "string"
      ? (parsed as FlowLoadingIdentity)
      : null;
  } catch {
    return null;
  }
}

function clearStoredFlowIdentity() {
  window.sessionStorage.removeItem(FLOW_IDENTITY_STORAGE_KEY);
}

type RouteTransitionContextValue = {
  holdTransition: () => () => void;
  beginRouteTransition: (
    identity?: FlowLoadingIdentity | null,
  ) => Promise<void>;
  activateFlowIdentity: (identity: FlowLoadingIdentity | null) => void;
  flowIdentity: FlowLoadingIdentity | null;
};

const RouteTransitionContext =
  createContext<RouteTransitionContextValue | null>(null);

export function useHoldRouteTransition(active: boolean) {
  const ctx = useContext(RouteTransitionContext);

  useEffect(() => {
    if (!ctx || !active) return;
    return ctx.holdTransition();
  }, [ctx, active]);
}

export function useBeginRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    throw new Error("useBeginRouteTransition requiere RouteTransitionProvider");
  }
  return ctx.beginRouteTransition;
}

export function useFlowAreaIdentity() {
  return useContext(RouteTransitionContext)?.flowIdentity ?? null;
}

export function useActivateFlowIdentity() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    throw new Error("useActivateFlowIdentity requiere RouteTransitionProvider");
  }
  return ctx.activateFlowIdentity;
}

function shouldShowLoader(pathname: string): boolean {
  return !SKIP_LOADER_PATHS.has(pathname);
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [overlayPhase, setOverlayPhase] = useState<"off" | "on" | "out">("off");
  const [flowIdentity, setFlowIdentity] = useState<FlowLoadingIdentity | null>(
    () => readStoredFlowIdentity(location.pathname),
  );
  const holdCountRef = useRef(0);
  const minDoneRef = useRef(true);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const tryHide = useCallback(() => {
    if (!minDoneRef.current || holdCountRef.current > 0) return;
    clearHideTimer();
    setOverlayPhase((phase) =>
      phase === "off" || phase === "out" ? phase : "out",
    );
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

  const activateFlowIdentity = useCallback(
    (identity: FlowLoadingIdentity | null) => {
      if (identity === null) {
        document.documentElement.style.removeProperty("--flow-area-color");
        document.documentElement.classList.remove("flow-area-active");
        clearStoredFlowIdentity();
        setFlowIdentity(null);
        return;
      }
      document.documentElement.style.setProperty(
        "--flow-area-color",
        identity.glowColor,
      );
      document.documentElement.classList.add("flow-area-active");
      window.sessionStorage.setItem(
        FLOW_IDENTITY_STORAGE_KEY,
        JSON.stringify(identity),
      );
      setFlowIdentity(identity);
    },
    [],
  );

  const beginRouteTransition = useCallback(
    (identity?: FlowLoadingIdentity | null) => {
      clearHideTimer();
      minDoneRef.current = false;
      flushSync(() => {
        if (identity !== undefined) activateFlowIdentity(identity);
        setOverlayPhase("on");
      });
      return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    },
    [activateFlowIdentity, clearHideTimer],
  );

  useLayoutEffect(() => {
    if (!flowIdentity || !isTeamRoute(location.pathname)) return;
    document.documentElement.style.setProperty(
      "--flow-area-color",
      flowIdentity.glowColor,
    );
    document.documentElement.classList.add("flow-area-active");
  }, [flowIdentity, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/org" || location.pathname === "/") {
      document.documentElement.style.removeProperty("--flow-area-color");
      document.documentElement.classList.remove("flow-area-active");
      clearStoredFlowIdentity();
      setFlowIdentity(null);
    }

    if (!shouldShowLoader(location.pathname)) {
      holdCountRef.current = 0;
      minDoneRef.current = true;
      clearHideTimer();
      setOverlayPhase("off");
      return;
    }

    clearHideTimer();
    minDoneRef.current = false;
    setOverlayPhase("on");
    const minTimer = window.setTimeout(() => {
      minDoneRef.current = true;
      tryHide();
    }, MIN_VISIBLE_MS);
    return () => window.clearTimeout(minTimer);
  }, [location.pathname, tryHide, clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const value = {
    holdTransition,
    beginRouteTransition,
    activateFlowIdentity,
    flowIdentity,
  };

  return (
    <RouteTransitionContext.Provider value={value}>
      {flowIdentity && typeof document !== "undefined"
        ? createPortal(
            <div
              className="flow-area-background fixed inset-0 z-[1]"
              style={{ "--flow-area-color": flowIdentity.glowColor } as CSSProperties}
              aria-hidden="true"
            />,
            document.body,
          )
        : null}
      {children}
      {overlayPhase !== "off" && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] isolate" role="presentation">
              <PageLoadingScreen
                variant="flow"
                flowIdentity={flowIdentity}
                className={[
                  "min-h-full",
                  overlayPhase === "out" ? "loading-screen--exit" : "",
                ].filter(Boolean).join(" ")}
              />
            </div>,
            document.body,
          )
        : null}
    </RouteTransitionContext.Provider>
  );
}
