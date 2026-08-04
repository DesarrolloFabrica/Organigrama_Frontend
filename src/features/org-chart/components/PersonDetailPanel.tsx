import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  isOrgNodeVacancy,
  orgPersonDisplayName,
  orgPersonHasFullProfile,
} from "../types";
import {
  useOrgPersonDetail,
  useOrgPersonVideo,
} from "../../../lib/react-query/hooks";
import { withPhotoAccessToken } from "../../../auth/photoUrl";
import {
  resolveHasPresentation,
  shouldProbePersonVideo,
} from "../utils/personPresentationRules";
import { OrgMapVacancyGlyph } from "./OrgMapVacancyGlyph";
import { PersonCompetenciesPanel } from "./profile-modules/PersonCompetenciesPanel";
import { PersonFichaPanel } from "./profile-modules/PersonFichaPanel";
import { PersonPresentationPanel } from "./profile-modules/PersonPresentationPanel";
import type { ProfileModuleCode } from "./profile-modules/profile-module.types";
import { usePersonProfileModules } from "./profile-modules/usePersonProfileModules";

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
  /** Notifica el módulo activo (ensanche Presentación en overlay). */
  onActiveModuleChange?: (code: ProfileModuleCode | null) => void;
};

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

/**
 * Panel lateral de ficha: consume GET /api/org-chart/person/:id.
 * Shell + módulos extensibles (Ficha / Competencias; Presentación en 4B).
 */
export function PersonDetailPanel(props: Props) {
  if (!props.personId) {
    return (
      <PersonDetailEmptyAside
        onActiveModuleChange={props.onActiveModuleChange}
      />
    );
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
      onActiveModuleChange={props.onActiveModuleChange}
    />
  );
}

function PersonDetailEmptyAside({
  onActiveModuleChange,
}: {
  onActiveModuleChange?: (code: ProfileModuleCode | null) => void;
}) {
  useEffect(() => {
    onActiveModuleChange?.(null);
  }, [onActiveModuleChange]);

  return (
    <EntityScanShell ariaLabel="Detalle de entidad — espera">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
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
  onActiveModuleChange,
}: LoadedProps) {
  const {
    data: detail,
    isLoading,
    isError,
    error: queryError,
  } = useOrgPersonDetail(personId);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoPersonId, setPhotoPersonId] = useState(personId);

  if (photoPersonId !== personId) {
    setPhotoPersonId(personId);
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

  return (
    <PersonDetailContent
      personId={personId}
      detail={detail}
      treeDescendantCount={treeDescendantCount}
      onClose={onClose}
      onMinimize={onMinimize}
      layoutVariant={layoutVariant}
      photoFailed={photoFailed}
      onPhotoFailed={() => setPhotoFailed(true)}
      onActiveModuleChange={onActiveModuleChange}
    />
  );
}

