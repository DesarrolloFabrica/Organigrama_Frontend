type PageLoadingScreenProps = {
  /** Etiqueta para lectores de pantalla. */
  label?: string;
  className?: string;
};

/** Pantalla de carga con radar y logo CUN (misma estética que el boot). */
export function PageLoadingScreen({
  label = "Cargando…",
  className = "",
}: PageLoadingScreenProps) {
  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050814] text-white ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="absolute inset-0 bg-[#020817]" />
      <div className="absolute h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      <div className="absolute h-72 w-72 animate-[radarPulse_2.4s_ease-in-out_infinite] rounded-full border border-cyan-300/20" />
      <div className="absolute h-96 w-96 animate-[radarPulse_2.4s_ease-in-out_infinite_0.35s] rounded-full border border-cyan-300/10" />

      <section className="relative z-10 flex flex-col items-center justify-center">
        <div className="absolute h-44 w-44 animate-[logoGlow_2.4s_ease-in-out_infinite] rounded-full bg-cyan-300/10 blur-2xl" />
        <svg
          className="relative h-[500px] w-[500px] animate-[logoBreath_2.4s_ease-in-out_infinite] drop-shadow-[0_0_28px_rgba(103,232,249,0.28)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800.53 703.01"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeMiterlimit={10}
          aria-hidden
        >
          <g className="text-cyan-300/35">
            <path d="M63.9,405.68c95.85,205.4,213.25,294.6,346.8,296.64,143.33,7.41,264.59-206.24,332.07-389.96l44.12-145.18c15.07-64.81,17.72-109.45,5.09-111.7-.62-.11-1.27.06-1.84.35-65.48,32.76-105.57,165.59-174.26,281.87-50.83,86.05-112.73,160.39-158.37,183.3-33.21,16.67-69.72,20.54-101.71,1.63-40.39-23.87-88.72-70.98-133.31-166.63-21.7-60.25-46.7-111.39-64.48-156.83C125.5,116.07,105.17,60.88,88.74,66.52,37.83,88.95,15.89,145.53,2.44,210.56c-3.12,15.08-2.58,30.71,2.31,45.3,9.52,28.38,19.33,55.22,29.4,80.65l29.74,69.16h0Z" />
            <ellipse cx="424.64" cy="135.99" rx="111.96" ry="135.49" />
          </g>
        </svg>
      </section>
    </main>
  );
}
