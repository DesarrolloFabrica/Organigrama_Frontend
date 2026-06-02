import type { ReactNode } from "react";

export function ProfileEntityShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
      <header className="overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50/95 via-white/92 to-slate-100/88 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700/80">
          Organigrama OP
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

type HudSectionIconKind = "contact" | "org" | "location";

function HudSectionIcon({ kind }: { kind: HudSectionIconKind }) {
  const className = "size-[18px] text-slate-600";
  const stroke = "currentColor";
  const sw = 1.5;

  if (kind === "contact") {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M3.5 4.5h13v11h-13v-11zM3.5 7.5l6.5 4 6.5-4"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "org") {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="5" r="2.25" stroke={stroke} strokeWidth={sw} />
        <path
          d="M4 16v-1.5a3 3 0 013-3h6a3 3 0 013 3V16"
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2.5l4.5 7.5H5.5L10 2.5zM4 17h12"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileHudSection({
  id,
  title,
  icon,
  children,
  className = "",
}: {
  id: string;
  title: string;
  icon: HudSectionIconKind;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={[
        "overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.12)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`${id}-title`}
    >
      <div className="flex gap-3 px-3 py-3.5 sm:px-4">
        <div className="flex w-8 shrink-0 justify-center pt-0.5">
          <HudSectionIcon kind={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id={`${id}-title`}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600"
          >
            {title}
          </h2>
          <div className="mt-3 min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ProfileReadonlyRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const displayValue =
    value === null || value === undefined || String(value).trim() === ""
      ? "—"
      : String(value).trim();

  return (
    <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-x-3 gap-y-1 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd
        className={[
          "text-[13px] font-semibold",
          displayValue === "—" ? "text-slate-400/60" : "text-slate-900",
        ].join(" ")}
      >
        {displayValue}
      </dd>
    </div>
  );
}

export function ProfileField({
  label,
  id,
  required,
  error,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500"
      >
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const profileInputClassName =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/20";
