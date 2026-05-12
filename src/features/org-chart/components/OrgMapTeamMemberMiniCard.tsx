import type { MouseEvent } from "react";

import { formatRoleLabel, orgNodeHasDirectReports, type OrgNode } from "../types";
import { orgMapLevelThemeToCssVars } from "../utils/orgMapLevelTheme";

type Props = {
  member: OrgNode;
  visualLevel: 1 | 2 | 3 | 4 | 5;
  onOpenDetail: (id: string) => void;
  onExploreTeam?: (nodeId: string) => void;
  stopMouse: (e: MouseEvent) => void;
};

function IconTeamBranch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 3v5M10 8c-2.5 0-4 1.35-4 3v4M14 14v-3c0-1.65-1.5-3-4-3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="3.5"
        r="1.85"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="6" cy="17" r="1.75" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="14"
        cy="17"
        r="1.75"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Tarjeta compacta de una persona del equipo (colores alineados al nivel resuelto). */
export function OrgMapTeamMemberMiniCard({
  member,
  visualLevel,
  onOpenDetail,
  onExploreTeam,
  stopMouse,
}: Props) {
  const roleShort = formatRoleLabel(member);
  const showExploreTeam =
    Boolean(onExploreTeam) && orgNodeHasDirectReports(member);
  const levelCss = orgMapLevelThemeToCssVars(visualLevel);

  return (
    <article
      className="org-map-mini-card group relative flex min-h-0 flex-col gap-2 rounded-sm bg-slate-950/60 p-2.5 transition-[border-color,box-shadow,background-color] duration-200 ease-out"
      style={levelCss}
      data-visual-level={visualLevel}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className="org-map-mini-card__avatar flex size-9 shrink-0 items-center justify-center rounded-sm font-mono text-[10px] font-bold tracking-tight"
          aria-hidden
        >
          {initials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className="truncate text-[12px] font-semibold leading-snug tracking-tight text-slate-100"
            title={member.name}
          >
            {member.name}
          </h4>
          <p
            className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug tracking-wide text-slate-400/90"
            title={roleShort}
          >
            {roleShort}
          </p>
          <p className="org-map-mini-card__active-row mt-1.5 flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]">
            <span className="org-map-mini-card__pulse size-1.5 rounded-full" />
            Activo
          </p>
        </div>
      </div>
      <div
        className={
          showExploreTeam
            ? "mt-0.5 grid w-full grid-cols-2 gap-1.5"
            : "mt-0.5 grid w-full grid-cols-1 gap-1.5"
        }
      >
        {showExploreTeam ? (
          <button
            type="button"
            className="org-map-mini-card__explore nodrag nopan flex items-center justify-center gap-1 rounded-sm py-1 font-mono text-[8px] font-bold uppercase tracking-widest transition-[border-color,background,color] duration-150"
            aria-label={`Ver equipo de ${member.name}`}
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              onExploreTeam?.(member.id);
            }}
          >
            <IconTeamBranch className="org-map-mini-card__explore-icon size-3 shrink-0" />
            <span className="leading-none">Ver equipo</span>
          </button>
        ) : null}
        <button
          type="button"
          className={`org-map-mini-card__detail nodrag nopan rounded-sm py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition-[border-color,background,color] duration-150 ${
            showExploreTeam ? "" : "col-span-full w-full"
          }`}
          aria-label={`Detalle de ${member.name}`}
          onPointerDown={stopMouse}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(member.id);
          }}
        >
          Detalle
        </button>
      </div>
    </article>
  );
}
