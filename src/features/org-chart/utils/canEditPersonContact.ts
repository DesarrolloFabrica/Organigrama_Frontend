import { getAuthUser, isOrgAdmin } from '../../../auth/authStorage'

/**
 * PersonContactEditor: misma regla que la versión desplegada (copia-main):
 * la propia persona o ORG_ADMIN. Es solo decisión de UI; el backend
 * (PATCH /api/profile/person/:personId) vuelve a validar.
 */
export function canEditPersonContact(
  personId: string | null | undefined,
): boolean {
  return (
    Boolean(personId) &&
    (getAuthUser()?.personId === personId || isOrgAdmin())
  )
}
