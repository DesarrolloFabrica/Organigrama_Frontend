export type OrgChartConnState = "checking" | "online" | "offline";

type Props = {
  state: OrgChartConnState;
  apiBase?: string;
  className?: string;
};

const apiBaseDefault =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export function OrgChartConnectionStatus({
  state,
  apiBase = apiBaseDefault,
  className = "",
}: Props) {
  const baseClass =
    "inline-flex max-w-44 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide backdrop-blur-md";

  if (state === "checking") {
    return (
      <div
        role="status"
        title={`API: ${apiBase}`}
        className={[
          baseClass,
          "border border-amber-400/20 bg-amber-500/10 text-amber-100/90",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="relative flex size-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-amber-400/50" />
          <span className="relative size-1.5 rounded-full bg-amber-300" />
        </span>
        <span className="truncate">Verificando…</span>
      </div>
    );
  }

  if (state === "online") {
    return (
      <div
        role="status"
        title={`API: ${apiBase}`}
        className={[
          baseClass,
          "border border-emerald-400/25 bg-emerald-500/10 text-emerald-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]"
          aria-hidden
        />
        <span className="truncate font-semibold">Conectado</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      title={`API: ${apiBase}`}
      className={[
        baseClass,
        "border border-rose-400/25 bg-rose-500/10 text-rose-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.65)]"
        aria-hidden
      />
      <span className="truncate">Sin conexión</span>
    </div>
  );
}
