import type { MouseEvent } from "react";
import { useLayoutEffect } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

import { formatRoleLabel } from "../types";
import type { OrgMapNodeInteractiveData } from "../utils/orgMapLayout";
import { orgMapLevelThemeToCssVars } from "../utils/orgMapLevelTheme";
import { OrgMapExpandedTeamPanel } from "./OrgMapExpandedTeamPanel";

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
export function OrgMapNode({ id, data, selected }: NodeProps) {
  const typedData = data as OrgMapNodeInteractiveData;
  const updateNodeInternals = useUpdateNodeInternals();

  const node = typedData.orgNode;
  const isExpanded = typedData.isExpanded;
  const isCanvasRoot = typedData.isCanvasRoot ?? true;
  const internalTeamMembers = typedData.internalTeamMembers ?? [];

  const showTeamHub =
    !isCanvasRoot &&
    isExpanded &&
    internalTeamMembers.length > 0;

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, isExpanded, internalTeamMembers.length, showTeamHub, updateNodeInternals]);

  const stopMouse = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const levelLabel = node.hierarchy?.name ?? "NIVEL ░ SIN ASIGNAR";
  const visualLevel = typedData.visualLevel;
  const levelCss = orgMapLevelThemeToCssVars(visualLevel);
  const memberLayoutDepth = typedData.mapLayoutDepth + 1;

  return (
    <article
      className={[
        "org-map-holo relative",
        showTeamHub ? "org-map-holo--hub" : "min-w-[288px] max-w-[300px]",
        selected ? "org-map-holo--selected" : "",
        isExpanded ? "org-map-holo--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={levelCss}
      data-visual-level={visualLevel}
      data-expanded={isExpanded ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="org-map-holo__handle org-map-holo__handle--target"
      />
      <div className="org-map-holo__topbar">
        <p className="org-map-holo__level font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">
          {levelLabel}
        </p>

        <span className="org-map-holo__status">
          <span className="org-map-holo__status-dot" />
          ACTIVO
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
            <div className="org-map-holo__core" />
            <div className="org-map-holo__crosshair" />
          </div>
        </div>

        <div className="min-w-0 flex flex-col items-center gap-1 text-center pt-1">
          <h3
            className="org-map-holo__name mt-1.5 truncate text-[15px] font-semibold leading-tight tracking-tight text-slate-100"
            title={node.name}
          >
            {node.name}
          </h3>

          <p className="org-map-holo__role mt-1 line-clamp-2 text-[11px] font-medium leading-snug tracking-wide text-slate-400/92">
            {formatRoleLabel(node)}
          </p>
        </div>
      </div>

      <div className="org-map-holo__actions relative z-1 mt-4 flex flex-wrap justify-center gap-2">
        {typedData.showMapExpand ? (
          <button
            type="button"
            className="org-map-holo__btn nodrag nopan"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? isCanvasRoot
                  ? "Colapsar reportes en mapa"
                  : "Colapsar equipo en panel"
                : isCanvasRoot
                  ? "Expandir reportes en mapa"
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
        {typedData.hasDeferredTeam && typedData.onExploreTeam ? (
          <button
            type="button"
            className="org-map-holo__btn org-map-holo__btn--explore nodrag nopan"
            aria-label="Explorar estructura del equipo en una nueva vista"
            onPointerDown={stopMouse}
            onClick={(e) => {
              e.stopPropagation();
              typedData.onExploreTeam?.(id);
            }}
          >
            <IconBranch className="org-map-holo__btn-icon-svg org-map-holo__btn-icon-svg--explore size-4 shrink-0" />
            <span>Explorar estructura</span>
          </button>
        ) : null}
        <button
          type="button"
          className="org-map-holo__btn org-map-holo__btn--detail nodrag nopan"
          aria-label="Abrir análisis de entidad"
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

      {showTeamHub ? (
        <div className="org-map-holo__team-shell relative z-1 mt-3 w-full min-w-0 px-0.5 pb-1">
          <OrgMapExpandedTeamPanel
            leaderName={node.name}
            members={internalTeamMembers}
            memberLayoutDepth={memberLayoutDepth}
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
