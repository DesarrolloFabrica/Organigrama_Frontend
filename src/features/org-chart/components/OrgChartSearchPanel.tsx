import { useEffect, useRef, useState } from "react";
import {
  useDebouncedValue,
  useOrgChartSearch,
} from "../../../lib/react-query/hooks";
import type { OrgChartSearchHit } from "../types";
import { isOrgNodeVacancy } from "../types";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";

const SEARCH_DEBOUNCE_MS = 280;

type Props = {
  onSelectHit: (personId: string) => void;
  className?: string;
  /** Evita ids duplicados cuando hay instancia móvil y desktop. */
  inputId?: string;
};

function roleLabel(hit: OrgChartSearchHit): string {
  if (hit.role?.name?.trim()) {
    return hit.role.name;
  }
  if (hit.edu_email?.trim()) {
    return hit.edu_email;
  }
  return "Vista limitada";
}

/**
 * Búsqueda ligera del organigrama (incluye vacantes con badge VACANTE).
 */
export function OrgChartSearchPanel({
  onSelectHit,
  className = "",
  inputId = "org-chart-search-input",
}: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const trimmed = debouncedQuery.trim();
  const searchEnabled = trimmed.length >= 2;

  const {
    data: results,
    isLoading,
    isError,
    error: searchError,
  } = useOrgChartSearch(debouncedQuery);

  const hits = searchEnabled ? (results ?? []) : [];
  const showSearching = searchEnabled && isLoading && results === undefined;
  const errorMessage = isError
    ? searchError instanceof Error
      ? searchError.message
      : "Error al buscar en el organigrama"
    : null;

  useEffect(() => {
    if (!searchEnabled) {
      setOpen(false);
      return;
    }
    if (results !== undefined || isError) {
      setOpen(true);
    }
  }, [searchEnabled, results, isError]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <label className="sr-only" htmlFor={inputId}>
        Buscar en el organigrama
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true);
        }}
        placeholder="Buscar persona o plaza…"
        autoComplete="off"
        className="w-full min-w-0 rounded-md border border-cyan-300/20 bg-slate-950/70 px-2.5 py-1.5 font-mono text-[11px] text-slate-100 placeholder:text-slate-500 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)] outline-none transition focus:border-cyan-400/35 focus:ring-1 focus:ring-cyan-400/25 sm:min-w-[10rem] sm:max-w-[260px]"
      />

      {open && query.trim().length >= 2 ? (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-1.5rem,320px)] overflow-hidden rounded-lg border border-slate-600/40 bg-[#0f172a]/98 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:left-0 sm:right-auto"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {showSearching ? (
            <p className="px-3 py-4 text-center text-xs text-slate-400">
              Buscando…
            </p>
          ) : errorMessage ? (
            <p className="px-3 py-4 text-center text-xs text-rose-300/90" role="alert">
              {errorMessage}
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-500">
              Sin coincidencias.
            </p>
          ) : (
            <ul className="max-h-[min(50vh,280px)] overflow-y-auto py-1">
              {hits.map((hit) => {
                const vacancy = isOrgNodeVacancy(hit);
                return (
                  <li key={hit.id} role="option">
                    <button
                      type="button"
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-800/80"
                      aria-label={
                        vacancy
                          ? `Abrir plaza disponible: ${hit.name}`
                          : `Abrir ficha de ${hit.name}`
                      }
                      onClick={() => {
                        onSelectHit(hit.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span
                        className={[
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
                          vacancy
                            ? "border-slate-500/35 bg-slate-800/60"
                            : "border-cyan-500/20 bg-cyan-950/40 font-mono text-[10px] font-bold text-cyan-100/90",
                        ].join(" ")}
                        aria-hidden
                      >
                        {vacancy ? (
                          <OrgMapVacancyGlyph
                            size="sm"
                            className="text-slate-400/90"
                            decorative
                          />
                        ) : (
                          hit.name
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase() || "—"
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-slate-100">
                            {hit.name}
                          </span>
                          {vacancy ? (
                            <span
                              className="shrink-0 rounded border border-dashed border-slate-500/50 bg-slate-800/50 px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider text-slate-300"
                              aria-hidden
                            >
                              Vacante
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                          {roleLabel(hit)}
                          {hit.hierarchy?.name
                            ? ` · ${hit.hierarchy.name}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
