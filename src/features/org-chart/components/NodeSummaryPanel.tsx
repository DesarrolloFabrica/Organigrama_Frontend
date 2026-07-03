import { useState, type ReactNode } from "react";
import {
  useOrgChartSummary,
  useOrgChartVacancies,
} from "../../../lib/react-query/hooks";
import {
  isOrgSummaryVacancy,
  type OrgChartVacancy,
  type OrgSummaryItem,
} from "../types";

type Props = {
  personId: string;
  className?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function SummaryChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[
        "size-4 shrink-0 text-cyan-200/90 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        expanded ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 10l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSummaryChart() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 16V8M8 16V4M13 16v-6M18 16V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 7h14v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm3-3h8a1 1 0 011 1v2H5V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPeople({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 20v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M12 11a4 4 0 100-8 4 4 0 000 8zm8 9v-1a3 3 0 00-2.2-2.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTeam({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 11a3 3 0 100-6 3 3 0 000 6zM4 20v-1.5A4.5 4.5 0 019.5 14H14a4.5 4.5 0 014.5 4.5V20M17 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM20 20v-1.2a3.3 3.3 0 00-2.4-3.18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconVacancy({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type KpiCardProps = {
  icon: ReactNode;
  value: number;
  label: string;
  accent: "blue" | "green";
};

function SummaryTeamRow({ item }: { item: OrgSummaryItem }) {
  const vacancy = isOrgSummaryVacancy(item);

  return (
    <li
      className={[
        "flex items-center gap-2 rounded-lg border px-2 py-1.5 shadow-[0_2px_12px_-8px_rgba(0,0,0,0.45)]",
        vacancy
          ? "border-slate-500/25 bg-slate-900/40"
          : "border-cyan-400/12 bg-white/[0.03]",
      ].join(" ")}
    >
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
          vacancy
            ? "bg-slate-800/80 text-slate-300"
            : "bg-cyan-950/60 text-cyan-100/90 ring-1 ring-cyan-400/15",
        ].join(" ")}
        aria-hidden
      >
        {vacancy ? (
          <IconVacancy className="size-4" />
        ) : (
          initialsFromName(item.name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[11px] font-bold leading-tight text-slate-100"
          title={item.name}
        >
          {item.name}
        </p>
        {item.roleName ? (
          <p
            className="truncate text-[10px] leading-tight text-slate-400"
            title={item.roleName}
          >
            {item.roleName}
          </p>
        ) : null}
        {vacancy ? (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Plaza vacante
          </p>
        ) : (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0 text-[10px] tabular-nums leading-none">
            <span className="inline-flex items-center gap-0.5 font-semibold text-cyan-200/90">
              <IconPeople className="size-3" />
              {item.totalPeople}
              <span className="font-medium text-slate-500">pers.</span>
            </span>
            <span
              className={[
                "inline-flex items-center gap-0.5 font-semibold",
                item.vacancies > 0 ? "text-cyan-200/90" : "text-slate-500",
              ].join(" ")}
            >
              <IconVacancy className="size-3" />
              {item.vacancies}
              <span className="font-medium text-slate-500">vac.</span>
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

/** Fila de una vacante real del schema `vacancies` (no es un nodo del mapa). */
function VacancyListRow({ vacancy }: { vacancy: OrgChartVacancy }) {
  const positionName = vacancy.positionName?.trim();
  const title = positionName ? `VACANTE — ${positionName}` : "VACANTE";
  const detail =
    vacancy.curricularLine?.trim() ||
    vacancy.programName?.trim() ||
    vacancy.schoolName?.trim() ||
    null;
  const quantity = vacancy.quantity ?? null;

  return (
    <li className="flex items-center gap-2 rounded-lg border border-slate-500/25 bg-slate-900/40 px-2 py-1.5 shadow-[0_2px_12px_-8px_rgba(0,0,0,0.45)]">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-800/80 text-slate-300"
        aria-hidden
      >
        <IconVacancy className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[11px] font-bold leading-tight text-slate-100"
          title={title}
        >
          {title}
        </p>
        {detail ? (
          <p
            className="truncate text-[10px] leading-tight text-slate-400"
            title={detail}
          >
            {detail}
          </p>
        ) : null}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] leading-none">
          {quantity != null ? (
            <span className="font-semibold tabular-nums text-slate-300">
              {quantity === 1
                ? "1 plaza solicitada"
                : `${quantity} plazas solicitadas`}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-500/10 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-amber-200/90">
            Requisición enviada
          </span>
        </div>
      </div>
    </li>
  );
}

function KpiCard({ icon, value, label, accent }: KpiCardProps) {
  const valueColor =
    accent === "green" ? "text-emerald-300" : "text-cyan-200";
  const bg =
    accent === "green"
      ? "border-emerald-400/15 bg-emerald-950/25"
      : "border-cyan-400/15 bg-cyan-950/30";

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1 rounded-xl border px-3 py-2.5 ${bg}`}
    >
      <div className={valueColor}>{icon}</div>
      <p className={`text-xl font-extrabold tabular-nums leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="text-[11px] font-medium leading-tight text-slate-400">{label}</p>
    </div>
  );
}

export function NodeSummaryPanel({ personId, className }: Props) {
  const { data, isLoading, isError, error } = useOrgChartSummary(personId);
  const { data: realVacancies = [] } = useOrgChartVacancies();
  const [isExpanded, setIsExpanded] = useState(false);

  const showSkeleton = isLoading && !data;
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Error al cargar resumen"
    : null;

  const shellClass = [
    "node-summary-panel__shell pointer-events-auto relative overflow-hidden backdrop-blur-2xl",
    isExpanded
      ? "node-summary-panel__shell--expanded rounded-2xl border border-cyan-400/20 bg-[#020617]/92 shadow-[0_16px_48px_-12px_rgba(34,211,238,0.28)] h-full min-h-0 w-full max-w-lg self-start"
      : "node-summary-panel__shell--collapsed rounded-2xl border border-cyan-300/40 bg-[#071422]/95 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_22px_56px_-12px_rgba(0,0,0,0.78),0_0_40px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/25 h-auto min-w-[min(100%,17.5rem)] w-max max-w-[min(100%,22rem)] shrink-0 self-start",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const teamLabel =
    data && data.areas.length === 1 ? "equipo directo" : "equipos directos";
  // Las vacantes provienen del endpoint real (`vacancies.vacancy`,
  // operation_status = requisition_sent), NO del resumen del nodo ni del árbol.
  const vacancyKpi = realVacancies.length;
  const hasTeamSection = Boolean(data && data.areas.length > 0);
  const hasRealVacancies = realVacancies.length > 0;
  const collapsedHint =
    data && !isExpanded
      ? `${data.general.totalPeople} pers. · ${data.areas.length} ${teamLabel}`
      : null;

  return (
    <section className={shellClass} aria-label="Resumen jerárquico">
      {showSkeleton ? (
        <div className="flex items-center gap-3.5 px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-300/35 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
            <IconSummaryChart />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-50">
              Resumen general
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">Cargando…</p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-50">
            Resumen general
          </p>
          <p className="mt-1 text-[10px] leading-snug text-rose-300/90" role="alert">
            {errorMessage}
          </p>
        </div>
      ) : data ? (
        <>
          <button
            type="button"
            className="flex w-full shrink-0 cursor-pointer items-center gap-3.5 px-4 py-3 text-left transition hover:bg-cyan-400/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-300/60"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="node-summary-panel-details"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-300/35 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
              <IconSummaryChart />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-50">
                  Resumen general
                </h2>
                {!isExpanded && collapsedHint ? (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                    {data.general.totalPeople}
                  </span>
                ) : null}
              </span>
              {!isExpanded && collapsedHint ? (
                <p className="mt-1 truncate text-[11px] font-medium text-slate-300">
                  {collapsedHint}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-400">
                  Ver métricas del nivel actual
                </p>
              )}
            </span>
            <SummaryChevron expanded={isExpanded} />
          </button>

          <div
            id="node-summary-panel-details"
            className={[
              "node-summary-panel__expandable",
              isExpanded ? "node-summary-panel__expandable--open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isExpanded}
          >
            <div className="node-summary-panel__expandable-inner min-w-[18rem] border-t border-cyan-400/10 sm:min-w-[20rem]">
              <div className="flex shrink-0 flex-col gap-3 px-4 pb-3 pt-3">
                <div className="min-w-0">
                  <p
                    className="text-[1.65rem] font-extrabold leading-[1.1] tracking-tight text-slate-50 sm:text-[2rem]"
                    title={data.general.name}
                  >
                    {data.general.name}
                  </p>

                  {data.general.roleName ? (
                    <p
                      className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-100/90"
                      title={data.general.roleName}
                    >
                      <IconBriefcase />
                      <span className="truncate">{data.general.roleName}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex w-full gap-2 sm:gap-3">
                  <KpiCard
                    icon={<IconPeople />}
                    value={data.general.totalPeople}
                    label="Personas y plazas"
                    accent="blue"
                  />
                  <KpiCard
                    icon={<IconTeam />}
                    value={data.areas.length}
                    label={teamLabel}
                    accent="green"
                  />
                  <KpiCard
                    icon={<IconVacancy />}
                    value={vacancyKpi}
                    label="Vacantes"
                    accent="blue"
                  />
                </div>
              </div>

              <div className="node-summary-panel__team-scroll flex min-h-0 flex-1 flex-col bg-[#020617]/40">
                {hasTeamSection ? (
                  <>
                    <div className="shrink-0 border-b border-cyan-400/10 bg-cyan-950/20 px-4 py-2">
                      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Equipo directo
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-1.5 px-3 py-2">
                      {data.areas.map((area) => (
                        <SummaryTeamRow key={area.id} item={area} />
                      ))}
                    </ul>
                  </>
                ) : null}

                <div
                  className={[
                    "shrink-0 border-b border-cyan-400/10 bg-cyan-950/20 px-4 py-2",
                    hasTeamSection ? "border-t border-cyan-400/10" : "",
                  ].join(" ")}
                >
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Vacantes
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {realVacancies.length === 0
                      ? "Sin plazas activas"
                      : realVacancies.length === 1
                        ? "1 plaza"
                        : `${realVacancies.length} plazas`}
                  </p>
                </div>
                {hasRealVacancies ? (
                  <ul className="flex flex-col gap-1.5 px-3 py-2">
                    {realVacancies.map((vacancy) => (
                      <VacancyListRow key={vacancy.id} vacancy={vacancy} />
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-center text-xs text-slate-400">
                    No hay vacantes activas
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
