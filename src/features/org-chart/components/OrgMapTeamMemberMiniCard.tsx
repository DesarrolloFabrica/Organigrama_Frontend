import {
  memo,
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import { withPhotoAccessToken } from "../../../auth/photoUrl";
import { useFlowAreaIdentity } from "../../../contexts/RouteTransitionContext";
import {
  formatRoleLabel,
  type OrgNode,
} from "../types";
import {
  shouldOfferTeamExplorationLink,
  type OrgMapRenderMode,
} from "../utils/orgMapDisplayPolicy";
import {
  orgMapNodeThemeToCssVars,
  resolveOrgMapTheme,
} from "../utils/orgMapLevelTheme";
import { resolveCoordinationEmblem } from "../config/coordinationEmblems";
import { useOrgMapSelection } from "../context/OrgMapSelectionContext";
import { AssignmentStatusBadge } from "./AssignmentStatusBadge";
import { WorkforceEventBadge } from "./WorkforceEventBadge";
import { CoordinationEmblem } from "./CoordinationEmblem";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";
import {
  coordinationCardAccentCssVars,
  coordinationCardPassiveThemeCssVars,
  coordinationCardThemeCssVars,
  type CoordinationCardThemeIdentity,
} from "../utils/coordinationCardTheme";

type Props = {
  member: OrgNode;
  /** Profundidad de layout del miembro en el mapa (p. ej. padre + 1). */
  memberLayoutDepth: number;
  renderMode: OrgMapRenderMode;
  selected?: boolean;
  passiveCoordinationIdentity?: CoordinationCardThemeIdentity | null;
  onOpenDetail: (id: string, relationId?: string | null) => void;
  onExploreTeam?: (nodeId: string, relationId?: string | null) => void;
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

/** Tarjeta compacta: nivel en reposo y coordinación activa al seleccionarla. */
function OrgMapTeamMemberMiniCardComponent({
  member,
  memberLayoutDepth,
  selected,
  passiveCoordinationIdentity = null,
  onOpenDetail,
  onExploreTeam,
  stopMouse,
}: Props) {
  const { selectedPersonId } = useOrgMapSelection();
  const flowIdentity = useFlowAreaIdentity();
  const isVacancy = member.nodeKind === "vacancy";
  const coordinationEmblem = resolveCoordinationEmblem(member);
  const isSelected = selected ?? selectedPersonId === member.id;
  const coordinationIdentity = isSelected
    ? (flowIdentity ?? coordinationEmblem)
    : (passiveCoordinationIdentity ?? coordinationEmblem ?? flowIdentity);
  const showEmblemAsWatermark =
    coordinationEmblem?.placement === "watermark" ||
    coordinationEmblem?.placement === "watermarkCorner";
  const showEmblemAsCornerWatermark =
    coordinationEmblem?.placement === "watermarkCorner";
  const showEmblemAsBadge = coordinationEmblem?.placement === "badge";
  const showEmblemByRole = coordinationEmblem?.placement === "roleInline";
  const showEmblemInCorner = coordinationEmblem?.placement === "cornerSmall";
  const roleShort = formatRoleLabel(member);
  const showExploreTeam =
    !isVacancy &&
    Boolean(onExploreTeam) &&
    shouldOfferTeamExplorationLink(member);
  const { visualLevel } = resolveOrgMapTheme(member, memberLayoutDepth);
  const levelCss = orgMapNodeThemeToCssVars(member, memberLayoutDepth);
  const cardStyle = coordinationIdentity
    ? {
        ...levelCss,
        ...(isSelected
          ? coordinationCardThemeCssVars(coordinationIdentity)
          : passiveCoordinationIdentity
            ? coordinationCardPassiveThemeCssVars(
                passiveCoordinationIdentity,
              )
            : coordinationCardAccentCssVars(coordinationIdentity)),
      }
    : levelCss;
  const [photoFailed, setPhotoFailed] = useState(false);
  const resolvedPhotoUrl = withPhotoAccessToken(member.photoUrl);
  const showPhoto = !isVacancy && Boolean(resolvedPhotoUrl) && !photoFailed;

  useEffect(() => {
    setPhotoFailed(false);
  }, [member.id, member.photoUrl]);

  return (
    <article
      className={[
        "org-map-mini-card group relative flex min-h-0 flex-col gap-2 rounded-sm bg-slate-950/60 p-2.5 transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        isVacancy ? "org-map-mini-card--vacancy" : "",
        showEmblemAsWatermark ? "overflow-hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={cardStyle}
      data-coordination-emblem={coordinationEmblem ? "true" : "false"}
      data-coordination-identity={coordinationIdentity ? "true" : "false"}
      data-active-coordination-theme={
        isSelected && coordinationIdentity ? "true" : "false"
      }
      data-passive-coordination-theme={
        !isSelected && passiveCoordinationIdentity ? "true" : "false"
      }
      data-selected={isSelected ? "true" : "false"}
      data-visual-level={visualLevel}
      data-node-kind={isVacancy ? "vacancy" : "person"}
    >
      {showEmblemAsWatermark && coordinationEmblem ? (
        <div
          className={
            showEmblemAsCornerWatermark
              ? "org-map-mini-card__coordination-watermark absolute right-1 top-1 z-0 size-11"
              : "org-map-mini-card__coordination-watermark absolute -right-5 -top-1 z-0 size-32"
          }
        >
          <CoordinationEmblem
            config={coordinationEmblem}
            selected={isSelected}
            disabled={isVacancy}
          />
        </div>
      ) : null}

      {showEmblemAsBadge && coordinationEmblem ? (
        <div className="absolute right-2 top-2 z-2 size-11">
          <CoordinationEmblem
            config={coordinationEmblem}
            selected={isSelected}
            disabled={isVacancy}
          />
        </div>
      ) : null}

      {showEmblemInCorner && coordinationEmblem ? (
        <div className="absolute right-2 top-2 z-2 size-6">
          <CoordinationEmblem
            config={coordinationEmblem}
            selected={isSelected}
            disabled={isVacancy}
          />
        </div>
      ) : null}

      <div
        className={`relative z-1 flex min-w-0 items-start gap-2.5 ${
          showEmblemAsBadge
            ? "pr-12"
            : showEmblemInCorner
              ? "pr-8"
            : showEmblemAsCornerWatermark
              ? "pr-12"
              : ""
        }`}
      >
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
          <div className="mt-0.5 flex items-start gap-1.5">
            {showEmblemByRole && coordinationEmblem ? (
              <div className="mt-px size-6 shrink-0">
                <CoordinationEmblem
                  config={coordinationEmblem}
                  selected={isSelected}
                  disabled={isVacancy}
                />
              </div>
            ) : null}
            <p
              className="line-clamp-2 text-[10px] font-medium leading-snug tracking-wide text-slate-400/90"
              title={roleShort}
            >
              {roleShort}
            </p>
          </div>
          <AssignmentStatusBadge node={member} size="xs" className="mt-1" />
          <WorkforceEventBadge node={member} size="xs" className="mt-1" />
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
        {coordinationEmblem &&
        !showEmblemAsWatermark &&
        !showEmblemAsBadge &&
        !showEmblemByRole &&
        !showEmblemInCorner ? (
          <div className="size-11 shrink-0 self-center">
            <CoordinationEmblem
              config={coordinationEmblem}
              selected={isSelected}
              disabled={isVacancy}
            />
          </div>
        ) : null}
      </div>
      <div
        className={`relative z-1 ${
          showExploreTeam
            ? "mt-0.5 grid w-full grid-cols-2 gap-1.5"
            : "mt-0.5 grid w-full grid-cols-1 gap-1.5"
        }`}
      >
        {showExploreTeam ? (
          <button
            type="button"
            className="org-map-mini-card__explore nodrag nopan flex items-center justify-center gap-1 rounded-sm py-1 font-mono text-[8px] font-bold uppercase tracking-widest transition-[border-color,background,color] duration-150"
            aria-label={`Ver equipo de ${member.name}`}
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              onExploreTeam?.(member.id, member.relation_id ?? null);
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
            onOpenDetail(member.id, member.relation_id ?? null);
          }}
        >
          Detalle
        </button>
      </div>
    </article>
  );
}

export const OrgMapTeamMemberMiniCard = memo(OrgMapTeamMemberMiniCardComponent);
