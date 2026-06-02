import { useState, type ReactNode } from "react";
import { useOrgChartSummary } from "../../../lib/react-query/hooks";
import { isOrgSummaryVacancy, type OrgSummaryItem } from "../types";

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
      className="size-5 shrink-0 text-slate-400 transition-transform duration-300 ease-out"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {expanded ? (
        <path
          d="M6 14l6-6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 10l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
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
        "flex items-center gap-2 rounded-lg border px-2 py-1.5 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.14)]",
        vacancy
          ? "border-slate-300 bg-slate-50"
          : "border-[#E2E8F0] bg-white",
      ].join(" ")}
    >
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
          vacancy
            ? "bg-slate-200 text-slate-600"
            : "bg-[#EEF4FF] text-[#2563EB]",
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
          className="truncate text-[11px] font-bold leading-tight text-[#0F172A]"
          title={item.name}
        >
          {item.name}
        </p>
        {item.roleName ? (
          <p
            className="truncate text-[10px] leading-tight text-slate-500"
            title={item.roleName}
          >
            {item.roleName}
          </p>
        ) : null}
        {vacancy ? (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Plaza vacante
          </p>
        ) : (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0 text-[10px] tabular-nums leading-none">
            <span className="inline-flex items-center gap-0.5 font-semibold text-[#2563EB]">
              <IconPeople className="size-3" />
              {item.totalPeople}
              <span className="font-medium text-slate-500">pers.</span>
            </span>
            <span
              className={[
                "inline-flex items-center gap-0.5 font-semibold",
                item.vacancies > 0 ? "text-[#2563EB]" : "text-slate-400",
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

function KpiCard({ icon, value, label, accent }: KpiCardProps) {
  const valueColor = accent === "green" ? "text-[#16A34A]" : "text-[#2563EB]";
  const bg =
    accent === "green"
      ? "bg-[#F0FDF4] border-[#DCFCE7]"
      : "bg-[#EFF6FF] border-[#DBEAFE]";

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1 rounded-xl border px-3 py-2.5 ${bg}`}
    >
      <div className={valueColor}>{icon}</div>
      <p className={`text-xl font-extrabold tabular-nums leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
    </div>
  );
}

export function NodeSummaryPanel({ personId, className }: Props) {
  const { data, isLoading, isError, error } = useOrgChartSummary(personId);
  const [isExpanded, setIsExpanded] = useState(false);

  const showSkeleton = isLoading && !data;
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Error al cargar resumen"
    : null;

  const shellClass = [
    "node-summary-panel__shell pointer-events-auto overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_10px_40px_rgba(15,23,42,0.10)]",
    "transition-[width,max-width] duration-300 ease-out",
    isExpanded
      ? "node-summary-panel__shell--expanded h-full min-h-0 w-full max-w-lg self-stretch"
      : "node-summary-panel__shell--collapsed h-auto self-start w-max max-w-[min(100%,13.5rem)] shrink-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const teamLabel =
    data && data.areas.length === 1 ? "equipo directo" : "equipos directos";
  const vacancyItems = data?.vacancyItems ?? [];
  const vacancyKpi =
    vacancyItems.length > 0
      ? vacancyItems.length
      : (data?.general.vacancies ?? 0);
  const hasTeamSection = Boolean(data && data.areas.length > 0);
  const hasVacancySection = vacancyItems.length > 0;
  const hasListContent = hasTeamSection || hasVacancySection;

  return (
    <section className={shellClass} aria-label="Resumen jerárquico">
      {showSkeleton ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5B8CFF]">
            Resumen General
          </p>
          <span className="text-[10px] text-slate-400">…</span>
        </div>
      ) : errorMessage ? (
        <div className="px-4 py-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5B8CFF]"
          >
            Resumen General
          </p>
          <p className="mt-1 text-[10px] leading-snug text-rose-600" role="alert">
            {errorMessage}
          </p>
        </div>
      ) : data ? (
        <>
          <button
            type="button"
            className="flex w-full shrink-0 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F1F5F9]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5B8CFF]/60"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="node-summary-panel-details"
          >
            <h2 className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-[#5B8CFF]">
              Resumen General
            </h2>
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
            <div className="node-summary-panel__expandable-inner min-w-[18rem] border-t border-[#E2E8F0] sm:min-w-[20rem]">
              <div className="flex shrink-0 flex-col gap-3 px-4 pb-3 pt-3">
                <div className="min-w-0">
                  <p
                    className="text-[1.65rem] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] sm:text-[2rem]"
                    title={data.general.name}
                  >
                    {data.general.name}
                  </p>

                  {data.general.roleName ? (
                    <p
                      className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2563EB]"
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

              {hasListContent ? (
                <div className="node-summary-panel__team-scroll flex min-h-0 flex-1 flex-col bg-[#F8FAFC]">
                  {hasTeamSection ? (
                    <>
                      <div className="shrink-0 border-b border-[#E2E8F0] bg-[#F5F7FB] px-4 py-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
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

                  {hasVacancySection ? (
                    <>
                      <div
                        className={[
                          "shrink-0 border-b border-[#E2E8F0] bg-[#F5F7FB] px-4 py-2",
                          hasTeamSection ? "border-t" : "",
                        ].join(" ")}
                      >
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          Vacantes
                        </h3>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {vacancyItems.length === 1
                            ? "1 plaza"
                            : `${vacancyItems.length} plazas`}
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1.5 px-3 py-2">
                        {vacancyItems.map((vacancy) => (
                          <SummaryTeamRow key={vacancy.id} item={vacancy} />
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : (
                <p className="border-t border-[#E2E8F0] px-5 py-5 text-center text-xs text-slate-500">
                  No hay equipos ni vacantes asociados para este nivel.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
