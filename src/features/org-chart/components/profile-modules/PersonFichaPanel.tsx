import type { ReactNode } from "react";
import { useState } from "react";
import {
  formatWorkforceEventRange,
  formatWorkforceEventStatus,
  orgPersonHasFullProfile,
  workforceEventBadgeTone,
  type OrgPersonDetail,
  type WorkforceEventItem,
} from "../../types";
import {
  useOrgPersonCv,
  useOrgPersonWorkforceEvents,
} from "../../../../lib/react-query/hooks";

type Props = {
  personId: string;
  detail: OrgPersonDetail;
  treeDescendantCount: number | null;
  isVacancy: boolean;
};

// Ocultamiento temporal para todas las fichas. Cambiar a `true` restaura
// ambas secciones sin recuperar código eliminado.
const SHOW_LOCATION_AND_TEAM_SECTIONS = false;

function formatValue(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

type HudSectionIconKind =
  | "contact"
  | "org"
  | "location"
  | "team"
  | "path"
  | "novedad";

function HudSectionIcon({ kind }: { kind: HudSectionIconKind }) {
  const className = "entity-detail-accent-icon size-[18px] text-cyan-300/80";
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
    case "novedad":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="4.5"
            y="5.5"
            width="15"
            height="14"
            rx="2"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d="M8 3.5v4M16 3.5v4M4.5 10h15"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M9 14h6"
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

function HudSectionRail({ icon }: { icon: HudSectionIconKind }) {
  return (
    <div
      className="flex w-10 shrink-0 flex-col items-center sm:w-11"
      aria-hidden
    >
      <div className="entity-detail-accent-frame flex size-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-950/40 shadow-[0_0_16px_rgba(34,211,238,0.1)]">
        <HudSectionIcon kind={icon} />
      </div>
      <div className="mt-2 flex min-h-[28px] flex-1 flex-col items-center gap-1.5 py-0.5">
        <div className="entity-detail-accent-rail w-px flex-1 min-h-4" />
        <span className="entity-detail-accent-dot size-1 rounded-full opacity-80" />
        <span className="entity-detail-accent-dot size-1 rounded-full opacity-55" />
        <span className="entity-detail-accent-dot size-1 rounded-full opacity-35" />
      </div>
    </div>
  );
}

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
                className="entity-detail-accent-dot size-1.5 shrink-0 rounded-full"
                aria-hidden
              />
              <h3
                id={`${id}-title`}
                className="entity-detail-title font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80"
              >
                {title}
              </h3>
            </div>
            <div className="mt-1.5 flex items-center gap-0" aria-hidden>
              <span className="entity-detail-accent-rule h-px w-5 shrink-0 opacity-60" />
              <span className="entity-detail-accent-rule h-px min-w-0 flex-1 opacity-20" />
            </div>
            {subtitle ? (
              <p className="entity-detail-subtitle mt-1.5 text-[11px] leading-snug text-slate-400">
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
    <div className="entity-detail-data-row relative grid grid-cols-[minmax(0,6.75rem)_1fr] gap-x-2.5 gap-y-0.5 py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px last:py-1.5 last:after:hidden sm:grid-cols-[minmax(0,7.75rem)_1fr] sm:gap-x-3 sm:py-2.5">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd
        className={[
          "min-w-0 text-[13px] leading-snug text-slate-50",
          isEmpty
            ? "font-normal text-slate-500/70"
            : emphasized
              ? "font-bold tracking-tight text-slate-50"
              : "font-semibold",
        ].join(" ")}
      >
        {value}
        {hint ? (
          <span className="entity-detail-subtitle ml-1.5 font-mono text-[10px] font-normal text-slate-500">
            ({hint})
          </span>
        ) : null}
      </dd>
    </div>
  );
}

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
        <IconFileText className="entity-detail-accent-icon size-4 shrink-0 text-cyan-300/80" />
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

  if (isError) {
    return (
      <div className={`${shellClass} text-slate-500`}>
        No fue posible consultar la hoja de vida
      </div>
    );
  }

  if (!cv?.hasCv) {
    return (
      <div className={`${shellClass} text-slate-400`}>
        <IconFileText className="size-4 shrink-0 text-slate-500" />
        Hoja de vida no disponible
      </div>
    );
  }

  const viewUrl = cv.viewUrl;

  const handleOpen = () => {
    if (!viewUrl) return;
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
      <IconExternalLink className="entity-detail-accent-icon size-3.5 shrink-0 text-cyan-300/80" />
    </button>
  );
}

const STATUS_TONE_CLASS: Record<string, string> = {
  PENDING: "text-amber-300",
  NOT_TAKEN: "text-amber-300",
  APPROVED: "text-emerald-300",
  TAKEN: "text-emerald-300",
  REJECTED: "text-rose-300",
  CANCELLED: "text-slate-500",
};

const TYPE_DOT_CLASS: Record<string, string> = {
  health: "bg-rose-400",
  leave: "bg-amber-400",
  sanction: "bg-red-400",
  remote: "bg-cyan-400",
  other: "bg-slate-400",
};

function formatEventSchedule(event: WorkforceEventItem): string {
  const range = formatWorkforceEventRange(event.startDate, event.endDate);
  const time =
    event.startTime || event.endTime
      ? [event.startTime, event.endTime].filter(Boolean).join(" – ")
      : "";
  if (range && time) return `${range} · ${time}`;
  return range || time;
}

function PersonWorkforceEventsSection({ personId }: { personId: string }) {
  const { data, isLoading, isError } = useOrgPersonWorkforceEvents(personId);
  const items = data?.items ?? [];

  return (
    <HudSection
      id="sec-novedades"
      title="Novedades"
      icon="novedad"
      subtitle="Licencias, permisos, incapacidades y demás eventos de personal"
    >
      {isLoading ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-cyan-400/12 bg-cyan-950/20 px-3 py-2.5 text-[12px] text-slate-400"
          aria-busy="true"
        >
          <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-cyan-900/60 border-t-cyan-300" />
          Consultando novedades…
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-md border border-dashed border-cyan-400/15 bg-cyan-950/15 px-2 py-2 text-center text-xs text-slate-400">
          No fue posible consultar las novedades
        </p>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <p className="rounded-md border border-dashed border-cyan-400/15 bg-cyan-950/15 px-2 py-2 text-center text-xs text-slate-400">
          Sin novedades registradas
        </p>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <ul className="space-y-2" aria-label="Historial de novedades">
          {items.map((event) => {
            const schedule = formatEventSchedule(event);
            const tone = workforceEventBadgeTone(event.eventTypeName);
            return (
              <li
                key={event.id}
                className={[
                  "rounded-lg border bg-cyan-950/20 px-2.5 py-2",
                  event.isCurrent
                    ? "border-cyan-400/25"
                    : "border-cyan-400/12",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className={[
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      TYPE_DOT_CLASS[tone],
                    ].join(" ")}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <span className="text-[13px] font-semibold tracking-tight text-slate-100">
                        {event.eventTypeName}
                      </span>
                      <span
                        className={[
                          "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                          STATUS_TONE_CLASS[event.status] ?? "text-slate-400",
                        ].join(" ")}
                      >
                        {formatWorkforceEventStatus(event.status)}
                        {event.isCurrent ? " · vigente" : ""}
                      </span>
                    </div>
                    {schedule ? (
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {schedule}
                      </p>
                    ) : null}
                    {event.observation ? (
                      <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-slate-300">
                        {event.observation}
                      </p>
                    ) : null}
                    {event.createdByPerson?.name ? (
                      <p className="mt-1 text-[10px] text-slate-500">
                        Registró {event.createdByPerson.name}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </HudSection>
  );
}

/**
 * Contenido del módulo Ficha (datos de perfil / vista limitada).
 * Extraído de PersonDetailPanel sin cambiar markup ni estilos.
 */
export function PersonFichaPanel({
  personId,
  detail,
  treeDescendantCount,
  isVacancy,
}: Props) {
  const hasFull = orgPersonHasFullProfile(detail);
  const profile = hasFull ? detail.profile : null;
  const regionName = profile?.location?.region?.name ?? null;
  const cityName = profile?.location?.city?.name ?? null;
  const campusName = profile?.location?.campus?.name ?? null;

  return (
    <div className="flex flex-col gap-3.5 pb-4">
      {!hasFull ? (
        <HudSection id="sec-public" title="Contacto institucional" icon="contact">
          <dl>
            <HudDetailRow
              label="Correo institucional"
              value={formatValue(detail.institutionalEmail)}
            />
            {/*
              El backend solo envía `phone` en la ficha redactada cuando el viewer
              tiene ORG_CONTACT_READ_ALL. La UI no evalúa permisos: si el dato no
              vino, la fila no existe. La ficha sigue siendo limitada.
            */}
            {detail.phone ? (
              <HudDetailRow
                label="Teléfono"
                value={formatValue(detail.phone)}
              />
            ) : null}
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
              <p className="entity-detail-title mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
            {!isVacancy ? (
              <div className="mt-3 border-t border-cyan-400/10 pt-2">
                <p className="entity-detail-title mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Hoja de vida
                </p>
                <PersonCvAction personId={personId} />
              </div>
            ) : null}
          </HudSection>

          {!isVacancy ? (
            <PersonWorkforceEventsSection personId={personId} />
          ) : null}

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

          {SHOW_LOCATION_AND_TEAM_SECTIONS ? (
            <>
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
                      className="entity-detail-accent-dot size-1 shrink-0 rounded-full"
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

            </>
          ) : null}

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
                    <span className="entity-detail-accent-text font-mono text-[10px] font-semibold tabular-nums text-cyan-300/80">
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
  );
}
