import type { AuthUser } from '../../../auth/types';

function getDirectoryExportEmailsSet(): Set<string> {
  const raw = import.meta.env.VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS?.trim();
  if (!raw) return new Set();

  return new Set(
    raw
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Botones de descarga (Excel y HTML) del organigrama activo: solo correos en
 * VITE_ORG_CHART_DIRECTORY_EXPORT_EMAILS (debe coincidir con
 * ORG_CHART_DIRECTORY_EXPORT_EMAILS del backend, que es quien autoriza).
 *
 * Deshabilitado por defecto: sin la variable nadie ve los botones.
 */
export function canDownloadOrgDirectory(
  user: Pick<AuthUser, 'eduEmail'> | null | undefined,
): boolean {
  if (!user?.eduEmail) return false;
  return getDirectoryExportEmailsSet().has(user.eduEmail.trim().toLowerCase());
}
