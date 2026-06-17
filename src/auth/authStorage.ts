import type { AuthUser } from './types'

const TOKEN_KEY = 'organigrama.accessToken'
const USER_KEY = 'organigrama.authUser'

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getAuthUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser
    // Compatibilidad hacia atrás: sesiones previas al sistema de permisos no
    // incluyen el campo permissions. Se normaliza a array vacío.
    if (!Array.isArray(parsed.permissions)) {
      parsed.permissions = []
    }
    return parsed
  } catch {
    return null
  }
}

export function saveAuthSession(accessToken: string, user: AuthUser): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}

/**
 * Comprueba si el usuario autenticado tiene el permiso técnico indicado.
 * Solo para decisiones de UI — la seguridad real la resuelve el backend.
 */
export function hasPermission(code: string): boolean {
  return getAuthUser()?.permissions?.includes(code) ?? false
}

/** Devuelve true si el usuario tiene el permiso ORG_ADMIN. */
export function isOrgAdmin(): boolean {
  return hasPermission('ORG_ADMIN')
}

/** Devuelve true si el usuario tiene acceso total de lectura al organigrama. */
export function hasOrgReadAll(): boolean {
  return hasPermission('ORG_READ_ALL')
}
