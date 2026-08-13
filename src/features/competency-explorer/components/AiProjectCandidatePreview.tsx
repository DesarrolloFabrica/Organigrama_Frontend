export function AiProjectCandidatePreview() {
  return (
    <section
      aria-labelledby="ai-project-candidates-title"
      className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-[linear-gradient(135deg,rgba(76,29,149,0.18),rgba(6,17,31,0.78)_48%,rgba(8,47,73,0.22))] px-4 py-4 sm:px-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-violet-500/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/75">
              Selección inteligente para proyectos
            </p>
            <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
              En desarrollo · Próximamente
            </span>
          </div>
          <h2
            id="ai-project-candidates-title"
            className="mt-2 text-base font-semibold tracking-tight text-slate-50 sm:text-lg"
          >
            Cuéntenos el reto de su proyecto y la IA identificará el talento con
            las competencias más alineadas para hacerlo realidad.
          </h2>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
            Esta función analizará las necesidades descritas y propondrá
            candidatos a partir de sus perfiles MC1 publicados y autorizados.
          </p>
        </div>

        <div className="relative w-full lg:max-w-md">
          <label htmlFor="ai-project-description-preview" className="sr-only">
            Descripción del proyecto
          </label>
          <textarea
            id="ai-project-description-preview"
            disabled
            rows={3}
            placeholder="Describa el objetivo, los desafíos y las competencias que requiere su proyecto…"
            className="min-h-24 w-full resize-none rounded-xl border border-slate-600/45 bg-slate-950/55 py-3 pl-11 pr-3 text-sm text-slate-500 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-80"
          />
          <span
            aria-hidden
            className="absolute left-3.5 top-3.5 flex size-6 items-center justify-center rounded-md border border-violet-300/20 bg-violet-400/10 text-violet-200/70"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-3.5">
              <rect
                x="4.5"
                y="8.25"
                width="11"
                height="8"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M7 8.25V6a3 3 0 0 1 6 0v2.25"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M10 11.25v2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
