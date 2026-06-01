// Importamos el tipo del nodo del organigrama.
import { type OrgNode } from "../types";

// Importamos la función real que consulta el root al backend.
import { fetchOrgChartRoot } from "./orgChartService";

/** Marca que el árbol en memoria debe ignorarse tras persistir foto de perfil. */
export const ORG_CHART_PHOTO_REVISION_KEY = "organigrama.orgChartPhotoRevision";

// Guardamos la petición en memoria para evitar repetir el mismo fetch.
// Esto permite que /loading y /org compartan la misma carga.
let orgChartRootRequest: Promise<OrgNode> | null = null;

export function bumpOrgChartPhotoRevision(): void {
  sessionStorage.setItem(ORG_CHART_PHOTO_REVISION_KEY, String(Date.now()));
}

function consumeOrgChartPhotoRevision(): boolean {
  const revision = sessionStorage.getItem(ORG_CHART_PHOTO_REVISION_KEY);
  if (!revision) {
    return false;
  }
  sessionStorage.removeItem(ORG_CHART_PHOTO_REVISION_KEY);
  return true;
}

// Función compartida para cargar el root una sola vez.
// Si ya hay una petición en curso, reutiliza esa misma promesa.
// Si falla, limpia la referencia para permitir reintentar.
export function getOrgChartRootOnce(): Promise<OrgNode> {
  if (consumeOrgChartPhotoRevision()) {
    orgChartRootRequest = null;
  }

  if (!orgChartRootRequest) {
    orgChartRootRequest = fetchOrgChartRoot().catch((err: unknown) => {
      orgChartRootRequest = null;
      throw err;
    });
  }

  return orgChartRootRequest;
}

/** Tras persistir foto de perfil: fuerza recarga del árbol en /loading y /org. */
export function clearOrgChartRootCache(): void {
  orgChartRootRequest = null;
  bumpOrgChartPhotoRevision();
}
