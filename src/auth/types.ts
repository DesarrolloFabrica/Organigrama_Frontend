export type AuthUser = {
  personId: string
  fullName: string
  eduEmail: string | null
  googleEmail: string
  pictureUrl: string | null
}

export type GoogleLoginResult = {
  accessToken: string
  user: AuthUser
}
