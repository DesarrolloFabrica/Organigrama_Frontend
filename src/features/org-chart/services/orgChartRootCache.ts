// Importamos el tipo del nodo del organigrama.
import { type OrgNode } from "../types";

// Importamos la función real que consulta el root al backend.
import { fetchOrgChartRoot } from "./orgChartService";

// Guardamos la petición en memoria para evitar repetir el mismo fetch.
// Esto permite que /loading y /org compartan la misma carga.
let orgChartRootRequest: Promise<OrgNode> | null = null;

// Función compartida para cargar el root una sola vez.
// Si ya hay una petición en curso, reutiliza esa misma promesa.
// Si falla, limpia la referencia para permitir reintentar.
export function getOrgChartRootOnce(): Promise<OrgNode> {
  if (!orgChartRootRequest) {
    orgChartRootRequest = fetchOrgChartRoot().catch((err: unknown) => {
      orgChartRootRequest = null;
      throw err;
    });
  }

  return orgChartRootRequest;
}