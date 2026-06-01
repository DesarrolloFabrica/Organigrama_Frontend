/**
 * Fondo radar detrás del canvas: líneas guía CSS a pantalla completa,
 * anillos SVG en viewBox fijo 900×900 y barrido CSS.
 */
export function RadarBackground() {
  const CENTER = 450;

  return (
    <div
      className="radar-background pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="radar-background__stage">
        <div className="radar-guide-lines">
          <span className="radar-guide-line radar-guide-line--horizontal" />
          <span className="radar-guide-line radar-guide-line--vertical" />
          <span className="radar-guide-line radar-guide-line--diagonal-a" />
          <span className="radar-guide-line radar-guide-line--diagonal-b" />
        </div>

        <svg
          viewBox="0 0 900 900"
          className="radar-background__svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rellenos suaves internos */}
          <circle cx={CENTER} cy={CENTER} r="95" fill="rgba(34, 211, 238, 0.035)" />
          <circle cx={CENTER} cy={CENTER} r="230" fill="rgba(34, 211, 238, 0.018)" />

          {/* Anillos principales */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r="500"
            stroke="rgba(34, 211, 238, 2)"
            strokeWidth="3"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="800"
            stroke="rgba(34, 211, 238, 1)"
            strokeWidth="3"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="1500"
            stroke="rgba(34, 211, 238, 50)"
            strokeWidth="1"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="370"
            stroke="rgba(34, 211, 238, 0.8)"
            strokeWidth="1"
          />

          {/* Anillos punteados */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r="155"
            stroke="rgba(125, 249, 255, 0.8)"
            strokeWidth="1"
            strokeDasharray="10 14"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="275"
            stroke="rgba(125, 249, 255, 50)"
            strokeWidth="5"
            strokeDasharray="4 18"
          />

          {/* Puntos decorativos */}
          <circle cx={CENTER} cy={CENTER} r="5" fill="rgba(125, 249, 255, 0.65)" />
          <circle cx={CENTER} cy={CENTER - 220} r="4" fill="rgba(125, 249, 255, 0.75)" />
          <circle cx={CENTER + 220} cy={CENTER} r="3" fill="rgba(125, 249, 255, 0.75)" />
          <circle cx={CENTER - 158} cy={CENTER + 158} r="3" fill="rgba(125, 249, 255, 0.75)" />
        </svg>

        <div className="radar-sweep-arm">
          <span className="radar-sweep-arm__beam" />
          <span className="radar-sweep-arm__dot" />
        </div>
      </div>
    </div>
  );
}
