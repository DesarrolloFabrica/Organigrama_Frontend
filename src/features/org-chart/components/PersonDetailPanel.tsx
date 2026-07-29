import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  isOrgNodeVacancy,
  orgPersonDisplayName,
  orgPersonHasFullProfile,
} from "../types";
import { useOrgPersonDetail, useOrgPersonCv } from "../../../lib/react-query/hooks";
import { withPhotoAccessToken } from "../../../auth/photoUrl";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";
import { CompetenciesExplorer } from "../../competencies";

type Props = {
  /** Persona seleccionada en el árbol; `null` muestra estado vacío. */
  personId: string | null;
  /**
   * Total de personas bajo el nodo en el árbol ya cargado (excluye a la persona).
   * El detalle del API solo trae reportes directos; esto enriquece “subordinados totales”.
   */
  treeDescendantCount: number | null;
  /** Permite cerrar desde el panel (búsqueda futura podrá fijar la misma API). */
  onClose?: () => void;
  /** Oculta el panel sin deseleccionar (mapa a pantalla completa). */
  onMinimize?: () => void;
  /** `overlay`: altura acoplada al drawer flotante; `sidebar`: columna clásica. */
  layoutVariant?: "sidebar" | "overlay";
  /** Sincroniza `photoUrl` del detalle con el árbol del mapa (p. ej. tras foto persistida). */
  onDetailPhotoUrl?: (personId: string, photoUrl: string) => void;
};

