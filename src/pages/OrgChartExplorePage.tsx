import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { type OrgNode, countPeopleUnder } from "../features/org-chart/types";
import { findNodeInTree } from "../features/org-chart/utils/findNodeInTree";
import {
  fetchHealth,
  fetchOrgChartSubtree,
} from "../features/org-chart/services/orgChartService";
import { OrgMapView } from "../features/org-chart/components/OrgMapView";
import { PersonDetailPanel } from "../features/org-chart/components/PersonDetailPanel";
import { LogoutButton } from "../features/org-chart/components/LogoutButton";


type ConnState = "checking" | "online" | "offline";

const MAP_MAX_LEVELS = 4;

type ExploreBodyProps = {
  personId: string;
  conn: ConnState;
};

/**
 * Contenido acoplado a una persona: al cambiar `personId` en la ruta, el padre remonta
 * este bloque con `key` para evitar resets síncronos dentro del efecto de carga.
 */
function OrgChartExploreBody({ personId, conn }: ExploreBodyProps) {
  const navigate = useNavigate();
  const [tree, setTree] = useState<OrgNode | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [detailPanelMinimized, setDetailPanelMinimized] = useState(false);

  const treeDescendantCount =
    tree && selectedPersonId
      ? (() => {
          const n = findNodeInTree(tree, selectedPersonId);
          return n ? countPeopleUnder(n) : null;
        })()
      : null;

  const handleSelectNodeFromMap = useCallback((id: string) => {
    setDetailPanelMinimized(false);
    setSelectedPersonId(id);
  }, []);

  const handleExploreTeam = useCallback(
    (id: string) => {
      navigate(`/org-chart/team/${encodeURIComponent(id)}`);
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;

    fetchOrgChartSubtree(personId)
      .then((data) => {
        if (!cancelled) {
          setTree(data);
          setChartError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTree(null);
          setChartError(
            err instanceof Error
              ? err.message
              : "Error desconocido al cargar el equipo",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [personId]);

  const apiBaseDisplay =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

  const statusPill =
    conn === "checking" ? (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-slate-200/90 bg-white/80 px-2 py-1 shadow-sm"
      >
        <span className="relative flex size-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-amber-400/50" />
          <span className="relative size-1.5 rounded-full bg-amber-500" />
        </span>
        <span className="truncate text-[11px] font-medium text-slate-700">
          Verificando…
        </span>
      </div>
    ) : conn === "online" ? (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/80 px-2 py-1 shadow-sm ring-1 ring-cyan-500/8"
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-emerald-500"
          aria-hidden
        />
        <span className="truncate text-[11px] font-semibold text-slate-800">
          Conectado
        </span>
      </div>
    ) : (
      <div
        role="status"
        title={`API: ${apiBaseDisplay}`}
        className="inline-flex max-w-44 items-center gap-1.5 rounded-md border border-rose-200/90 bg-rose-50/90 px-2 py-1 shadow-sm"
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-rose-500"
          aria-hidden
        />
        <span className="truncate text-[11px] font-medium text-rose-900">
          Sin conexión
        </span>
      </div>
    );

  const detailOverlayOpen = Boolean(selectedPersonId && !detailPanelMinimized);

  return (
    <div className="flex min-h-0 flex-1 flex-col [--app-header-h:2.75rem] sm:[--app-header-h:3rem]">
      <header className="sticky top-0 z-20 shrink-0 border-b border-cyan-300/15 bg-[#020617]/82 shadow-[0_12px_38px_-20px_rgba(34,211,238,0.45)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent"
          aria-hidden
        />
        <div className="mx-auto flex h-[var(--app-header-h)] max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-[0.9375rem]">
              Organigrama OP
            </h1>
            <span
              className="hidden h-3 w-px shrink-0 bg-slate-200 sm:block"
              aria-hidden
            />
            <span className="hidden truncate font-mono text-[10px] font-medium uppercase tracking-wider text-cyan-100/90 sm:inline">
              Dirección de Operaciones
            </span>
          </div>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <span className="hidden rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.28em] text-cyan-100/65 shadow-[0_0_22px_rgba(34,211,238,0.08)] sm:inline-flex">
              <span
                className="size-1 rounded-full bg-cyan-500/55"
                aria-hidden
              />
              Mapa operacional
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {statusPill}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden bg-transparent">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.10),transparent_42%)]"
        />
        {chartError ? (
          <div className="flex h-full min-h-0 items-center justify-center overflow-auto p-6">
            <div
              role="alert"
              className="max-w-lg rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              <p className="font-medium">No se pudo cargar el equipo</p>
              <p className="mt-1 text-rose-800/90">{chartError}</p>
              <p className="mt-3">
                <Link
                  to="/"
                  className="font-semibold text-cyan-800 underline decoration-cyan-400/60 underline-offset-2 hover:text-cyan-950"
                >
                  Volver al organigrama completo
                </Link>
              </p>
            </div>
          </div>
        ) : tree ? (
          <>
            <div className="absolute inset-0 z-0 flex min-h-0 flex-col">
              <OrgMapView
                key={tree.id}
                variant="fullscreen"
                detailDrawerOpen={detailOverlayOpen}
                root={tree}
                selectedPersonId={selectedPersonId}
                onSelectNode={handleSelectNodeFromMap}
                maxRenderLevels={MAP_MAX_LEVELS}
                initialShowRootChildren
                onExploreTeam={handleExploreTeam}
                showBackButton
                onBack={() => navigate("/org")}
              />
            </div>

            <div
              className="pointer-events-none absolute inset-0 z-30 flex max-sm:items-end max-sm:justify-center sm:items-stretch sm:justify-end sm:p-4"
              aria-hidden={!detailOverlayOpen}
            >
              {detailOverlayOpen ? (
                <aside
                  className="entity-detail-overlay pointer-events-auto flex h-full max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] min-h-0 w-full max-w-[420px] flex-col overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] max-sm:fixed max-sm:bottom-3 max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:max-h-[min(85dvh,calc(100vh-var(--app-header-h)-1.5rem))] sm:max-h-[calc(100vh-var(--app-header-h)-2rem)] sm:w-[min(420px,calc(100vw-2rem))]"
                  aria-label="Ficha técnica de la persona"
                >
                  <PersonDetailPanel
                    personId={selectedPersonId}
                    treeDescendantCount={treeDescendantCount}
                    layoutVariant="overlay"
                    onMinimize={() => setDetailPanelMinimized(true)}
                    onClose={() => {
                      setSelectedPersonId(null);
                      setDetailPanelMinimized(false);
                    }}
                  />
                </aside>
              ) : null}
            </div>

            {selectedPersonId && detailPanelMinimized ? (
              <button
                type="button"
                className="pointer-events-auto fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-lg backdrop-blur-sm transition hover:border-cyan-300/60 hover:text-cyan-900 sm:absolute sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
                onClick={() => setDetailPanelMinimized(false)}
                aria-label="Mostrar ficha técnica"
              >
                <span
                  className="font-mono text-[10px] text-cyan-700/90"
                  aria-hidden
                >
                  ◈
                </span>
                Ficha
              </button>
            ) : null}
          </>
        ) : (
          <div className="flex h-full min-h-0 items-center justify-center overflow-auto p-6">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
              Cargando equipo…
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Vista de exploración profunda: el árbol se recarga con la persona de la URL como raíz
 * y se aplica el mismo tope de niveles que en el organigrama principal.
 */
export function OrgChartExplorePage() {
  const { personId } = useParams<{ personId: string }>();
  const [conn, setConn] = useState<ConnState>("checking");

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then(() => {
        if (!cancelled) setConn("online");
      })
      .catch(() => {
        if (!cancelled) setConn("offline");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!personId) {
    return <Navigate to="/" replace />;
  }

  return <OrgChartExploreBody key={personId} personId={personId} conn={conn} />;
}
