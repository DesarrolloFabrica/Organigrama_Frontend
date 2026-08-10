import { OrganigramaOpLogo } from "./OrganigramaOpLogo";

export type FlowLoadingIdentity = {
  icon: string;
  label: string;
  glowColor: string;
  highlightColor?: string;
};

type PageLoadingScreenProps = {
  /** Etiqueta para lectores de pantalla. */
  label?: string;
  className?: string;
  variant?: "page" | "flow";
  flowIdentity?: FlowLoadingIdentity | null;
};

/** Pantalla de carga minimalista con logo institucional de Organigrama OP. */
export function PageLoadingScreen({
  label = "Cargando…",
  className = "",
  variant = "page",
  flowIdentity = null,
}: PageLoadingScreenProps) {
  const isFlowLoader = variant === "flow";

  return (
    <main
      className={[
        "loading-screen relative flex flex-col items-center justify-center overflow-hidden text-white",
        isFlowLoader
          ? "loading-screen--flow h-full min-h-full bg-transparent"
          : "min-h-screen bg-[#020617]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {!isFlowLoader ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.11),transparent_55%)]"
        />
      ) : null}

      <div className="loading-screen__content relative z-10 flex flex-col items-center gap-7 px-6">
        <div className="loading-screen__logo-wrap relative flex items-center justify-center">
          <div
            aria-hidden
            className={[
              "absolute rounded-full bg-cyan-400/10 blur-3xl",
              isFlowLoader ? "h-24 w-24" : "h-40 w-40 sm:h-52 sm:w-52",
            ].join(" ")}
          />
          {isFlowLoader && flowIdentity ? (
            <img
              src={flowIdentity.icon}
              alt={flowIdentity.label}
              className="loading-screen__logo loading-screen__flow-icon relative h-32 w-32 object-contain sm:h-40 sm:w-40"
              style={{ filter: `drop-shadow(0 0 28px rgb(${flowIdentity.glowColor} / 0.7))` }}
              draggable={false}
            />
          ) : (
            <OrganigramaOpLogo
              decorative={false}
              alt="Organigrama OP"
              className={[
                "loading-screen__logo relative w-auto object-contain",
                isFlowLoader ? "h-16 sm:h-20" : "h-28 sm:h-36 md:h-40",
              ].join(" ")}
            />
          )}
        </div>

        <div className={["loading-screen__meta flex flex-col items-center gap-3", isFlowLoader ? "sr-only" : ""].join(" ")}>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
            {label}
          </p>
          <div
            className="h-px w-28 overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div className="loading-screen__progress h-full w-2/5 rounded-full bg-cyan-400/75" />
          </div>
        </div>
      </div>
    </main>
  );
}
