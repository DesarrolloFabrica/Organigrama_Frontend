/**
 * Validación y resolución segura del streamUrl de presentación.
 * No registra la URL (contiene ticket).
 */

const STREAM_PATH_RE =
  /^\/api\/org-chart\/person\/[^/]+\/video\/stream\?ticket=.+/i;

export class UnsafePersonVideoStreamUrlError extends Error {
  constructor(message = "streamUrl de video no permitido") {
    super(message);
    this.name = "UnsafePersonVideoStreamUrlError";
  }
}

/**
 * Acepta solo paths relativos del API de stream con ticket.
 * Rechaza URLs absolutas externas, javascript:, data:, etc.
 */
export function assertSafePersonVideoStreamPath(streamUrl: string): string {
  const raw = String(streamUrl ?? "").trim();
  if (!raw) {
    throw new UnsafePersonVideoStreamUrlError("streamUrl vacío");
  }
  const lower = raw.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("vbscript:")
  ) {
    throw new UnsafePersonVideoStreamUrlError("esquema inseguro");
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) {
    throw new UnsafePersonVideoStreamUrlError("URL absoluta no permitida");
  }
  if (raw.includes("..") || /drive\.google|webViewLink/i.test(raw)) {
    throw new UnsafePersonVideoStreamUrlError("ruta no permitida");
  }
  if (!STREAM_PATH_RE.test(raw)) {
    throw new UnsafePersonVideoStreamUrlError("formato de streamUrl inválido");
  }
  return raw;
}

/** Une base API + path relativo validado (para atributo src del <video>). */
export function resolvePersonVideoStreamUrl(
  streamUrl: string,
  apiBaseUrl: string,
): string {
  const path = assertSafePersonVideoStreamPath(streamUrl);
  const base = apiBaseUrl.replace(/\/$/, "");
  return `${base}${path}`;
}

/** true si el ticket sigue vigente más allá del margen (segundos). */
export function isPersonVideoTicketFresh(
  expiresAtIso: string,
  skewSeconds = 15,
  nowMs: number = Date.now(),
): boolean {
  const exp = Date.parse(expiresAtIso);
  if (!Number.isFinite(exp)) return false;
  return exp - nowMs > skewSeconds * 1000;
}
