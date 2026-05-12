import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { OrgPersonDetail } from "../types";
import { fetchOrgPersonDetail } from "../services/orgChartService";

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

/**
 * Bloque de lectura técnica: título en canal mono + contenedor con relieve suave.
 */
function HudSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-xl border  border-slate-200/80 bg-white/55 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-end justify-between gap-2 border-b border-cyan-500/12 pb-2">
        <div>
          <h3
            id={`${id}-title`}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function HudDetailRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-3 gap-y-0.5 border-b border-slate-200/60 py-2 last:border-b-0 sm:grid-cols-[minmax(0,8.5rem)_1fr]">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-[13px] font-medium leading-snug text-slate-800">
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
}: LoadedProps) {
  const [detail, setDetail] = useState<OrgPersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchOrgPersonDetail(personId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setError(null);
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
  }, [personId]);

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

  return (
    <EntityScanShell
      ariaLabel={`Escaneo de entidad: ${detail.full_name}`}
      layoutVariant={layoutVariant}
    >
      {/*
        Cabecera: núcleo + identidad + estado operativo + cierre táctico.
      */}
      <header className="shrink-0 border-b border-slate-200/70 bg-linear-to-br from-white/90 via-slate-50/70 to-slate-100/50 px-4 pb-4 pt-3">
        <div className="flex gap-3">
          <div
            className="relative flex size-13 shrink-0 items-center justify-center rounded-full border border-cyan-500/22 bg-linear-to-br from-cyan-50/90 to-white text-sm font-bold tracking-tight text-cyan-900 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
            aria-hidden
          >
            {initialsFromName(detail.full_name)}
            <span className="pointer-events-none absolute -inset-0.5 rounded-full border border-cyan-400/15" />
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
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                <span
                  className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]"
                  aria-hidden
                />
                Entidad activa
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                ID {detail.document}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="entity-scan-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 pb-4">
          <HudSection id="sec-contact" title="Datos de contacto">
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
          </HudSection>

          <HudSection id="sec-org" title="Organización">
            <dl>
              <HudDetailRow
                label="Jerarquía"
                value={formatValue(detail.hierarchy?.name ?? null)}
              />
              <HudDetailRow
                label="Área"
                value={formatValue(detail.area?.name ?? null)}
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

          <HudSection id="sec-loc" title="Ubicación">
            <dl>
              <HudDetailRow label="Región" value={formatValue(regionName)} />
              <HudDetailRow label="Ciudad" value={formatValue(cityName)} />
              <HudDetailRow label="Campus" value={formatValue(campusName)} />
            </dl>
          </HudSection>

          <HudSection
            id="sec-team"
            title="Equipo"
            subtitle="Métricas y reportes directos"
          >
            <dl>
              <HudDetailRow
                label="Subordinados (árbol)"
                value={
                  treeDescendantCount != null
                    ? String(treeDescendantCount)
                    : "—"
                }
              />
              <HudDetailRow
                label="Equipo directo"
                value={String(detail.direct_reports_count)}
              />
            </dl>
            {detail.direct_reports.length > 0 ? (
              <ul
                className="mt-2 space-y-1.5 rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5"
                aria-label="Lista de reportes directos"
              >
                {detail.direct_reports.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 text-[13px] text-slate-800"
                  >
                    <span
                      className="size-1 shrink-0 rounded-full bg-cyan-500/70"
                      aria-hidden
                    />
                    <span className="font-medium">{r.full_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-slate-200/90 bg-white/50 px-2 py-2 text-center text-xs text-slate-500">
                Sin reportes directos en registro.
              </p>
            )}
          </HudSection>

          <HudSection id="sec-path" title="Ruta jerárquica">
            {detail.hierarchy_path.length === 0 ? (
              <p className="text-center text-xs text-slate-500">
                Sin ruta disponible en sistema.
              </p>
            ) : (
              <ol className="space-y-2">
                {detail.hierarchy_path.map((seg, i) => (
                  <li
                    key={seg.id}
                    className="flex gap-2 rounded-lg border border-slate-200/60 bg-white/40 px-2.5 py-2"
                  >
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-cyan-700/80">
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
