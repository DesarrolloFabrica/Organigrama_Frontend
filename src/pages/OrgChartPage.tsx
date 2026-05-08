import { useEffect, useState } from "react";
import { type OrgNode, countPeopleUnder } from "../features/org-chart/types";
import {
  fetchHealth,
  fetchOrgChart,
} from "../features/org-chart/services/orgChartService";
import { OrgMapView } from "../features/org-chart/components/OrgMapView";
import { PersonDetailPanel } from "../features/org-chart/components/PersonDetailPanel";

type ConnState = "checking" | "online" | "offline";

/** Busca un nodo por id en el árbol (mismo contrato que el API). */
function findNodeInTree(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeInTree(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Página principal: árbol a la izquierda, panel de detalle a la derecha.
 * La selección dispara GET /api/org-chart/person/:id en el panel.
 */
export function OrgChartPage() {
  const [conn, setConn] = useState<ConnState>("checking");
  const [tree, setTree] = useState<OrgNode | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const treeDescendantCount =
    tree && selectedPersonId
      ? (() => {
          const n = findNodeInTree(tree, selectedPersonId);
          return n ? countPeopleUnder(n) : null;
        })()
      : null;

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then(() => {
        if (!cancelled) setConn("online");
      })
      .catch(() => {
        if (!cancelled) setConn("offline");
      });

    fetchOrgChart()
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
              : "Error desconocido al cargar datos",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statusBadge =
    conn === "checking" ? (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
        <span
          className="size-2 animate-pulse rounded-full bg-amber-400"
          aria-hidden
        />
        Comprobando backend…
      </span>
    ) : conn === "online" ? (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
        Backend conectado
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
        <span className="size-2 rounded-full bg-rose-500" aria-hidden />
        Sin conexión con el backend
      </span>
    );

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Dirección de Operaciones
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Organigrama OP
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Visualización estructural de la Dirección de Operaciones
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            {statusBadge}
            <p className="text-xs text-slate-500">
              API esperada en{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">
                {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}
              </code>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {chartError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          >
            <p className="font-medium">No se pudo cargar el organigrama</p>
            <p className="mt-1 text-rose-800/90">{chartError}</p>
          </div>
        ) : tree ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_min(24rem,32%)] xl:items-start">
            <OrgMapView
              root={tree}
              selectedPersonId={selectedPersonId}
              onSelectNode={setSelectedPersonId}
            />
            <div className="lg:sticky lg:top-6">
              <PersonDetailPanel
                personId={selectedPersonId}
                treeDescendantCount={treeDescendantCount}
                onClose={() => setSelectedPersonId(null)}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
            Cargando organigrama…
          </div>
        )}
      </main>
    </>
  );
}
