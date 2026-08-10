import type { CSSProperties, MouseEvent } from "react";
import { memo, useLayoutEffect } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

import {
  formatRoleLabel,
  orgNodeHasDirectReports,
} from "../types";
import { shouldNavigateToTeamListPage } from "../utils/orgMapDisplayPolicy";
import type { OrgMapNodeInteractiveData } from "../utils/orgMapLayout";
import { orgMapNodeThemeToCssVars } from "../utils/orgMapLevelTheme";
import { AssignmentStatusBadge } from "./AssignmentStatusBadge";
import { OrgMapExpandedTeamPanel } from "./OrgMapExpandedTeamPanel";
import { useOrgMapSelection } from "../context/OrgMapSelectionContext";
import { OrgMapNodePhoto } from "./OrgMapNodePhoto";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";
import { resolveCoordinationEmblem } from "../config/coordinationEmblems";
import { CoordinationEmblem } from "./CoordinationEmblem";

/* ── Iconos lineales tácticos (stroke fino; sin rellenos “dashboard”) ───────── */

function IconBranch({ className }: { className?: string }) {
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

function IconScan({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 7V4h3M13 4h3v3M4 13v3h3M13 16h3v-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle
        cx="10"
        cy="10"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="10" cy="10" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * Entidad holográfica en el lienzo OP.
 * Fila 2 expandida: la tarjeta crece y el nivel 3 se muestra como grid interno (hub).
 */
function OrgMapNodeComponent({ id, data }: NodeProps) {
  const typedData = data as OrgMapNodeInteractiveData;
  const { selectedPersonId } = useOrgMapSelection();
  const isSelected =
    selectedPersonId != null && selectedPersonId === typedData.orgNode.id;
  const updateNodeInternals = useUpdateNodeInternals();

  const node = typedData.orgNode;

  const isVacancy = node.nodeKind === "vacancy";
  const isExpanded = typedData.isExpanded;
  const internalTeamMembers = typedData.internalTeamMembers ?? [];

  const showTeamHub = isExpanded && internalTeamMembers.length > 0;

  // Una vacante con reportes directos puede expandirse/navegar igual que una
  // persona; solo se diferencia por badge y estilo, no por capacidad de explorar.
  const canExploreTeam =
    typedData.hasDeferredTeam &&
    orgNodeHasDirectReports(node) &&
    shouldNavigateToTeamListPage(node) &&
    Boolean(typedData.onExploreTeam);

  const showTeamPageNavigate =
    typedData.showTeamPageNavigate &&
    Boolean(typedData.onExploreTeam);

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, isExpanded, internalTeamMembers.length, showTeamHub, updateNodeInternals]);

  const stopMouse = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const levelLabel = node.hierarchy?.name ?? "NIVEL ░ SIN ASIGNAR";
  const visualLevel = typedData.visualLevel;
  const levelCss = orgMapNodeThemeToCssVars(node, typedData.mapLayoutDepth);
  const coordinationEmblem = resolveCoordinationEmblem(node);
  const cardStyle = coordinationEmblem
    ? ({
        ...levelCss,
        "--coordination-card-glow": coordinationEmblem.glowColor,
        "--coordination-card-highlight": coordinationEmblem.highlightColor,
      } as CSSProperties)
    : levelCss;
  const memberLayoutDepth = typedData.mapLayoutDepth + 1;

  return (
    <article
      className={[
        "org-map-holo relative",
        showTeamHub ? "org-map-holo--hub" : "min-w-[288px] max-w-[300px]",
        isVacancy ? "org-map-holo--vacancy" : "",
        isSelected ? "org-map-holo--selected" : "",
        isExpanded ? "org-map-holo--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={cardStyle}
      data-coordination-emblem={coordinationEmblem ? "true" : "false"}
      data-visual-level={visualLevel}
      data-node-kind={isVacancy ? "vacancy" : "person"}
      data-expanded={isExpanded ? "true" : "false"}
      data-selected={isSelected ? "true" : "false"}
      aria-label={
        isVacancy
          ? `Plaza disponible: ${node.name}`
          : `Colaborador: ${node.name}`
      }
    >
      {coordinationEmblem ? (
        <div className="org-map-holo__coordination-watermark pointer-events-none absolute -right-8 top-8 z-0 size-52">
          <CoordinationEmblem
            config={coordinationEmblem}
            selected={isSelected}
            disabled={isVacancy && !coordinationEmblem.vacancyVisuals}
          />
        </div>
      ) : null}

      <Handle
        type="target"
        position={Position.Top}
        className="org-map-holo__handle org-map-holo__handle--target"
      />
      <div className="org-map-holo__topbar">
        <p className="org-map-holo__level font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">
          {levelLabel}
        </p>

        <span
          className={[
            "org-map-holo__status",
            isVacancy ? "org-map-holo__status--vacancy" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={isVacancy ? "Estado: vacante" : "Estado: activo"}
        >
          <span className="org-map-holo__status-dot" aria-hidden />
          {isVacancy ? "VACANTE" : "ACTIVO"}
        </span>
      </div>

      <div className="org-map-holo__specular pointer-events-none" aria-hidden />

      <div
        className="
          org-map-holo__body
          relative
          z-1
          flex
          flex-col
          items-center
          text-center
          gap-4
          pb-2
          pt-1
        "
      >
        <div className="org-map-holo__nucleus-wrap shrink-0" aria-hidden>
          <div className="org-map-holo__nucleus relative flex size-23 items-center justify-center">
            <div className="org-map-holo__ring org-map-holo__ring--outer" />
            <div className="org-map-holo__ring org-map-holo__ring--orbit" />
            <div className="org-map-holo__ring org-map-holo__ring--inner" />
            {isVacancy ? (
              <div
                className="org-map-holo__core org-map-holo__core--vacancy flex items-center justify-center"
                aria-hidden
              >
                <OrgMapVacancyGlyph
                  className="org-map-holo__vacancy-glyph text-slate-400/90"
                  decorative
                />
              </div>
            ) : (
              <OrgMapNodePhoto name={node.name} photoUrl={node.photoUrl} />
            )}
            <div className="org-map-holo__crosshair" />
          </div>
        </div>

        <div className="min-w-0 flex flex-col items-center gap-1 text-center pt-1">
          <h3
            className="org-map-holo__name org-map-person-name-2l org-map-person-name-2l--center mt-1.5 w-full text-[15px] font-semibold tracking-tight text-slate-100"
            title={node.name}
          >
            {node.name}
          </h3>

          <p className="org-map-holo__role mt-1 line-clamp-2 text-[11px] font-medium leading-snug tracking-wide text-slate-400/92">
            {formatRoleLabel(node)}
          </p>

          <AssignmentStatusBadge node={node} size="sm" className="mt-1" />
        </div>
      </div>

      <div className="org-map-holo__actions relative z-1 mt-4 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {typedData.showMapExpand ? (
            <button
              type="button"
              className="org-map-holo__btn nodrag nopan"
              aria-expanded={isExpanded}
              aria-busy={typedData.loadingChildren === true}
              disabled={typedData.loadingChildren === true}
              aria-label={
                typedData.loadingChildren
                  ? "Cargando equipo directo"
                  : isExpanded
                    ? "Colapsar equipo en panel"
                    : "Expandir equipo en panel"
              }
              onPointerDown={stopMouse}
              onClick={(e) => {
                e.stopPropagation();
                typedData.onToggleExpand(id);
              }}
            >
              <IconBranch className="org-map-holo__btn-icon-svg size-4 shrink-0" />
              <span>{isExpanded ? "Colapsar" : "Expandir"}</span>
            </button>
          ) : null}
        {showTeamPageNavigate ? (
          <button
            type="button"
            className="org-map-holo__btn org-map-holo__btn--explore nodrag nopan"
            aria-label={`Ver equipo de ${node.name} en vista de lista`}
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              typedData.onExploreTeam?.(id, node.relation_id ?? null);
            }}
          >
            <IconBranch className="org-map-holo__btn-icon-svg org-map-holo__btn-icon-svg--explore size-4 shrink-0" />
            <span>Ver equipo</span>
          </button>
        ) : null}
        {canExploreTeam ? (
          <button
            type="button"
            className="org-map-holo__btn org-map-holo__btn--explore nodrag nopan"
            aria-label="Explorar estructura del equipo en una nueva vista"
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              typedData.onExploreTeam?.(id, node.relation_id ?? null);
            }}
          >
            <IconBranch className="org-map-holo__btn-icon-svg org-map-holo__btn-icon-svg--explore size-4 shrink-0" />
            <span>Explorar estructura</span>
          </button>
        ) : null}
          <button
            type="button"
            className="org-map-holo__btn org-map-holo__btn--detail nodrag nopan"
            aria-label={
              isVacancy
                ? "Abrir ficha de la plaza disponible"
                : "Abrir análisis de entidad"
            }
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              typedData.onOpenDetail(id);
            }}
          >
            <IconScan className="org-map-holo__btn-icon-svg org-map-holo__btn-icon-svg--detail size-4 shrink-0" />
            <span>Detalle</span>
          </button>
        </div>

        {typedData.loadingChildren ? (
          <p
            role="status"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-500 shadow-sm animate-pulse"
          >
            <span
              className="size-1.5 shrink-0 rounded-full bg-cyan-500/70"
              aria-hidden
            />
            Cargando equipo...
          </p>
        ) : null}
      </div>

      {showTeamHub ? (
        <div className="org-map-holo__team-shell relative z-1 mt-3 w-full min-w-0 px-0.5 pb-1">
          <OrgMapExpandedTeamPanel
            leaderName={node.name}
            members={internalTeamMembers}
            memberLayoutDepth={memberLayoutDepth}
            renderMode={typedData.renderMode}
            onOpenDetail={typedData.onOpenDetail}
            onExploreTeam={typedData.onExploreTeam}
            stopMouse={stopMouse}
          />
        </div>
      ) : null}

      <div className="org-map-holo__bottom-reader" aria-hidden />

      <Handle
        type="source"
        position={Position.Bottom}
        className="org-map-holo__handle org-map-holo__handle--source"
      />
    </article>
  );
}

