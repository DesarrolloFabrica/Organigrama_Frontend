import type { CSSProperties } from "react";

import type { CoordinationEmblemConfig } from "../config/coordinationEmblems";

type CoordinationEmblemStyle = CSSProperties & {
  "--coordination-glow": string;
  "--coordination-highlight": string;
};

type Props = {
  config: CoordinationEmblemConfig;
  selected?: boolean;
  disabled?: boolean;
};

export function CoordinationEmblem({
  config,
  selected = false,
  disabled = false,
}: Props) {
  const style: CoordinationEmblemStyle = {
    "--coordination-glow": config.glowColor,
    "--coordination-highlight": config.highlightColor,
  };

  return (
    <div
      className={[
        "coordination-emblem",
        config.placement === "watermarkCorner"
          ? "coordination-emblem--watermark"
          : "",
        config.placement === "cornerSmall"
          ? "coordination-emblem--roleInline"
          : "",
        config.placement
          ? `coordination-emblem--${config.placement}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-selected={selected ? "true" : "false"}
      data-disabled={disabled ? "true" : "false"}
      data-soft-glow={config.softGlow ? "true" : "false"}
      style={style}
      title={config.label}
      aria-hidden="true"
    >
      <span className="coordination-emblem__ambient-light" aria-hidden="true" />
      <span className="coordination-emblem__radar" aria-hidden="true" />
      <span className="coordination-emblem__scan" aria-hidden="true" />
      <img
        className="coordination-emblem__icon"
        src={config.icon}
        alt=""
        draggable={false}
      />
    </div>
  );
}
