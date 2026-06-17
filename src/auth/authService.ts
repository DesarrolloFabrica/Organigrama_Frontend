import type { AuthUser, GoogleLoginResult } from './types'

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export function getGoogleClientId(): string {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
    '550902908078-fvabjtle954fqr6alhofdv7fvvr4bcbv.apps.googleusercontent.com'
  )
}

export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<GoogleLoginResult> {
  const res = await fetch(`${BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  })

  const bodyText = await res.text().catch(() => '')
  if (!res.ok) {
    let message = 'No se pudo iniciar sesión'
    try {
      const parsed = JSON.parse(bodyText) as { message?: string | string[] }
      const raw = parsed.message
      message = Array.isArray(raw) ? raw.join('. ') : raw || message
    } catch {
      if (bodyText) {
        message = bodyText.slice(0, 240)
      }
    }
    throw new Error(message)
  }

  return JSON.parse(bodyText) as GoogleLoginResult
}

export async function loginWithDevEmail(
  email: string,
): Promise<GoogleLoginResult> {
  const res = await fetch(`${BASE_URL}/api/auth/dev-login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const bodyText = await res.text().catch(() => '')
  if (!res.ok) {
    let message = 'No se pudo iniciar sesión'
    try {
      const parsed = JSON.parse(bodyText) as { message?: string | string[] }
      const raw = parsed.message
      message = Array.isArray(raw) ? raw.join('. ') : raw || message
    } catch {
      if (bodyText) {
        message = bodyText.slice(0, 240)
      }
    }
    throw new Error(message)
  }

  return JSON.parse(bodyText) as GoogleLoginResult
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error('Sesión inválida')
  }

  return res.json() as Promise<AuthUser>
}
