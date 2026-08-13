import { Link } from "react-router-dom";

export function ExplorerHeader() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-400/70">
          MC1 · Conocimiento demostrado
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
          Explorador de Competencias
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Encuentre personas por dominios, especialidades y skills publicadas en
          sus perfiles profesionales.
        </p>
      </div>
      <Link
        to="/org"
        className="rounded-lg border border-cyan-400/25 bg-cyan-950/25 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-950/45"
      >
        Volver al organigrama
      </Link>
    </header>
  );
}
