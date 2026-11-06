/**
 * Identidad HUD del módulo Presentación.
 *
 * - `PresentationLevelFrame`: marco con paleta neutra única; el nivel solo
 *   ajusta la geometría (retícula, anillos, marcas y, en N3, un barrido lento).
 * - `PresentationLevelIndicator`: radar “Nivel N” de la cabecera, con color por nivel.
 * La marca de agua de la ficha es el emblema de la coordinación (`PersonDetailPanel`).
 * Colores de nivel = mapa (`ORG_MAP_LEVEL_THEME_MAP`). Capas decorativas:
 * `aria-hidden`, sin eventos de puntero.
 */
import type { CSSProperties, ReactNode } from "react";
import { ORG_MAP_LEVEL_THEME_MAP } from "../../utils/orgMapLevelTheme";
import type { PresentationLevel } from "../../utils/presentationLevel";

type LevelVariant = {
  /** Paso de la retícula (px); mayor = más aire. */
  gridStep: number;
  /** Radios de anillos sobre un viewBox 100×100. */
  rings: readonly number[];
  /** Marcas de graduación en el anillo exterior. */
  ticks: number;
  /** Barrido de radar (solo movimiento permitido por el usuario). */
  sweep: boolean;
};

const LEVEL_VARIANTS: Record<PresentationLevel, LevelVariant> = {
  1: { gridStep: 56, rings: [44], ticks: 0, sweep: false },
  2: { gridStep: 36, rings: [30, 44], ticks: 24, sweep: false },
  3: { gridStep: 28, rings: [18, 31, 44], ticks: 36, sweep: true },
};

/** Sin nivel conocido: marco base, sin número. */
const NEUTRAL_VARIANT: LevelVariant = {
  gridStep: 56,
  rings: [44],
  ticks: 0,
  sweep: false,
};

/** slate-400: trazo HUD neutro, igual en todos los niveles. */
const HUD_NEUTRAL = "#94a3b8";

const mix = (pct: number) =>
  `color-mix(in srgb, currentColor ${pct}%, transparent)`;

function RadarInstrument({ variant }: { variant: LevelVariant }) {
  const ticks = Array.from({ length: variant.ticks }, (_, i) => i);

  return (
    <div className="absolute inset-y-0 -right-[8%] aspect-square h-full">
      {variant.sweep ? (
        <div className="absolute inset-[6%] overflow-hidden rounded-full">
          <div
            className="size-full rounded-full motion-safe:animate-[spin_14s_linear_infinite]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0turn 0.8turn, ${mix(9)} 1turn)`,
            }}
          />
        </div>
      ) : null}

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        fill="none"
        stroke="currentColor"
      >
        {variant.rings.map((r, i) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            strokeWidth="0.25"
            strokeOpacity={i === variant.rings.length - 1 ? 0.22 : 0.14}
            strokeDasharray={i === variant.rings.length - 1 ? undefined : "1 1.5"}
          />
        ))}
        <path
          d="M50 4v8M50 88v8M4 50h8M88 50h8"
          strokeWidth="0.3"
          strokeOpacity="0.28"
        />
        {ticks.map((i) => (
          <line
            key={i}
            x1="50"
            y1="6"
            x2="50"
            y2={i % 3 === 0 ? 8.5 : 7.2}
            strokeWidth="0.25"
            strokeOpacity="0.2"
            transform={`rotate(${(360 / variant.ticks) * i} 50 50)`}
          />
        ))}
      </svg>
    </div>
  );
}

function HudCorners() {
  const corner = "absolute size-3 border-current/35";
  return (
    <>
      <span className={`${corner} left-2 top-2 border-l border-t`} />
      <span className={`${corner} right-2 top-2 border-r border-t`} />
      <span className={`${corner} bottom-2 left-2 border-b border-l`} />
      <span className={`${corner} bottom-2 right-2 border-b border-r`} />
    </>
  );
}

/**
 * Indicador radar “Nivel N” de la cabecera: único elemento con color por nivel.
 * Titileo 100 % CSS (`.presentation-level-radar__*` en index.css); estático
 * con `prefers-reduced-motion: reduce`. El pulso escala dentro del viewBox
 * (máx. 1), así que no desborda.
 */
export function PresentationLevelIndicator({
  level,
}: {
  level: PresentationLevel | null;
}) {
  if (level == null) return null;
  return (
    <div
      className="flex shrink-0 items-center gap-2"
      style={{ color: ORG_MAP_LEVEL_THEME_MAP[level].primary }}
      role="img"
      aria-label={`Nivel ${level}`}
    >
      <span
        className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em]"
        aria-hidden
      >
        Nivel
      </span>
      <span className="relative block size-12 sm:size-14" aria-hidden>
        <svg
          viewBox="0 0 56 56"
          className="absolute inset-0 size-full"
          fill="none"
          stroke="currentColor"
        >
          <circle
            className="presentation-level-radar__ping"
            cx="28"
            cy="28"
            r="26"
            strokeWidth="1"
            strokeOpacity="0"
          />
          <circle cx="28" cy="28" r="26" strokeWidth="0.75" strokeOpacity="0.35" />
          <circle
            cx="28"
            cy="28"
            r="19.5"
            strokeWidth="0.75"
            strokeOpacity="0.28"
            strokeDasharray="2 3"
          />
          <path
            d="M28 1v5M28 50v5M1 28h5M50 28h5"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle
            className="presentation-level-radar__core"
            cx="28"
            cy="28"
            r="13"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        </svg>
        <span className="presentation-level-radar__digit absolute inset-0 flex items-center justify-center font-mono text-base font-bold sm:text-lg">
          {level}
        </span>
      </span>
    </div>
  );
}

export function PresentationLevelFrame({
  level,
  children,
}: {
  level: PresentationLevel | null;
  children: ReactNode;
}) {
  const variant = level != null ? LEVEL_VARIANTS[level] : NEUTRAL_VARIANT;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#041018]/60 p-3 sm:p-4"
      data-presentation-level={level ?? "none"}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ color: HUD_NEUTRAL }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={
            {
              backgroundImage: `linear-gradient(to right, ${mix(6)} 1px, transparent 1px), linear-gradient(to bottom, ${mix(6)} 1px, transparent 1px)`,
              backgroundSize: `${variant.gridStep}px ${variant.gridStep}px`,
              maskImage:
                "radial-gradient(ellipse 80% 90% at 75% 50%, black 20%, transparent 85%)",
            } as CSSProperties
          }
        />
        <RadarInstrument variant={variant} />
        <div className="absolute inset-0 bg-linear-to-r from-[#020617]/70 via-[#020617]/20 to-transparent" />
        <HudCorners />
      </div>

      {/* Sin `isolate`: el reproductor (z-20) debe quedar sobre la marca de agua de la ficha. */}
      <div className="relative">{children}</div>
    </div>
  );
}
