import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { OrgPersonDetail } from "../types";
import { isOrgNodeVacancy } from "../types";
import { fetchOrgPersonDetail } from "../services/orgChartService";
import { withPhotoAccessToken } from "../../../auth/photoUrl";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";

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
        "entity-scan-shell flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50/95 via-white/92 to-slate-100/88 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md",
        heightClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
    >
      {/* Acento superior muy fino — coherencia con cabecera organigrama */}
      <div
        className="pointer-events-none h-px shrink-0 bg-linear-to-r from-transparent via-cyan-500/35 to-transparent"
        aria-hidden
      />
      {children}
    </aside>
  );
}

type HudSectionIconKind = "contact" | "org" | "location" | "team" | "path";

function HudSectionIcon({ kind }: { kind: HudSectionIconKind }) {
  const className = "size-[18px] text-slate-600";
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
      <div className="flex size-9 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <HudSectionIcon kind={icon} />
      </div>
      <div className="mt-2 flex min-h-[28px] flex-1 flex-col items-center gap-1.5 py-0.5">
        <div className="w-px flex-1 min-h-4 bg-linear-to-b from-slate-300/70 via-slate-200/40 to-transparent" />
        <span className="size-1 rounded-full bg-slate-300/80" />
        <span className="size-1 rounded-full bg-slate-300/55" />
        <span className="size-1 rounded-full bg-slate-300/35" />
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
      className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.12)]"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex min-w-0 gap-2.5 px-2.5 py-3 sm:gap-3 sm:px-3 sm:py-3.5">
        <HudSectionRail icon={icon} />

        <div className="min-w-0 flex-1">
          <header className="pb-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-1.5 shrink-0 rounded-full bg-sky-600/75"
                aria-hidden
              />
              <h3
                id={`${id}-title`}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600"
              >
                {title}
              </h3>
            </div>
            <div className="mt-1.5 flex items-center gap-0" aria-hidden>
              <span className="h-px w-5 shrink-0 bg-sky-600/45" />
              <span className="h-px min-w-0 flex-1 bg-slate-200/90" />
            </div>
            {subtitle ? (
              <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
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
    <div className="relative grid grid-cols-[minmax(0,6.75rem)_1fr] gap-x-2.5 gap-y-0.5 py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-slate-200/90 after:to-transparent last:py-1.5 last:after:hidden sm:grid-cols-[minmax(0,7.75rem)_1fr] sm:gap-x-3 sm:py-2.5">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd
        className={[
          "min-w-0 text-[13px] leading-snug text-slate-900",
          isEmpty
            ? "font-normal text-slate-400/60"
            : emphasized
              ? "font-bold tracking-tight"
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
          className="relative flex size-16 items-center justify-center rounded-full border border-cyan-500/20 bg-linear-to-br from-slate-100/90 to-white shadow-[0_0_24px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
          aria-hidden
        >
          <span className="font-mono text-xs font-bold tracking-widest text-cyan-700/80">
            ◇
          </span>
          <span className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-cyan-400/25" />
        </div>
        <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Canal de lectura inactivo
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight text-slate-800">
          Seleccione una entidad
        </p>
        <p className="mt-2 max-w-68 text-sm leading-relaxed text-slate-600">
          Use el control <span className="font-medium text-cyan-800">Detalle</span> en el
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
  const [detail, setDetail] = useState<OrgPersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [personId]);

  useEffect(() => {
    let cancelled = false;

    fetchOrgPersonDetail(personId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setError(null);
          if (data.photoUrl) {
            onDetailPhotoUrl?.(data.id, data.photoUrl);
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDetail(null);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el detalle de la persona.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [personId, onDetailPhotoUrl]);

  if (loading) {
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
            className="relative flex size-14 items-center justify-center rounded-full border border-cyan-500/25 bg-white/80"
            aria-hidden
          >
            <div className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
          </div>
          <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recuperando registro
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-700">
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
        <div className="border-b border-rose-200/60 bg-rose-50/50 px-4 py-3" role="alert">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-800/90">
            Fallo de enlace
          </p>
          <p className="mt-1 text-sm font-semibold text-rose-950">
            Error al cargar la entidad
          </p>
          <p className="mt-1 text-sm text-rose-900/90">{error}</p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-sm hover:bg-rose-50"
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

  const regionName = detail.location?.region?.name ?? null;
  const cityName = detail.location?.city?.name ?? null;
  const campusName = detail.location?.campus?.name ?? null;
  const roleLabel = detail.role?.name?.trim()
    ? detail.role.name
    : "Sin cargo asignado";
  const isVacancy = isOrgNodeVacancy(detail);
  const resolvedPhotoUrl = withPhotoAccessToken(detail.photoUrl);
  const showPhoto = !isVacancy && Boolean(resolvedPhotoUrl) && !photoFailed;

  return (
    <EntityScanShell
      ariaLabel={
        isVacancy
          ? `Plaza disponible: ${detail.full_name}`
          : `Escaneo de entidad: ${detail.full_name}`
      }
      layoutVariant={layoutVariant}
    >
      {/*
        Cabecera: núcleo + identidad + estado operativo + cierre táctico.
      */}
      <header className="shrink-0 border-b border-slate-200/70 bg-linear-to-br from-white/90 via-slate-50/70 to-slate-100/50 px-4 pb-4 pt-3">
        <div className="flex gap-3">
          <div
            className={[
              "relative flex size-13 shrink-0 items-center justify-center rounded-full border text-sm font-bold tracking-tight",
              isVacancy
                ? "border-dashed border-slate-400/45 bg-slate-100/90 shadow-[0_0_16px_rgba(148,163,184,0.12)]"
                : "border-cyan-500/22 bg-linear-to-br from-cyan-50/90 to-white text-cyan-900 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
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
              initialsFromName(detail.full_name)
            )}
            {!isVacancy ? (
              <span className="pointer-events-none absolute -inset-0.5 rounded-full border border-cyan-400/15" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                  {detail.full_name}
                </h2>
                <p className="mt-0.5 text-sm font-medium leading-snug text-slate-600">
                  {roleLabel}
                </p>
                {isVacancy ? (
                  <p className="mt-1.5 text-xs leading-snug text-slate-500">
                    Plaza disponible dentro de la estructura operativa
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {onMinimize ? (
                  <button
                    type="button"
                    onClick={onMinimize}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200/90 bg-white/90 text-slate-600 shadow-sm transition hover:border-cyan-300/60 hover:text-cyan-900 hover:shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                    aria-label="Minimizar panel de detalle"
                  >
                    <IconMinimize className="size-4" />
                  </button>
                ) : null}
                {onClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200/90 bg-white/90 text-slate-600 shadow-sm transition hover:border-cyan-300/60 hover:text-cyan-900 hover:shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                    aria-label="Cerrar panel de detalle"
                  >
                    <IconClose className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isVacancy ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-400/55 bg-slate-100/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  <span
                    className="size-1.5 rounded-sm border border-dashed border-slate-500/70"
                    aria-hidden
                  />
                  Vacante
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                  <span
                    className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]"
                    aria-hidden
                  />
                  Entidad activa
                </span>
              )}
              <span className="font-mono text-[10px] text-slate-500">
                ID {detail.document}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="entity-scan-scroll flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3.5 pb-4">
          <HudSection id="sec-contact" title="Datos de contacto" icon="contact">
            <dl>
              <HudDetailRow
                label="Documento"
                value={formatValue(detail.document)}
                hint={detail.type_document ?? undefined}
              />
              <HudDetailRow label="Correo" value={formatValue(detail.email)} />
              <HudDetailRow
                label="Correo educativo"
                value={formatValue(detail.edu_email)}
              />
              <HudDetailRow label="Teléfono" value={formatValue(detail.phone)} />
            </dl>
            <div className="mt-3 border-t border-slate-100/90 pt-2">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Contacto de emergencia
              </p>
              <dl>
                <HudDetailRow
                  label="Nombre"
                  value={formatValue(detail.emergency_contact?.name ?? null)}
                />
                <HudDetailRow
                  label="Teléfono"
                  value={formatValue(detail.emergency_contact?.phone ?? null)}
                />
                <HudDetailRow
                  label="Parentesco"
                  value={formatValue(
                    detail.emergency_contact?.relationship ?? null,
                  )}
                />
              </dl>
            </div>
          </HudSection>

          <HudSection id="sec-org" title="Organización" icon="org">
            <dl>
              <HudDetailRow
                label="Jerarquía"
                value={formatValue(detail.hierarchy?.name ?? null)}
                emphasized
              />
              <HudDetailRow
                label="Área"
                value={formatValue(detail.area?.name ?? null)}
                emphasized
              />
              <HudDetailRow
                label="Escuela"
                value={formatValue(detail.school?.name ?? null)}
              />
              <HudDetailRow
                label="Programa"
                value={formatValue(detail.program?.name ?? null)}
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
                value={String(detail.direct_reports_count)}
              />
            </dl>
            {detail.direct_reports.length > 0 ? (
              <ul
                className="mt-2 space-y-1.5 rounded-lg border border-slate-200/70 bg-slate-50/80 px-3 py-2.5"
                aria-label="Lista de reportes directos"
              >
                {detail.direct_reports.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 text-[13px] font-medium text-slate-800"
                  >
                    <span
                      className="size-1 shrink-0 rounded-full bg-slate-400/70"
                      aria-hidden
                    />
                    <span className="font-medium">{r.full_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-slate-200/80 bg-slate-50/50 px-2 py-2 text-center text-xs text-slate-500">
                Sin reportes directos en registro.
              </p>
            )}
          </HudSection>

          <HudSection id="sec-path" title="Ruta jerárquica" icon="path">
            {detail.hierarchy_path.length === 0 ? (
              <p className="text-center text-xs text-slate-500">
                Sin ruta disponible en sistema.
              </p>
            ) : (
              <ol className="space-y-2">
                {detail.hierarchy_path.map((seg, i) => (
                  <li
                    key={seg.id}
                    className="flex gap-2 rounded-lg border border-slate-200/70 bg-slate-50/60 px-2.5 py-2"
                  >
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-sky-700/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-slate-900">
                        {seg.name}
                      </span>
                      {seg.role?.name ? (
                        <span className="mt-0.5 block text-xs text-slate-600">
                          {seg.role.name}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </HudSection>
        </div>
      </div>
    </EntityScanShell>
  );
}
