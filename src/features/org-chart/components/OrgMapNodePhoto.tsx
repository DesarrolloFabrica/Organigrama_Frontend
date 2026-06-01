import { useState } from "react";
import { withPhotoAccessToken } from "../../../auth/photoUrl";

type Props = {
  name: string;
  photoUrl?: string | null;
};

/**
 * Foto provisional dentro del núcleo holo. Si no hay URL o falla la carga,
 * conserva el avatar CSS existente (.org-map-holo__core::before).
 */
export function OrgMapNodePhoto({ photoUrl }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedPhotoUrl = withPhotoAccessToken(photoUrl);
  const showPhoto = Boolean(resolvedPhotoUrl) && !imageFailed;

  return (
    <div
      className={`org-map-holo__core${showPhoto ? " org-map-holo__core--has-photo" : ""}`}
    >
      {showPhoto ? (
        <img
          src={resolvedPhotoUrl!}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="org-map-holo__photo"
          onError={() => setImageFailed(true)}
        />
      ) : null}
    </div>
  );
}
