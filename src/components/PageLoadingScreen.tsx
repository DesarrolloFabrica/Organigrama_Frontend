import { OrganigramaOpLogo } from "./OrganigramaOpLogo";

type PageLoadingScreenProps = {
  /** Etiqueta para lectores de pantalla. */
  label?: string;
  className?: string;
};

/** Pantalla de carga minimalista con logo institucional de Organigrama OP. */
export function PageLoadingScreen({
  label = "Cargando…",
  className = "",
}: PageLoadingScreenProps) {
  return (
    <main
      className={[
        "loading-screen relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.11),transparent_55%)]"
      />

      <div className="loading-screen__content relative z-10 flex flex-col items-center gap-7 px-6">
        <div className="loading-screen__logo-wrap relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl sm:h-52 sm:w-52"
          />
          <OrganigramaOpLogo
            decorative={false}
            alt="Organigrama OP"
            className="loading-screen__logo relative h-28 w-auto object-contain sm:h-36 md:h-40"
          />
        </div>

        <div className="loading-screen__meta flex flex-col items-center gap-3">
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
