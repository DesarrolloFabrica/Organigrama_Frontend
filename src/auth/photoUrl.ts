import { getAccessToken } from './authStorage'

/** Añade JWT a URLs de foto proxy para que `<img>` pueda cargarlas. */
export function withPhotoAccessToken(
  photoUrl: string | null | undefined,
): string | null {
  if (!photoUrl) {
    return null
  }

  const token = getAccessToken()
  if (!token) {
    return photoUrl
  }

  const separator = photoUrl.includes('?') ? '&' : '?'
  return `${photoUrl}${separator}access_token=${encodeURIComponent(token)}`
}
