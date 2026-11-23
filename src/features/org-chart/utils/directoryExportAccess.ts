import type { AuthUser } from '../../../auth/types'

/**
 * Permisos que habilitan cada formato de exportación del organigrama activo.
 * Deben coincidir con ORG_PERMISSION del backend, que es quien autoriza
 * (consultando core.person_permission en cada descarga).
 */
export const DIRECTORY_EXPORT_PERMISSION = {
  html: 'ORG_DIRECTORY_EXPORT_HTML',
  xls: 'ORG_DIRECTORY_EXPORT_XLS',
} as const

export type DirectoryExportFormat = keyof typeof DIRECTORY_EXPORT_PERMISSION
export type DirectoryExportAccess = Record<DirectoryExportFormat, boolean>

export const NO_DIRECTORY_EXPORT_ACCESS: DirectoryExportAccess = {
  html: false,
  xls: false,
}

/**
 * Botones a mostrar según los permisos de la sesión. Solo decisión de UI:
 * ORG_ADMIN / ORG_READ_ALL no habilitan nada aquí.
 */
export function getDirectoryExportAccess(
  user: Pick<AuthUser, 'permissions'> | null | undefined,
): DirectoryExportAccess {
  const permissions = user?.permissions ?? []
  return {
    html: permissions.includes(DIRECTORY_EXPORT_PERMISSION.html),
    xls: permissions.includes(DIRECTORY_EXPORT_PERMISSION.xls),
  }
}

export function hasAnyDirectoryExport(access: DirectoryExportAccess): boolean {
  return access.html || access.xls
}

/**
 * Devuelve `permissions` con los dos códigos de exportación ajustados a
 * `access`, sin tocar ningún otro permiso.
 */
export function withDirectoryExportAccess(
  permissions: readonly string[],
  access: DirectoryExportAccess,
): string[] {
  const exportCodes = Object.values(DIRECTORY_EXPORT_PERMISSION) as string[]
  const others = permissions.filter((code) => !exportCodes.includes(code))
  const granted = (Object.keys(access) as DirectoryExportFormat[])
    .filter((format) => access[format])
    .map((format) => DIRECTORY_EXPORT_PERMISSION[format])
  return [...others, ...granted]
}

/**
 * Tras un 403 (permiso revocado con JWT vigente): consulta los permisos
 * vigentes al backend. Si esa consulta falla, al menos se retira el formato
 * rechazado para no volver a ofrecerlo.
 */
export async function resyncDirectoryExportAccess(
  deniedFormat: DirectoryExportFormat,
  current: DirectoryExportAccess,
  fetchCurrent: () => Promise<DirectoryExportAccess>,
): Promise<DirectoryExportAccess> {
  try {
    const fresh = await fetchCurrent()
    return { html: fresh.html === true, xls: fresh.xls === true }
  } catch {
    return { ...current, [deniedFormat]: false }
  }
}
