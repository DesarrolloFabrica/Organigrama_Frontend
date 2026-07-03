import type { AuthUser } from '../../../auth/types';

const DEFAULT_VERSION_ADMIN_EMAILS = [
  'desarrollofabrica@cun.edu.co',
  'iron_fuentes@cun.edu.co',
  'raul_valencia@cun.edu.co',
  'haider_bello@cun.edu.co',
] as const;

function getVersionAdminEmailsSet(): Set<string> {
  const raw = import.meta.env.VITE_ORG_CHART_VERSION_ADMIN_EMAILS?.trim();
  const source =
    raw && raw.length > 0 ? raw : DEFAULT_VERSION_ADMIN_EMAILS.join(',');

  return new Set(
    source
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Versionamiento del organigrama: solo correos en VITE_ORG_CHART_VERSION_ADMIN_EMAILS.
 * No usa ORG_READ_ALL ni permisos admin genéricos.
 */
export function canUseOrgVersioning(
  user: Pick<AuthUser, 'personId' | 'eduEmail'> | null | undefined,
): boolean {
  if (!user?.eduEmail) return false;
  return getVersionAdminEmailsSet().has(user.eduEmail.trim().toLowerCase());
}
