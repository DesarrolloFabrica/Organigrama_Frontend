export type AuthUser = {
  personId: string
  fullName: string
  eduEmail: string | null
  googleEmail: string
  pictureUrl: string | null
  /**
   * Permisos técnicos de aplicación.
   * Solo para decisiones de UI — la autorización real vive en el backend.
   * Si los permisos cambian en BD, el usuario debe cerrar sesión y reiniciar.
   */
  permissions: string[]
}

export type GoogleLoginResult = {
  accessToken: string
  user: AuthUser
}
