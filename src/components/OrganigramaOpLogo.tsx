/** Logo institucional de Organigrama OP (asset en `public/img`). */
export const ORGANIGRAMA_OP_LOGO_SRC = "/img/LogoOrganigramasOp.png";

type Props = {
  className?: string;
  alt?: string;
  /** Si es decorativo, no aporta texto alternativo al árbol de accesibilidad. */
  decorative?: boolean;
};

export function OrganigramaOpLogo({
  className = "h-8 w-auto object-contain",
  alt = "Organigrama OP",
  decorative = true,
}: Props) {
  return (
    <img
      src={ORGANIGRAMA_OP_LOGO_SRC}
      alt={decorative ? "" : alt}
      aria-hidden={decorative}
      className={className}
      decoding="async"
      draggable={false}
    />
  );
}
