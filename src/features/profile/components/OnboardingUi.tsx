import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { OrganigramaOpLogo } from "../../../components/OrganigramaOpLogo";
import type { AuthUser } from "../../../auth/types";
import type { ProfileMe } from "../types";

export const onboardingInputClassName =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/20";

function profileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

/**
 * URL visible en onboarding. Prioriza la foto de Google de la sesión: tras
 * `postPhotoFromGoogle` el perfil suele devolver `/api/org-chart/photos/:id`,
 * que un `<img>` no puede cargar sin cabecera Authorization.
 */
function resolvePhotoUrl(
  profile: ProfileMe,
  authUser: AuthUser | null,
): string | null {
  const google = authUser?.pictureUrl?.trim();
  if (google) return google;
  const fromProfile = profile.photo.photoUrl?.trim();
  return fromProfile || null;
}

export function OnboardingProfileIntro({
  profile,
  authUser,
}: {
  profile: ProfileMe;
  authUser: AuthUser | null;
}) {
  const resolvedUrl = resolvePhotoUrl(profile, authUser);
  const fullName = profile.readonly.full_name?.trim() || "Colaborador";
  const roleName = profile.readonly.role?.name?.trim() || "Sin cargo asignado";
  const initials = profileInitials(fullName);
  const googleFallback = authUser?.pictureUrl?.trim() ?? null;

  const [photoSrc, setPhotoSrc] = useState<string | null>(resolvedUrl);

  useEffect(() => {
    setPhotoSrc(resolvePhotoUrl(profile, authUser));
  }, [profile.photo.photoUrl, profile.photo.source, authUser?.pictureUrl]);

  const showPhoto = Boolean(photoSrc);

  return (
    <div className="flex w-full max-w-2xl items-center gap-4 text-left">
      <div
        className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/35 bg-linear-to-br from-cyan-500/25 to-slate-800/80 shadow-[0_0_24px_-6px_rgba(34,211,238,0.45)] sm:size-16"
        aria-hidden
      >
        {showPhoto ? (
          <img
            src={photoSrc!}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => {
              if (googleFallback && photoSrc !== googleFallback) {
                setPhotoSrc(googleFallback);
                return;
              }
              setPhotoSrc(null);
            }}
          />
        ) : (
          <span className="text-sm font-bold tracking-wide text-cyan-50 sm:text-base">
            {initials}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <OrganigramaOpLogo className="h-7 w-auto object-contain" />
        <h1 className="mt-2 truncate text-lg font-bold tracking-tight text-white sm:text-xl">
          {fullName}
        </h1>
        <p className="mt-0.5 truncate text-sm text-cyan-100/85">{roleName}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300/90 sm:text-sm">
          Completa tu información para continuar al organigrama
        </p>
      </div>
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Datos de contacto" },
  { id: 2, label: "Contacto de emergencia" },
] as const;

export function OnboardingStepProgress({ activeStep }: { activeStep: 1 | 2 }) {
  const progressPct = activeStep === 1 ? 50 : 100;

  return (
    <div className="w-full max-w-2xl" aria-label="Progreso del onboarding">
      <div className="mb-2 flex items-center justify-between gap-2">
        {STEPS.map((s) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;
          return (
            <div
              key={s.id}
              className={[
                "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1.5 text-center transition sm:px-3",
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-50"
                  : isDone
                    ? "border-cyan-400/25 bg-white/5 text-slate-300"
                    : "border-white/10 bg-white/5 text-slate-400",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-cyan-500 text-white"
                    : isDone
                      ? "bg-cyan-600/40 text-cyan-100"
                      : "bg-white/10 text-slate-400",
                ].join(" ")}
              >
                {isDone ? "✓" : s.id}
              </span>
              <span className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px]">
                <span className="hidden sm:inline">Paso {s.id} de 2: </span>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-300 transition-[width] duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function OnboardingRequiredNote() {
  return (
    <p className="w-full max-w-2xl text-center font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400/90">
      <span className="text-cyan-300/80">*</span> Campos obligatorios para continuar
    </p>
  );
}

export function OnboardingFormCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)]"
      aria-labelledby={`${id}-title`}
    >
      <div className="h-0.5 bg-linear-to-r from-cyan-500/80 via-cyan-400/50 to-transparent" />
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <h2
          id={`${id}-title`}
          className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600"
        >
          {title}
        </h2>
        <div className="mt-3 space-y-3">{children}</div>
      </div>
    </section>
  );
}

export function OnboardingVerifiedEmail({
  email,
}: {
  email: string | null | undefined;
}) {
  const display =
    email?.trim() || "Correo institucional no disponible";

  return (
    <div className="rounded-xl border border-cyan-200/60 bg-linear-to-r from-cyan-50/90 to-slate-50/80 px-3 py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Correo educativo
          </p>
          <p className="mt-1 truncate text-[13px] font-semibold text-slate-900">
            {display}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <svg
            className="size-3.5"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M6.5 10.2 8.8 12.5 13.5 7.8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Vinculado con Google
        </span>
      </div>
    </div>
  );
}

export function OnboardingField({
  label,
  id,
  required,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-cyan-600/90" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-[11px] leading-snug text-slate-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
