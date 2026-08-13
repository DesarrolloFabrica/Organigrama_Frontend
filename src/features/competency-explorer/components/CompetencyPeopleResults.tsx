import type {
  CompetencyPeopleSearchQuery,
  CompetencyPeopleSearchResponse,
} from "../types/competencyPeopleSearch.types";
import { resolveCompetencyPeopleSearchViewState } from "../utils/competencyPeopleSearchPresentation";
import { CompetencyPersonCard } from "./CompetencyPersonCard";

type Props = {
  query: CompetencyPeopleSearchQuery;
  data?: CompetencyPeopleSearchResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onSelectDomain: (code: string) => void;
  onBroaden: () => void;
  onOpenPerson: (personId: string) => void;
  onPageChange: (page: number) => void;
};

export function CompetencyPeopleResults({
  query,
  data,
  isLoading,
  isError,
  error,
  onRetry,
  onSelectDomain,
  onBroaden,
  onOpenPerson,
  onPageChange,
}: Props) {
  const state = resolveCompetencyPeopleSearchViewState({
    query,
    isLoading,
    isError,
    total: data?.total,
  });

  if (state === "LOADING") return <ResultsSkeleton />;

  if (state === "ERROR") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-400/25 bg-rose-950/25 p-5"
      >
        <h2 className="text-base font-semibold text-rose-100">
          No se pudo consultar el explorador
        </h2>
        <p className="mt-2 text-sm text-rose-200/80">
          {error instanceof Error ? error.message : "Error inesperado de red."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-rose-300/30 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-950/50"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (state === "INITIAL") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Explore el conocimiento publicado
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
            {data?.authorizedUniverseTotal ?? 0} perfiles MC1 visibles. Elija un
            dominio; cada contador representa personas distintas dentro de su
            universo autorizado.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.facets.domains ?? []).map((domain) => (
            <li key={domain.code}>
              <button
                type="button"
                onClick={() => onSelectDomain(domain.code)}
                className="flex h-full w-full items-center justify-between gap-3 rounded-xl border border-cyan-400/15 bg-[#06111f]/65 p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-950/25"
              >
                <span className="text-sm font-medium text-slate-100">
                  {domain.label}
                </span>
                <span className="rounded-full bg-cyan-950/60 px-2 py-1 text-xs tabular-nums text-cyan-200">
                  {domain.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (state === "EMPTY") {
    return (
      <div className="rounded-xl border border-dashed border-slate-600/60 bg-slate-950/25 px-5 py-10 text-center">
        <h2 className="text-lg font-semibold text-slate-100">
          No hay personas que cumplan todos los criterios
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          La combinación es válida, pero no tiene coincidencias en su universo
          visible. Retire el último criterio para ampliar la búsqueda.
        </p>
        <button
          type="button"
          onClick={onBroaden}
          className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-950/25 px-3 py-2 text-xs text-cyan-100 hover:bg-cyan-950/45"
        >
          Ampliar búsqueda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">
          Personas encontradas
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {data?.total ?? 0} persona{data?.total === 1 ? "" : "s"} · dominio
          principal primero y luego nombre.
        </p>
      </header>

      <ul className="space-y-3">
        {(data?.people ?? []).map((person) => (
          <li key={person.personId}>
            <CompetencyPersonCard person={person} onOpen={onOpenPerson} />
          </li>
        ))}
      </ul>

      {data && data.pagination.totalPages > 1 ? (
        <nav
          className="flex items-center justify-between border-t border-slate-700/50 pt-4"
          aria-label="Paginación de resultados"
        >
          <button
            type="button"
            disabled={data.pagination.page <= 1}
            onClick={() => onPageChange(data.pagination.page - 1)}
            className="rounded-lg border border-slate-600/50 px-3 py-1.5 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs tabular-nums text-slate-400">
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => onPageChange(data.pagination.page + 1)}
            className="rounded-lg border border-slate-600/50 px-3 py-1.5 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3" aria-label="Cargando personas" aria-busy>
      <div className="h-7 w-48 animate-pulse rounded bg-slate-800/70" />
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-xl border border-slate-700/40 bg-slate-900/45"
        />
      ))}
    </div>
  );
}
