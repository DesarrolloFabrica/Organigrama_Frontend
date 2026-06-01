import { useEffect, useState, type MouseEvent } from "react";

import { withPhotoAccessToken } from "../../../auth/photoUrl";
import { formatRoleLabel, orgNodeHasDirectReports, type OrgNode } from "../types";
import {
  orgMapNodeThemeToCssVars,
  resolveOrgMapTheme,
} from "../utils/orgMapLevelTheme";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";

type Props = {
  member: OrgNode;
  /** Profundidad de layout del miembro en el mapa (p. ej. padre + 1). */
  memberLayoutDepth: number;
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

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Tarjeta compacta de una persona del equipo (colores alineados al nivel resuelto). */
export function OrgMapTeamMemberMiniCard({
  member,
  memberLayoutDepth,
  onOpenDetail,
  onExploreTeam,
  stopMouse,
}: Props) {
  const isVacancy = member.nodeKind === "vacancy";
  const roleShort = formatRoleLabel(member);
  const showExploreTeam =
    !isVacancy &&
    Boolean(onExploreTeam) &&
    orgNodeHasDirectReports(member);
  const { visualLevel } = resolveOrgMapTheme(member, memberLayoutDepth);
  const levelCss = orgMapNodeThemeToCssVars(member, memberLayoutDepth);
  const [photoFailed, setPhotoFailed] = useState(false);
  const resolvedPhotoUrl = withPhotoAccessToken(member.photoUrl);
  const showPhoto = !isVacancy && Boolean(resolvedPhotoUrl) && !photoFailed;

  useEffect(() => {
    setPhotoFailed(false);
  }, [member.id, member.photoUrl]);

  if (import.meta.env.DEV) {
    console.log("[MiniCard photo]", {
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl ?? null,
    });
  }

  return (
    <article
      className={[
        "org-map-mini-card group relative flex min-h-0 flex-col gap-2 rounded-sm bg-slate-950/60 p-2.5 transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        isVacancy ? "org-map-mini-card--vacancy" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={levelCss}
      data-visual-level={visualLevel}
      data-node-kind={isVacancy ? "vacancy" : "person"}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className={[
            "org-map-mini-card__avatar flex size-9 shrink-0 items-center justify-center rounded-sm",
            showPhoto ? "overflow-hidden" : "",
            isVacancy
              ? "org-map-mini-card__avatar--vacancy"
              : showPhoto
                ? ""
                : "font-mono text-[10px] font-bold tracking-tight",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          {isVacancy ? (
            <OrgMapVacancyGlyph
              size="sm"
              className="text-slate-400/85"
              decorative
            />
          ) : showPhoto ? (
            <img
              src={resolvedPhotoUrl!}
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
              decoding="async"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            memberInitials(member.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className="org-map-person-name-2l w-full text-[12px] font-semibold tracking-tight text-slate-100"
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
          <p
            className={[
              "org-map-mini-card__active-row mt-1.5 flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
              isVacancy ? "org-map-mini-card__active-row--vacancy" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={isVacancy ? "Estado: vacante" : "Estado: activo"}
          >
            <span className="org-map-mini-card__pulse size-1.5 rounded-full" aria-hidden />
            {isVacancy ? "Vacante" : "Activo"}
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
