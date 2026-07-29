/**
 * Narrativa de trayectoria: solo tensiona cargo vs especialidad dentro de
 * Diseño Visual. No usa el cargo organizacional como identidad MC1 en otros
 * dominios (p. ej. Software), ni inventa “trayectoria hacia Interfaces”.
 *
 * No hardcodea nombres de persona. No altera scores PA2.
 */

const UI_ROLE_RE = /\b(ux|ui|interfaz|interfaces)\b/i

export function isInterfaceOrientedRole(
  roleName: string | null | undefined,
): boolean {
  return Boolean(roleName && UI_ROLE_RE.test(roleName))
}

function isVisualDesignDomain(
  domainCode: string | null | undefined,
  domainName: string | null | undefined,
): boolean {
  const code = (domainCode ?? '').trim().toUpperCase()
  if (code === 'VISUAL_DESIGN' || code.startsWith('VISUAL_')) return true
  const name = (domainName ?? '').trim().toLowerCase()
  return name.includes('diseño visual') || name.includes('diseno visual')
}

export function buildTrajectoryNarrative(params: {
  roleName: string | null | undefined
  domainName: string | null | undefined
  domainCode?: string | null | undefined
  primarySpecialtyName: string | null | undefined
  primarySpecialtyCode: string | null | undefined
}): string | null {
  const role = params.roleName?.trim()
  const domain = params.domainName?.trim()
  const specialty = params.primarySpecialtyName?.trim()
  if (!role || !domain || !specialty) return null

  const roleIsUi = isInterfaceOrientedRole(role)
  const primaryIsUi = (params.primarySpecialtyCode ?? '')
    .toUpperCase()
    .includes('VISUAL_UI')
  const domainIsVisual = isVisualDesignDomain(
    params.domainCode,
    params.domainName,
  )

  // Cargo UX/UI + evidencia no-UI: solo narrar dentro de Diseño Visual.
  // En Software/AV el cargo Core no redefine el dominio MC1.
  if (roleIsUi && !primaryIsUi) {
    if (!domainIsVisual) return null
    return (
      `Su evidencia profesional refleja mayor fortaleza en ${domain}, ` +
      `especialmente en ${specialty}. Actualmente se desempeña como ${role}, ` +
      `lo que representa una trayectoria reciente hacia el Diseño de Interfaces.`
    )
  }

  if (!roleIsUi && primaryIsUi) {
    if (!domainIsVisual) return null
    return (
      `Su evidencia profesional destaca en ${specialty} dentro de ${domain}. ` +
      `Su cargo actual es ${role}.`
    )
  }

  return null
}
