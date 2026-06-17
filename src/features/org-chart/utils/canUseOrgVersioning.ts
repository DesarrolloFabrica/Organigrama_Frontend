import type { AuthUser } from '../../../auth/types';

const VERSIONING_PERSON_ID = '1229';
const VERSIONING_EDU_EMAIL = 'desarrollofabrica@cun.edu.co';

/**
 * Versionamiento del organigrama: solo personId=1229 y desarrollofabrica@cun.edu.co.
 * No usa ORG_READ_ALL ni permisos admin genéricos.
 */
export function canUseOrgVersioning(
  user: Pick<AuthUser, 'personId' | 'eduEmail'> | null | undefined,
): boolean {
  if (!user) return false;
  return (
    user.personId === VERSIONING_PERSON_ID &&
    user.eduEmail?.toLowerCase() === VERSIONING_EDU_EMAIL
  );
}
