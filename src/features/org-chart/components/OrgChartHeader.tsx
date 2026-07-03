import type { ReactNode } from "react";

import { Link } from "react-router-dom";

import { OrganigramaOpLogo } from "../../../components/OrganigramaOpLogo";

import { OrgChartConnectionStatus, type OrgChartConnState } from "./OrgChartConnectionStatus";

import { OrgChartSearchPanel } from "./OrgChartSearchPanel";

import { LogoutButton } from "./LogoutButton";



type SearchLayout = "stacked" | "inline";



type Props = {

  conn: OrgChartConnState;

  onSelectSearchHit: (personId: string) => void;

  searchInputId?: string;

  /** Desktop en fila principal; móvil en segunda fila (página principal). */

  searchLayout?: SearchLayout;

  contextLabel?: string;

  /** Ruta de inicio al pulsar la marca (mapa raíz del organigrama). */

  homeTo?: string;

  trailingActions?: ReactNode;

};



function OrgChartBrandHomeLink({ homeTo }: { homeTo: string }) {

  return (

    <Link

      to={homeTo}

      className="group flex min-w-0 items-center gap-2.5 rounded-xl outline-none transition sm:gap-3 focus-visible:ring-2 focus-visible:ring-cyan-400/40"

      aria-label="Ir al inicio del organigrama"

    >

      <OrganigramaOpLogo className="h-9 w-auto shrink-0 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.22)] transition group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.35)] sm:h-10" />

      <div className="min-w-0">

        <h1 className="truncate text-[0.9375rem] font-semibold tracking-tight text-slate-50 transition group-hover:text-white sm:text-base">

          Organigrama OP

        </h1>

        <p className="hidden truncate font-mono text-[0.625rem] font-medium uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-slate-300 sm:block">

          Dirección de Operaciones

        </p>

      </div>

    </Link>

  );

}



function ContextBadge({ label }: { label: string }) {

  return (

    <div className="hidden items-center justify-center md:flex">

      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-950/35 px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_28px_rgba(34,211,238,0.08)] ring-1 ring-white/[0.04]">

        <span

          className="size-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.55)]"

          aria-hidden

        />

        <svg

          className="size-3 text-cyan-300/70"

          viewBox="0 0 20 20"

          fill="none"

          aria-hidden

        >

          <path

            d="M3 14l4-4 3 3 7-7"

            stroke="currentColor"

            strokeWidth="1.35"

            strokeLinecap="round"

            strokeLinejoin="round"

          />

          <path

            d="M13 6h4v4"

            stroke="currentColor"

            strokeWidth="1.35"

            strokeLinecap="round"

            strokeLinejoin="round"

          />

        </svg>

        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.22em] text-cyan-100/75">

          {label}

        </span>

      </span>

    </div>

  );

}



function HeaderToolbar({

  conn,

  onSelectSearchHit,

  searchInputId,

  showInlineSearch,

}: {

  conn: OrgChartConnState;

  onSelectSearchHit: (personId: string) => void;

  searchInputId: string;

  showInlineSearch: boolean;

}) {

  return (

    <div className="flex items-center justify-end gap-1 sm:gap-1.5">

      <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:gap-1.5 sm:px-1.5">

        {showInlineSearch ? (

          <>

            <OrgChartSearchPanel

              inputId={searchInputId}

              onSelectHit={onSelectSearchHit}

            />

            <span

              className="hidden h-5 w-px shrink-0 bg-white/10 sm:block"

              aria-hidden

            />

          </>

        ) : null}



        <OrgChartConnectionStatus state={conn} />



        <span

          className="hidden h-5 w-px shrink-0 bg-white/10 sm:block"

          aria-hidden

        />



        <LogoutButton />

      </div>

    </div>

  );

}



export function OrgChartHeader({

  conn,

  onSelectSearchHit,

  searchInputId = "org-chart-search",

  searchLayout = "stacked",

  contextLabel = "Mapa operacional",

  homeTo = "/org",

  trailingActions,

}: Props) {

  const showInlineSearch = searchLayout === "inline";



  return (

    <header className="sticky top-0 z-20 shrink-0 border-b border-white/[0.06] bg-[#020617]/78 shadow-[0_1px_0_0_rgba(34,211,238,0.06),0_16px_48px_-24px_rgba(0,0,0,0.65)] backdrop-blur-2xl">

      <div

        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/35 to-transparent"

        aria-hidden

      />

      <div

        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/[0.04] to-transparent"

        aria-hidden

      />



      <div className="mx-auto flex h-[var(--app-header-h)] max-w-[90rem] flex-col gap-2 px-3 py-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-4 sm:px-5 sm:py-0 lg:px-8">

        <OrgChartBrandHomeLink homeTo={homeTo} />



        <ContextBadge label={contextLabel} />



        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">

          {searchLayout === "stacked" ? (

            <OrgChartSearchPanel

              inputId={searchInputId}

              className="w-full min-w-0 sm:max-w-xs"

              onSelectHit={onSelectSearchHit}

            />

          ) : null}



          <HeaderToolbar

            conn={conn}

            onSelectSearchHit={onSelectSearchHit}

            searchInputId={searchInputId}

            showInlineSearch={showInlineSearch}

          />



          {trailingActions}

        </div>

      </div>

    </header>

  );

}

