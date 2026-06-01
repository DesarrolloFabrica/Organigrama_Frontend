type Props = {
  className?: string;
  /** Tamaño del glifo en el núcleo holo vs mini-card. */
  size?: "sm" | "md";
  /**
   * Etiqueta accesible cuando el SVG es el único indicador visual (p. ej. avatar en ficha).
   * Si el padre ya tiene `aria-label`, pasar `decorative` para ocultar al lector de pantalla.
   */
  ariaLabel?: string;
  decorative?: boolean;
};

/**
 * Icono genérico de plaza disponible (sin foto ni iniciales de persona).
 */
export function OrgMapVacancyGlyph({
  className,
  size = "md",
  ariaLabel = "Plaza disponible",
  decorative = false,
}: Props) {
  const dim = size === "sm" ? "size-5" : "size-7";

  return (
    <svg
      className={[dim, "shrink-0", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
    >
      <circle
        cx="12"
        cy="12"
        r="9.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3.5 2.5"
        opacity="0.55"
      />
      <path
        d="M12 11.25c1.45 0 2.62-1.05 2.62-2.35S13.45 6.5 12 6.5s-2.62 1.05-2.62 2.4S10.55 11.25 12 11.25Zm0 1.35c-2.2 0-5.38 1.1-5.38 3.3V17h10.76v-1.1c0-2.2-3.18-3.35-5.38-3.35Z"
        fill="currentColor"
        opacity="0.42"
      />
      <path
        d="M16.5 8.25h2.25M5.25 8.25H7.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
