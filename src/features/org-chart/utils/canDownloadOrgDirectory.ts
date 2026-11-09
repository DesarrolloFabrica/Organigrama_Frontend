import type { AuthUser } from '../../../auth/types';

const DEFAULT_DIRECTORY_EXPORT_EMAILS = [
  'desarrollofabrica@cun.edu.co',
  'lorena_gomez@cun.edu.co',
  'maria_ballen@cun.edu.co',
  'raul_valencia@cun.edu.co',
  'sara_murillofo@cun.edu.co',
] as const;

function getDirectoryExportEmailsSet(): Set<string> {
  const raw = import.meta.env.VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS?.trim();
  const source =
    raw && raw.length > 0 ? raw : DEFAULT_DIRECTORY_EXPORT_EMAILS.join(',');

  return new Set(
    source
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Descarga del organigrama activo: solo correos en
 * VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS (debe coincidir con el backend).
 */
export function canDownloadOrgDirectory(
  user: Pick<AuthUser, 'eduEmail'> | null | undefined,
): boolean {
  if (!user?.eduEmail) return false;
  return getDirectoryExportEmailsSet().has(user.eduEmail.trim().toLowerCase());
}