function PersonDetailContent({
  personId,
  detail,
  treeDescendantCount,
  onClose,
  onMinimize,
  layoutVariant,
  photoFailed,
  onPhotoFailed,
  onActiveModuleChange,
}: {
  personId: string;
  detail: NonNullable<ReturnType<typeof useOrgPersonDetail>["data"]>;
  treeDescendantCount: number | null;
  onClose?: () => void;
  onMinimize?: () => void;
  layoutVariant?: "sidebar" | "overlay";
  photoFailed: boolean;
  onPhotoFailed: () => void;
  onActiveModuleChange?: (code: ProfileModuleCode | null) => void;
}) {
  const displayName = orgPersonDisplayName(detail);
  const hasFull = orgPersonHasFullProfile(detail);
  const profile = hasFull ? detail.profile : null;
  const isVacancy = isOrgNodeVacancy(detail);
  const resolvedPhotoUrl = withPhotoAccessToken(detail.photoUrl);
  const showPhoto = !isVacancy && Boolean(resolvedPhotoUrl) && !photoFailed;

  const probeEnabled = shouldProbePersonVideo({
    personId,
    hasFullProfile: hasFull,
    isVacancy,
  });
  const {
    data: videoData,
    isSuccess: videoSuccess,
    isError: videoIsError,
    isFetching: videoIsFetching,
    refreshPersonVideo,
  } = useOrgPersonVideo(personId, probeEnabled);

  const hasPresentation = resolveHasPresentation({
    probeEnabled,
    probeSuccess: videoSuccess,
    hasVideo: videoData?.hasVideo,
  });

  const { visibleModules, activeModule, setActiveModule, showTablist } =
    usePersonProfileModules(personId, {
      hasFullProfile: hasFull,
      isVacancy,
      hasPresentation,
    });

  useEffect(() => {
    onActiveModuleChange?.(activeModule);
    return () => onActiveModuleChange?.(null);
  }, [activeModule, onActiveModuleChange]);

  const onTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const codes = visibleModules.map((m) => m.code);
    const idx = codes.indexOf(activeModule);
    if (idx < 0) return;

    let next: ProfileModuleCode | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = codes[(idx + 1) % codes.length] ?? null;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = codes[(idx - 1 + codes.length) % codes.length] ?? null;
    } else if (event.key === "Home") {
      next = codes[0] ?? null;
    } else if (event.key === "End") {
      next = codes[codes.length - 1] ?? null;
    }

    if (!next) return;
    event.preventDefault();
    setActiveModule(next);
    const tab = document.getElementById(
      visibleModules.find((m) => m.code === next)?.tabId ?? "",
    );
    tab?.focus();
  };

  const roleLabel = profile?.role?.name?.trim()
    ? profile.role.name
    : "Sin cargo asignado";

  return (
    <EntityScanShell
      ariaLabel={
        isVacancy
          ? `Plaza disponible: ${displayName}`
          : `Escaneo de entidad: ${displayName}`
      }
      layoutVariant={layoutVariant}
    >
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
                onError={onPhotoFailed}
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

      {showTablist ? (
        <div
          className="shrink-0 border-b border-cyan-400/15 bg-[#041018]/55 px-3 pt-2 sm:px-4"
          role="tablist"
          aria-label="Secciones de la ficha"
          onKeyDown={onTabListKeyDown}
        >
          <div className="flex gap-1">
            {visibleModules.map((mod) => {
              const selected = activeModule === mod.code;
              return (
                <button
                  key={mod.code}
                  type="button"
                  role="tab"
                  id={mod.tabId}
                  aria-selected={selected}
                  aria-controls={mod.panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveModule(mod.code)}
                  className={[
                    "rounded-t-lg px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition",
                    selected
                      ? "border border-b-0 border-cyan-400/25 bg-[#06111f]/90 text-cyan-100"
                      : "border border-transparent text-slate-500 hover:text-slate-300",
                  ].join(" ")}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="entity-scan-scroll flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        {activeModule === "presentacion" &&
        visibleModules.some((m) => m.code === "presentacion") ? (
          <PersonPresentationPanel
            personId={personId}
            video={videoData}
            isFetching={videoIsFetching}
            isError={videoIsError}
            refreshPersonVideo={refreshPersonVideo}
          />
        ) : activeModule === "competencias" &&
          visibleModules.some((m) => m.code === "competencias") ? (
          <div
            id="person-panel-competencias"
            role="tabpanel"
            aria-labelledby="person-tab-competencias"
          >
            <PersonCompetenciesPanel personId={personId} />
          </div>
        ) : (
          <div
            id="person-panel-ficha"
            role={showTablist ? "tabpanel" : undefined}
            aria-labelledby={showTablist ? "person-tab-ficha" : undefined}
          >
            <PersonFichaPanel
              personId={personId}
              detail={detail}
              treeDescendantCount={treeDescendantCount}
              isVacancy={isVacancy}
            />
          </div>
        )}
      </div>
    </EntityScanShell>
  );
}