function orgMapNodePropsAreEqual(prev: NodeProps, next: NodeProps): boolean {
  if (prev.id !== next.id) {
    return false;
  }

  const prevData = prev.data as OrgMapNodeInteractiveData;
  const nextData = next.data as OrgMapNodeInteractiveData;

  if (prevData.isExpanded !== nextData.isExpanded) return false;
  if (prevData.loadingChildren !== nextData.loadingChildren) return false;
  if (prevData.directReportsTotal !== nextData.directReportsTotal) return false;
  if (prevData.visualLevel !== nextData.visualLevel) return false;
  if (prevData.showMapExpand !== nextData.showMapExpand) return false;
  if (prevData.showTeamPageNavigate !== nextData.showTeamPageNavigate) return false;
  if (prevData.isCanvasRoot !== nextData.isCanvasRoot) return false;
  if (prevData.renderMode !== nextData.renderMode) return false;
  if (prevData.orgNode.id !== nextData.orgNode.id) return false;
  if (prevData.orgNode.name !== nextData.orgNode.name) return false;
  if (prevData.orgNode.photoUrl !== nextData.orgNode.photoUrl) return false;
  if (prevData.orgNode.nodeKind !== nextData.orgNode.nodeKind) return false;
  // El rol, la posición visual y la asignación pueden cambiar sin cambiar
  // id/name (override por relación, cambio de versión o de padre); deben forzar
  // re-render del nodo para no quedar con datos de otra versión/posición.
  if (prevData.orgNode.role_id !== nextData.orgNode.role_id) return false;
  if (prevData.orgNode.role?.name !== nextData.orgNode.role?.name) return false;
  if (prevData.orgNode.relation_id !== nextData.orgNode.relation_id)
    return false;
  if (prevData.orgNode.parent_person_id !== nextData.orgNode.parent_person_id)
    return false;
  if (
    prevData.orgNode.assignment_status !== nextData.orgNode.assignment_status
  )
    return false;
  if (prevData.orgNode.assignment_label !== nextData.orgNode.assignment_label)
    return false;
  if (
    prevData.orgNode.direct_reports_count !==
    nextData.orgNode.direct_reports_count
  )
    return false;

  const prevMembers = prevData.internalTeamMembers ?? [];
  const nextMembers = nextData.internalTeamMembers ?? [];
  if (prevMembers.length !== nextMembers.length) return false;
  for (let i = 0; i < prevMembers.length; i += 1) {
    const prevMember = prevMembers[i];
    const nextMember = nextMembers[i];
    // Compara identidad y datos visibles: el mismo person.id puede traer rol o
    // asignación distintos entre versiones/posiciones.
    if (prevMember?.id !== nextMember?.id) return false;
    if (prevMember?.relation_id !== nextMember?.relation_id) return false;
    if (prevMember?.role_id !== nextMember?.role_id) return false;
    if (prevMember?.role?.name !== nextMember?.role?.name) return false;
    if (prevMember?.assignment_status !== nextMember?.assignment_status)
      return false;
    if (prevMember?.assignment_label !== nextMember?.assignment_label)
      return false;
  }

  return true;
}

export const OrgMapNode = memo(OrgMapNodeComponent, orgMapNodePropsAreEqual);
