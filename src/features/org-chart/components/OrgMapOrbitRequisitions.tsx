import type { CSSProperties } from "react";

import { useOrbitRequisitionCards } from "../../../lib/react-query/hooks";
import {
  formatOrbitRequisitionCardsTotals,
  type OrbitRequisitionCardModel,
} from "../utils/orgMapOrbitRequisitions";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";

/** Tarjeta de una requisición: visualización pura, sin ficha ni acciones. */
export function OrgMapOrbitRequisitionCard({
  card,
}: {
  card: OrbitRequisitionCardModel;
}) {
  return (
    <article
      className="org-map-mini-card org-map-mini-card--vacancy org-map-orbit-card relative flex min-h-0 flex-col gap-2 rounded-sm p-2.5"
      data-node-kind="orbit-requisition"
      data-requisition-id={card.requisitionId}
      aria-label={`Vacante Orbit: ${card.positionName}${
        card.quantityLabel ? `, ${card.quantityLabel}` : ""
      }, requisición enviada`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className="org-map-mini-card__avatar org-map-mini-card__avatar--vacancy flex size-9 shrink-0 items-center justify-center rounded-sm"
          aria-hidden
        >
          <OrgMapVacancyGlyph size="sm" className="text-slate-400/85" decorative />
        </div>
        <div className="min-w-0 flex-1">
          <p className="org-map-orbit-card__tag inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.16em]">
            Vacante Orbit
          </p>
          <h4
            className="org-map-person-name-2l mt-1 w-full text-[12px] font-semibold tracking-tight text-slate-100"
            title={card.positionName}
          >
            {card.positionName}
          </h4>
          {card.programName ? (
            <p
              className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug tracking-wide text-slate-400/90"
              title={card.programName}
            >
              {card.programName}
            </p>
          ) : null}
          {card.quantityLabel ? (
            <p className="mt-1 text-[10.5px] font-semibold tabular-nums text-slate-200/90">
              {card.quantityLabel}
            </p>
          ) : null}
          <p
            className="org-map-orbit-card__status mt-1.5 flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
            aria-label="Estado: requisición enviada"
          >
            <span className="org-map-orbit-card__pulse size-1.5 rounded-full" aria-hidden />
            Requisición enviada
          </p>
        </div>
      </div>
    </article>
  );
}

type SectionProps = {
  cards: readonly OrbitRequisitionCardModel[];
  /** Nombre del líder para el rótulo accesible de la región. */
  leaderName: string;
  /** Columnas: dentro del hub (como el equipo) o en la vista de lista. */
  variant?: "hub" | "list";
  /** Columnas fijas (nodo de lienzo, cuyo ancho no depende del viewport). */
  columns?: number;
};

/**
 * Sección «Vacantes Orbit» con una tarjeta por requisición. No se monta sin
 * tarjetas: la coordinación sin requisiciones no muestra sección.
 */
export function OrgMapOrbitRequisitionsSection({
  cards,
  leaderName,
  variant = "hub",
  columns,
}: SectionProps) {
  if (cards.length === 0) return null;
  const totals = formatOrbitRequisitionCardsTotals(cards);
  return (
    <section
      className="org-map-orbit-section w-full min-w-0"
      role="region"
      aria-label={`Vacantes Orbit de ${leaderName}`}
      data-orbit-requisitions={cards.length}
    >
      {variant === "hub" ? (
        <div className="org-map-team-panel__divider mb-3 mt-3" aria-hidden />
      ) : null}
      <header
        className={
          variant === "list"
            ? "mb-4 flex flex-wrap items-baseline gap-3"
            : "mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
        }
      >
        <h3
          className={
            variant === "list"
              ? "font-mono text-[11px] font-black uppercase tracking-[0.22em] text-slate-200/80"
              : "org-map-team-panel__heading font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
          }
        >
          Vacantes Orbit
        </h3>
        <span className="text-[10px] font-medium tabular-nums text-slate-400">
          {totals}
        </span>
      </header>
      <div
        className={
          columns
            ? "grid w-full gap-2.5"
            : variant === "list"
              ? "grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              : "grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        }
        style={
          columns
            ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {cards.map((card) => (
          <OrgMapOrbitRequisitionCard key={card.key} card={card} />
        ))}
      </div>
    </section>
  );
}

/** Sección conectada a la consulta: hub del mapa y vista de lista. */
export function OrgMapOrbitRequisitionsForNode({
  personId,
  leaderName,
  variant = "hub",
}: {
  personId: string;
  leaderName: string;
  variant?: "hub" | "list";
}) {
  const cards = useOrbitRequisitionCards(personId);
  return (
    <OrgMapOrbitRequisitionsSection
      cards={cards}
      leaderName={leaderName}
      variant={variant}
    />
  );
}

/** Datos del nodo de lienzo que muestra las tarjetas bajo la fila del equipo. */
export type OrgMapOrbitRequisitionsNodeData = {
  cards: OrbitRequisitionCardModel[];
  leaderName: string;
  themeVars: CSSProperties;
  columns: number;
};
