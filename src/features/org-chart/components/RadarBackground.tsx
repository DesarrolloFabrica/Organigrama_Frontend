import type { CSSProperties } from "react";

import {
  getRadarPalette,
  type RadarThemeLevel,
} from "../utils/radarTheme";
import { useFlowAreaIdentity } from "../../../contexts/RouteTransitionContext";

type Props = {
  /** Nivel jerárquico visual (1 = más alto en el lienzo). Default L1 cyan. */
  level?: RadarThemeLevel;
  className?: string;
  style?: CSSProperties;
};

/**
 * Fondo radar detrás del canvas: líneas guía CSS a pantalla completa,
 * anillos SVG en viewBox fijo 900×900 y barrido CSS.
 * Solo cambia el matiz cromático según el nivel; layout y opacidades intactos.
 */
export function RadarBackground({
  level = 1,
  className = "",
  style,
}: Props) {
  const CENTER = 450;
  const flowIdentity = useFlowAreaIdentity();
  const { svg, cssVars } = getRadarPalette(level, flowIdentity);

  return (
    <div
      className={`radar-background pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
      style={{ ...cssVars, ...style }}
      data-radar-level={level}
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
          <circle cx={CENTER} cy={CENTER} r="95" fill={svg.fill95} />
          <circle cx={CENTER} cy={CENTER} r="230" fill={svg.fill230} />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="500"
            stroke={svg.stroke500}
            strokeWidth="3"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="800"
            stroke={svg.stroke800}
            strokeWidth="3"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="1500"
            stroke={svg.stroke1500}
            strokeWidth="1"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="370"
            stroke={svg.stroke370}
            strokeWidth="1"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="155"
            stroke={svg.stroke155}
            strokeWidth="1"
            strokeDasharray="10 14"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="275"
            stroke={svg.stroke275}
            strokeWidth="5"
            strokeDasharray="4 18"
          />

          <circle cx={CENTER} cy={CENTER} r="5" fill={svg.dotCenter} />
          <circle
            cx={CENTER}
            cy={CENTER - 220}
            r="4"
            fill={svg.dotAccent}
          />
          <circle
            cx={CENTER + 220}
            cy={CENTER}
            r="3"
            fill={svg.dotAccent}
          />
          <circle
            cx={CENTER - 158}
            cy={CENTER + 158}
            r="3"
            fill={svg.dotAccent}
          />
        </svg>

        <div className="radar-sweep-arm">
          <span className="radar-sweep-arm__beam" />
          <span className="radar-sweep-arm__dot" />
        </div>
      </div>
    </div>
  );
}
