import type { MouseEvent } from "react";

import { withPhotoAccessToken } from "../../../auth/photoUrl";
import { formatRoleLabel, type OrgNode } from "../types";
import {
  orgMapNodeThemeToCssVars,
  resolveOrgMapTheme,
} from "../utils/orgMapLevelTheme";
import { OrgMapTeamMemberMiniCard } from "./OrgMapTeamMemberMiniCard";
import { RadarBackground } from "./RadarBackground";

type Props = {
  leader: OrgNode;
  members?: OrgNode[];
  onSelectPerson: (id: string) => void;
  onExploreTeam?: (id: string) => void;
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

/**
 * Vista de página completa para equipos grandes (>15 reportes directos).
 * Scroll vertical de página + grilla de mini-cards (no mapa navegable).
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

  return (
    <div className="relative h-full overflow-hidden">
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

      <div className="relative z-10 h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {members.map((m) => (
                  <OrgMapTeamMemberMiniCard
                    key={m.id}
                    member={m}
                    memberLayoutDepth={1}
                    renderMode="teamListPage"
                    onOpenDetail={onSelectPerson}
                    onExploreTeam={onExploreTeam}
                    stopMouse={stopMouse}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}