function formatValue(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

/** Iniciales para el núcleo visual; sin lógica de imagen. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMinimize({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 14h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Marco común: ficha técnica translúcida, alineada al lienzo OP sin peso “admin”. */
function EntityScanShell({
  children,
  className = "",
  ariaLabel,
  layoutVariant = "sidebar",
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  layoutVariant?: "sidebar" | "overlay";
}) {
  const heightClasses =
    layoutVariant === "overlay"
      ? "h-full min-h-0 max-h-full"
      : "max-h-[calc(100vh-12rem)]";

  return (
    <aside
      className={[
        "entity-scan-shell flex flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#020617]/94 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_64px_-16px_rgba(0,0,0,0.65),0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-2xl",
        heightClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
    >
      <div
        className="pointer-events-none h-px shrink-0 bg-linear-to-r from-transparent via-cyan-400/50 to-transparent"
        aria-hidden
      />
      {children}
    </aside>
  );
}

type HudSectionIconKind = "contact" | "org" | "location" | "team" | "path";

function HudSectionIcon({ kind }: { kind: HudSectionIconKind }) {
  const className = "size-[18px] text-cyan-300/80";
  const stroke = "currentColor";
  const sw = 1.5;

  switch (kind) {
    case "contact":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth={sw} />
          <path
            d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "org":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="18" cy="6" r="2.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="12" cy="18" r="2.5" stroke={stroke} strokeWidth={sw} />
          <path
            d="M8 7.5 11 16M16 7.5 13 16M8.5 6h7M8.5 18h7"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "location":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "team":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8" r="2.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="16" cy="9" r="2" stroke={stroke} strokeWidth={sw} />
          <path
            d="M4 19c0-2.8 2.2-5 5-5M13 19c0-2.2 1.6-4 3.5-4.2M19 19c0-1.5-.8-2.8-2-3.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "path":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" stroke={stroke} strokeWidth={sw} />
          <circle cx="18" cy="18" r="2" stroke={stroke} strokeWidth={sw} />
          <path
            d="M8 7.5 16 16.5M8 16.5 16 7.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/** Columna lateral: icono, línea vertical y puntos decorativos. */
function HudSectionRail({ icon }: { icon: HudSectionIconKind }) {
  return (
    <div
      className="flex w-10 shrink-0 flex-col items-center sm:w-11"
      aria-hidden
    >
      <div className="flex size-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-950/40 shadow-[0_0_16px_rgba(34,211,238,0.1)]">
        <HudSectionIcon kind={icon} />
      </div>
      <div className="mt-2 flex min-h-[28px] flex-1 flex-col items-center gap-1.5 py-0.5">
        <div className="w-px flex-1 min-h-4 bg-linear-to-b from-cyan-400/35 via-cyan-400/15 to-transparent" />
        <span className="size-1 rounded-full bg-cyan-400/50" />
        <span className="size-1 rounded-full bg-cyan-400/35" />
        <span className="size-1 rounded-full bg-cyan-400/20" />
      </div>
    </div>
  );
}

/**
 * Módulo de ficha: blanco, sobrio, columna lateral técnica + contenido.
 */
function HudSection({
  id,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: HudSectionIconKind;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-xl border border-cyan-400/12 bg-[#06111f]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_24px_-16px_rgba(0,0,0,0.45)]"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex min-w-0 gap-2.5 px-2.5 py-3 sm:gap-3 sm:px-3 sm:py-3.5">
        <HudSectionRail icon={icon} />

        <div className="min-w-0 flex-1">
          <header className="pb-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-1.5 shrink-0 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.45)]"
                aria-hidden
              />
              <h3
                id={`${id}-title`}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80"
              >
                {title}
              </h3>
            </div>
            <div className="mt-1.5 flex items-center gap-0" aria-hidden>
              <span className="h-px w-5 shrink-0 bg-cyan-400/45" />
              <span className="h-px min-w-0 flex-1 bg-cyan-400/10" />
            </div>
            {subtitle ? (
              <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
                {subtitle}
              </p>
            ) : null}
          </header>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

function HudDetailRow({
  label,
  value,
  hint,
  emphasized = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasized?: boolean;
}) {
  const isEmpty = value === "—";

  return (
    <div className="relative grid grid-cols-[minmax(0,6.75rem)_1fr] gap-x-2.5 gap-y-0.5 py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-cyan-400/12 after:to-transparent last:py-1.5 last:after:hidden sm:grid-cols-[minmax(0,7.75rem)_1fr] sm:gap-x-3 sm:py-2.5">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd
        className={[
          "min-w-0 text-[13px] leading-snug text-slate-100",
          isEmpty
            ? "font-normal text-slate-500/70"
            : emphasized
              ? "font-bold tracking-tight text-cyan-50"
              : "font-semibold",
        ].join(" ")}
      >
        {value}
        {hint ? (
          <span className="ml-1.5 font-mono text-[10px] font-normal text-slate-500">
            ({hint})
          </span>
        ) : null}
      </dd>
    </div>
  );
}

/** Ícono de documento (hoja de vida). SVG inline, coherente con el set del panel. */
function IconFileText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M8.5 13h7M8.5 16.5h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ícono de enlace externo (abre en nueva pestaña). */
function IconExternalLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M19 5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Acción secundaria de hoja de vida (CV).
 *
 * - Consulta el backend (GET /api/org-chart/person/:id/cv) vía React Query.
 * - NO consulta Google Drive ni muestra la URL en pantalla.
 * - Estados: cargando / con CV (botón) / sin CV (info) / error (texto discreto).
 */
function PersonCvAction({ personId }: { personId: string }) {
  const [requested, setRequested] = useState(false);
  const [cvPersonId, setCvPersonId] = useState(personId);
  if (cvPersonId !== personId) {
    setCvPersonId(personId);
    setRequested(false);
  }
  const { data: cv, isLoading, isError } = useOrgPersonCv(personId, requested);

  const shellClass =
    "mt-1 flex items-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-950/30 px-3 py-2 text-[12px]";

  if (!requested) {
    return (
      <button
        type="button"
        onClick={() => setRequested(true)}
        className="mt-1 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-950/30 px-3 py-2 text-[12px] font-medium text-cyan-100/90 transition hover:border-cyan-300/35 hover:bg-cyan-500/10"
      >
        <IconFileText className="size-4 shrink-0 text-cyan-300/80" />
        Consultar hoja de vida
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className={shellClass} aria-busy="true">
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-cyan-900/60 border-t-cyan-300" />
        <span className="font-medium text-slate-400">
          Consultando hoja de vida…
        </span>
      </div>
    );
  }

  // 2) Error: texto discreto (no parece fallo grave).
  if (isError) {
    return (
      <div className={`${shellClass} text-slate-500`}>
        No fue posible consultar la hoja de vida
      </div>
    );
  }

  // 3) Sin CV: información normal, no error.
  if (!cv?.hasCv) {
    return (
      <div className={`${shellClass} text-slate-400`}>
        <IconFileText className="size-4 shrink-0 text-slate-500" />
        Hoja de vida no disponible
      </div>
    );
  }

  // 4) Con CV: botón secundario que abre el PDF en nueva pestaña.
  const viewUrl = cv.viewUrl;

  const handleOpen = () => {
    // Seguridad: no abrir si la URL viene vacía.
    if (!viewUrl) return;
    // Nueva pestaña aislada (sin acceso a window.opener, sin filtrar referrer).
    window.open(viewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!viewUrl}
      title="Abrir hoja de vida en Google Drive"
      aria-label="Abrir hoja de vida en Google Drive"
      className="mt-1 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-[12px] font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15 hover:shadow-[0_0_16px_rgba(34,211,238,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <IconFileText className="size-4 shrink-0" />
      <span>Ver hoja de vida</span>
      <IconExternalLink className="size-3.5 shrink-0 text-cyan-300/80" />
    </button>
  );
}

/**
 * Panel lateral de ficha: consume GET /api/org-chart/person/:id.
 * Narrativa visual: consola de escaneo de entidad (HUD institucional, no formulario plano).
 */
export function PersonDetailPanel(props: Props) {
  /** Sin `personId` no montamos estado ni efectos de red: el contenido cargado va en un hijo. */
  if (!props.personId) {
    return <PersonDetailEmptyAside />;
  }

  return (
    <PersonDetailLoaded
      key={props.personId}
      personId={props.personId}
      treeDescendantCount={props.treeDescendantCount}
      onClose={props.onClose}
      onMinimize={props.onMinimize}
      layoutVariant={props.layoutVariant ?? "sidebar"}
      onDetailPhotoUrl={props.onDetailPhotoUrl}
    />
  );
}

function PersonDetailEmptyAside() {
  return (
    <EntityScanShell ariaLabel="Detalle de entidad — espera">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Núcleo en reposo — panel de espera operacional */}
        <div
          className="relative flex size-16 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-950/40 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
          aria-hidden
        >
          <span className="font-mono text-xs font-bold tracking-widest text-cyan-200/90">
            ◇
          </span>
          <span className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-cyan-400/25" />
        </div>
        <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Canal de lectura inactivo
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight text-slate-100">
          Seleccione una entidad
        </p>
        <p className="mt-2 max-w-68 text-sm leading-relaxed text-slate-400">
          Use el control <span className="font-medium text-cyan-200/90">Detalle</span> en el
          mapa operacional para abrir la ficha técnica desde el servidor.
        </p>
      </div>
    </EntityScanShell>
  );
}

type LoadedProps = Props & { personId: string };

function PersonDetailLoaded({
  personId,
  treeDescendantCount,
  onClose,
  onMinimize,
  layoutVariant,
  onDetailPhotoUrl,
}: LoadedProps) {
  const {
    data: detail,
    isLoading,
    isError,
    error: queryError,
  } = useOrgPersonDetail(personId);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<"ficha" | "competencias">("ficha");
  const [tabPersonId, setTabPersonId] = useState(personId);

  if (tabPersonId !== personId) {
    setTabPersonId(personId);
    setActiveTab("ficha");
    setPhotoFailed(false);
  }

  useEffect(() => {
    if (detail?.photoUrl) {
      onDetailPhotoUrl?.(detail.id, detail.photoUrl);
    }
  }, [detail, onDetailPhotoUrl]);

  const showSkeleton = isLoading && !detail;
  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : "No se pudo cargar el detalle de la persona."
    : null;

  if (showSkeleton) {
    return (
      <EntityScanShell
        ariaLabel="Cargando detalle"
        className="min-h-[280px]"
        layoutVariant={layoutVariant}
      >
        <div
          className="flex flex-1 flex-col items-center justify-center px-6 py-14"
          aria-busy="true"
        >
          <div
            className="relative flex size-14 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-950/40"
            aria-hidden
          >
            <div className="size-7 animate-spin rounded-full border-2 border-cyan-900/50 border-t-cyan-300" />
          </div>
          <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Recuperando registro
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-300">
            Sincronizando ficha…
          </p>
        </div>
      </EntityScanShell>
    );
  }

  if (error) {
    return (
      <EntityScanShell
        ariaLabel="Error al cargar detalle"
        className="min-h-[200px]"
        layoutVariant={layoutVariant}
      >
        <div className="border-b border-rose-400/20 bg-rose-950/30 px-4 py-3" role="alert">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-300/90">
            Fallo de enlace
          </p>
          <p className="mt-1 text-sm font-semibold text-rose-100">
            Error al cargar la entidad
          </p>
          <p className="mt-1 text-sm text-rose-200/85">{error}</p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/15"
            >
              <IconClose className="size-3.5" />
              Cerrar panel
            </button>
          ) : null}
        </div>
      </EntityScanShell>
    );
  }

  if (!detail) {
    return null;
  }

  const displayName = orgPersonDisplayName(detail);
  const hasFull = orgPersonHasFullProfile(detail);
  const profile = hasFull ? detail.profile : null;
  const regionName = profile?.location?.region?.name ?? null;
  const cityName = profile?.location?.city?.name ?? null;
  const campusName = profile?.location?.campus?.name ?? null;
  const roleLabel = profile?.role?.name?.trim()
    ? profile.role.name
    : "Sin cargo asignado";
  const isVacancy = isOrgNodeVacancy(detail);
  const resolvedPhotoUrl = withPhotoAccessToken(detail.photoUrl);
  const showPhoto = !isVacancy && Boolean(resolvedPhotoUrl) && !photoFailed;

  return (
    <EntityScanShell
      ariaLabel={
        isVacancy
          ? `Plaza disponible: ${displayName}`
          : `Escaneo de entidad: ${displayName}`
      }
      layoutVariant={layoutVariant}
    >
      {/*
        Cabecera: núcleo + identidad + estado operativo + cierre táctico.
      */}
      <header className="shrink-0 border-b border-cyan-400/15 bg-[#041018]/75 px-4 pb-4 pt-3">
        <div className="flex gap-3">
          <div
            className={[
              "relative flex size-13 shrink-0 items-center justify-center rounded-full border text-sm font-bold tracking-tight",
              isVacancy
                ? "border-dashed border-slate-500/40 bg-slate-900/50 text-slate-300 shadow-[0_0_16px_rgba(148,163,184,0.08)]"
                : "border-cyan-400/30 bg-cyan-950/50 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
            ].join(" ")}
            aria-hidden
          >
            {isVacancy ? (
              <OrgMapVacancyGlyph
                className="text-slate-500/90"
                ariaLabel="Plaza disponible"
              />
            ) : showPhoto ? (
              <img
                src={resolvedPhotoUrl!}
                alt=""
                className="size-full rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              initialsFromName(displayName)
            )}
            {!isVacancy ? (
              <span className="pointer-events-none absolute -inset-0.5 rounded-full border border-cyan-400/15" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2
                  className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-50"
                  title={displayName}
                >
                  {displayName}
                </h2>
                {hasFull ? (
                  <p className="mt-0.5 text-sm font-medium leading-snug text-slate-300">
                    {roleLabel}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs leading-snug text-slate-400">
                    Vista limitada — sin permiso de ficha completa
                  </p>
                )}
                {isVacancy ? (
                  <p className="mt-1.5 text-xs leading-snug text-slate-400">
                    Plaza disponible dentro de la estructura operativa
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {onMinimize ? (
                  <button
                    type="button"
                    onClick={onMinimize}
                    className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/15 bg-white/5 text-slate-400 transition hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100"
                    aria-label="Minimizar panel de detalle"
                  >
                    <IconMinimize className="size-4" />
                  </button>
                ) : null}
                {onClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/15 bg-white/5 text-slate-400 transition hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100"
                    aria-label="Cerrar panel de detalle"
                  >
                    <IconClose className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isVacancy ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-500/40 bg-slate-900/40 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  <span
                    className="size-1.5 rounded-sm border border-dashed border-slate-500/70"
                    aria-hidden
                  />
                  Vacante
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  <span
                    className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]"
                    aria-hidden
                  />
                  Entidad activa
                </span>
              )}
              {hasFull && profile ? (
                <span className="font-mono text-[10px] text-slate-500">
                  ID {profile.document}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {hasFull && !isVacancy ? (
        <div
          className="shrink-0 border-b border-cyan-400/15 bg-[#041018]/55 px-3 pt-2 sm:px-4"
          role="tablist"
          aria-label="Secciones de la ficha"
        >
          <div className="flex gap-1">
            <button
              type="button"
              role="tab"
              id="person-tab-ficha"
              aria-selected={activeTab === "ficha"}
              aria-controls="person-panel-ficha"
              onClick={() => setActiveTab("ficha")}
              className={[
                "rounded-t-lg px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition",
                activeTab === "ficha"
                  ? "border border-b-0 border-cyan-400/25 bg-[#06111f]/90 text-cyan-100"
                  : "border border-transparent text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              Ficha
            </button>
            <button
              type="button"
              role="tab"
              id="person-tab-competencias"
              aria-selected={activeTab === "competencias"}
              aria-controls="person-panel-competencias"
              onClick={() => setActiveTab("competencias")}
              className={[
                "rounded-t-lg px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition",
                activeTab === "competencias"
                  ? "border border-b-0 border-cyan-400/25 bg-[#06111f]/90 text-cyan-100"
                  : "border border-transparent text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              Competencias
            </button>
          </div>
        </div>
      ) : null}

      <div className="entity-scan-scroll flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        {hasFull && !isVacancy && activeTab === "competencias" ? (
          <div
            id="person-panel-competencias"
            role="tabpanel"
            aria-labelledby="person-tab-competencias"
          >
            <CompetenciesExplorer personId={personId} />
          </div>
        ) : (
        <div
          id="person-panel-ficha"
          role={hasFull && !isVacancy ? "tabpanel" : undefined}
          aria-labelledby={hasFull && !isVacancy ? "person-tab-ficha" : undefined}
          className="flex flex-col gap-3.5 pb-4"
        >
          {!hasFull ? (
            <HudSection id="sec-public" title="Contacto institucional" icon="contact">
              <dl>
                <HudDetailRow
                  label="Correo institucional"
                  value={formatValue(detail.institutionalEmail)}
                />
              </dl>
            </HudSection>
          ) : null}

          {hasFull && profile ? (
          <>
          <HudSection id="sec-contact" title="Datos de contacto" icon="contact">
            <dl>
              <HudDetailRow
                label="Documento"
                value={formatValue(profile.document)}
                hint={profile.type_document ?? undefined}
              />
              <HudDetailRow label="Correo" value={formatValue(profile.email)} />
              <HudDetailRow
                label="Correo educativo"
                value={formatValue(profile.edu_email)}
              />
              <HudDetailRow label="Teléfono" value={formatValue(profile.phone)} />
            </dl>
            <div className="mt-3 border-t border-cyan-400/10 pt-2">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Contacto de emergencia
              </p>
              <dl>
                <HudDetailRow
                  label="Nombre"
                  value={formatValue(profile.emergency_contact?.name ?? null)}
                />
                <HudDetailRow
                  label="Teléfono"
                  value={formatValue(profile.emergency_contact?.phone ?? null)}
                />
                <HudDetailRow
                  label="Parentesco"
                  value={formatValue(
                    profile.emergency_contact?.relationship ?? null,
                  )}
                />
              </dl>
            </div>
            {/*
              Acción secundaria: hoja de vida (CV).
              Va debajo de los datos de contacto, no dentro del nodo del mapa.
              Solo aplica a personas reales (no vacantes).
            */}
            {!isVacancy ? (
              <div className="mt-3 border-t border-cyan-400/10 pt-2">
                <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Hoja de vida
                </p>
                <PersonCvAction personId={personId} />
              </div>
            ) : null}
          </HudSection>

          <HudSection id="sec-org" title="Organización" icon="org">
            <dl>
              <HudDetailRow
                label="Jerarquía"
                value={formatValue(profile.hierarchy?.name ?? null)}
                emphasized
              />
              <HudDetailRow
                label="Área"
                value={formatValue(profile.area?.name ?? null)}
                emphasized
              />
              <HudDetailRow
                label="Escuela"
                value={formatValue(profile.school?.name ?? null)}
              />
              <HudDetailRow
                label="Programa"
                value={formatValue(profile.program?.name ?? null)}
              />
            </dl>
          </HudSection>

          <HudSection id="sec-loc" title="Ubicación" icon="location">
            <dl>
              <HudDetailRow label="Región" value={formatValue(regionName)} />
              <HudDetailRow label="Ciudad" value={formatValue(cityName)} />
              <HudDetailRow label="Campus" value={formatValue(campusName)} />
            </dl>
          </HudSection>

          <HudSection
            id="sec-team"
            title={isVacancy ? "Estructura bajo la plaza" : "Equipo"}
            icon="team"
            subtitle={
              isVacancy
                ? "Personas y plazas en el subárbol"
                : "Métricas y reportes directos"
            }
          >
            <dl>
              <HudDetailRow
                label={
                  isVacancy
                    ? "Personas y plazas (árbol)"
                    : "Subordinados (árbol)"
                }
                value={
                  treeDescendantCount != null
                    ? String(treeDescendantCount)
                    : "—"
                }
              />
              <HudDetailRow
                label="Reportes directos"
                value={String(profile.direct_reports_count)}
              />
            </dl>
            {profile.direct_reports.length > 0 ? (
              <ul
                className="mt-2 space-y-1.5 rounded-lg border border-cyan-400/12 bg-cyan-950/20 px-3 py-2.5"
                aria-label="Lista de reportes directos"
              >
                {profile.direct_reports.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 text-[13px] font-medium text-slate-200"
                  >
                    <span
                      className="size-1 shrink-0 rounded-full bg-cyan-400/60"
                      aria-hidden
                    />
                    <span className="font-medium">{r.full_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-cyan-400/15 bg-cyan-950/15 px-2 py-2 text-center text-xs text-slate-400">
                Sin reportes directos en registro.
              </p>
            )}
          </HudSection>

          <HudSection id="sec-path" title="Ruta jerárquica" icon="path">
            {profile.hierarchy_path.length === 0 ? (
              <p className="text-center text-xs text-slate-400">
                Sin ruta disponible en sistema.
              </p>
            ) : (
              <ol className="space-y-2">
                {profile.hierarchy_path.map((seg, i) => (
                  <li
                    key={seg.id}
                    className="flex gap-2 rounded-lg border border-cyan-400/12 bg-cyan-950/20 px-2.5 py-2"
                  >
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-cyan-300/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-slate-100">
                        {seg.name}
                      </span>
                      {seg.role?.name ? (
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {seg.role.name}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </HudSection>
          </>
          ) : null}
        </div>
        )}
      </div>
    </EntityScanShell>
  );
}
