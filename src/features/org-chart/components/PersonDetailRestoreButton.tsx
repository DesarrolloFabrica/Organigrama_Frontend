type Props = {
  onRestore: () => void;
  className?: string;
};

function IconPanelRestore() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.5 4.5h9v11h-9v-11z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8h6M8.5 11h4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M4 7.5V14a1.5 1.5 0 001.5 1.5H6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg className="size-3.5" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M12 5l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Control flotante para restaurar la ficha técnica minimizada. */
export function PersonDetailRestoreButton({ onRestore, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onRestore}
      aria-label="Mostrar ficha técnica"
      className={[
        "person-detail-restore pointer-events-auto fixed bottom-5 right-4 z-40 inline-flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-[#020617]/92 px-3 py-2.5 text-left shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_16px_48px_-10px_rgba(0,0,0,0.72),0_0_36px_rgba(34,211,238,0.12)] backdrop-blur-xl transition hover:border-cyan-300/45 hover:bg-[#041018]/95 hover:shadow-[0_0_48px_rgba(34,211,238,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/40 sm:absolute sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <IconPanelRestore />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-50">
          Ficha técnica
        </span>
        <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
          Restaurar panel
        </span>
      </span>
      <span className="ml-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-950/40 text-cyan-200/80">
        <IconChevronLeft />
      </span>
    </button>
  );
}
