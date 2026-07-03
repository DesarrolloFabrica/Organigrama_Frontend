import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { withPhotoAccessToken } from "../../../auth/photoUrl";
import {
  formatRoleLabel,
  isTemporalAssignment,
  temporalBadgeLabel,
  type OrgNode,
} from "../types";
import {
  orgMapNodeThemeToCssVars,
  resolveOrgMapTheme,
} from "../utils/orgMapLevelTheme";
import { OrgMapTeamMemberMiniCard } from "./OrgMapTeamMemberMiniCard";
import { RadarBackground } from "./RadarBackground";
import { useOrgPerfLite } from "../context/OrgPerfLiteContext";

type Props = {
  leader: OrgNode;
  members?: OrgNode[];
  onSelectPerson: (id: string) => void;
  onExploreTeam?: (id: string, relationId?: string | null) => void;
  showBackButton?: boolean;
  onBack?: () => void;
};

function leaderInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function stopMouse(e: MouseEvent) {
  e.stopPropagation();
}

function resolveGridColumns(): number {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 1280px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

function chunkIntoRows(members: OrgNode[], columns: number): OrgNode[][] {
  const rows: OrgNode[][] = [];
  for (let index = 0; index < members.length; index += columns) {
    rows.push(members.slice(index, index + columns));
  }
  return rows;
}

function gridClassForColumns(columns: number): string {
  if (columns >= 3) return "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3";
  if (columns === 2) return "grid grid-cols-1 gap-3 md:grid-cols-2";
  return "grid grid-cols-1 gap-3";
}

/**
 * Vista de página completa para equipos grandes (>15 reportes directos).
 * Scroll vertical virtualizado por filas + grilla de mini-cards.
 */
export function TeamScrollListView({
  leader,
  members: membersProp,
  onSelectPerson,
  onExploreTeam,
  showBackButton = false,
  onBack,
}: Props) {
  const members = membersProp ?? leader.children;
  const leaderRole = formatRoleLabel(leader);
  const { visualLevel } = resolveOrgMapTheme(leader, 0);
  const leaderCss = orgMapNodeThemeToCssVars(leader, 0);
  const radarLevel = visualLevel;
  const leaderPhotoUrl = withPhotoAccessToken(leader.photoUrl);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(resolveGridColumns);
  const { reportMetrics } = useOrgPerfLite();

  useEffect(() => {
    reportMetrics("team-scroll-list", {
      visibleNodeCount: members.length + 1,
      directReportsCount: members.length,
    });
    return () => {
      reportMetrics("team-scroll-list", {
        visibleNodeCount: 0,
        directReportsCount: 0,
      });
    };
  }, [members.length, reportMetrics]);

  useEffect(() => {
    const updateColumns = () => setGridColumns(resolveGridColumns());
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const memberRows = useMemo(
    () => chunkIntoRows(members, gridColumns),
    [members, gridColumns],
  );

  const virtualizer = useVirtualizer({
    count: memberRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (gridColumns === 1 ? 132 : 148),
    overscan: 4,
  });

  return (
    <div className="team-scroll-list-view relative h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <RadarBackground level={radarLevel} />
      </div>

      {showBackButton && onBack ? (
        <div className="pointer-events-none absolute left-4 top-4 z-30">
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-[#020617]/72 px-3 py-2 text-xs font-bold tracking-wide text-cyan-50/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-cyan-200/35 hover:bg-cyan-400/10 hover:text-white"
          >
            <span className="text-sm" aria-hidden>
              ←
            </span>
            Volver
          </button>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-5xl">
          <section
            className="org-map-holo org-map-holo--list-leader rounded-xl p-5 backdrop-blur-xl"
            style={leaderCss}
            data-visual-level={visualLevel}
          >
            <div className="flex items-center gap-4">
              <div
                className="org-map-mini-card__avatar flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg font-mono text-lg font-bold tracking-tight"
                aria-hidden
              >
                {leaderPhotoUrl ? (
                  <img
                    src={leaderPhotoUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                    decoding="async"
                  />
                ) : (
                  leaderInitials(leader.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  className="truncate text-base font-bold tracking-tight text-slate-100 sm:text-lg"
                  title={leader.name}
                >
                  {leader.name}
                </h2>
                <p
                  className="mt-0.5 truncate text-xs font-medium text-slate-400"
                  title={leaderRole}
                >
                  {leaderRole}
                </p>
                {isTemporalAssignment(leader) ? (
                  <span
                    className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-400/45 bg-amber-400/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300"
                    title="Asignación temporal"
                  >
                    <span className="size-1.5 rounded-full bg-amber-400" aria-hidden />
                    {temporalBadgeLabel()}
                  </span>
                ) : null}
                <p className="org-map-mini-card__active-row mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  <span
                    className="org-map-mini-card__pulse size-1.5 rounded-full"
                    aria-hidden
                  />
                  Activo
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPerson(leader.id)}
                className="org-map-mini-card__detail shrink-0 rounded-md px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition"
              >
                Detalle
              </button>
            </div>
          </section>

          <section className="mt-6">
            <header className="mb-4 flex items-baseline gap-3">
              <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-slate-200/80">
                Equipo directo
              </h3>
              <span className="rounded-full border border-slate-500/25 bg-slate-900/60 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-300/70">
                {members.length}
              </span>
            </header>

            {members.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No hay miembros en este equipo.
              </p>
            ) : (
              <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const rowMembers = memberRows[virtualRow.index] ?? [];
                  return (
                    <div
                      key={virtualRow.key}
                      className="absolute left-0 top-0 w-full pb-3"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className={gridClassForColumns(gridColumns)}>
                        {rowMembers.map((member) => (
                          <OrgMapTeamMemberMiniCard
                            key={member.id}
                            member={member}
                            memberLayoutDepth={1}
                            renderMode="teamListPage"
                            onOpenDetail={onSelectPerson}
                            onExploreTeam={onExploreTeam}
                            stopMouse={stopMouse}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
