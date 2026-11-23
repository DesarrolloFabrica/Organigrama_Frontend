import { useState } from "react";
import {
  getAuthUser,
  updateAuthUserPermissions,
} from "../../../auth/authStorage";
import {
  DirectoryExportForbiddenError,
  downloadOrgChartDirectoryExcel,
  downloadOrgChartHtml,
  fetchDirectoryExportPermissions,
} from "../services/orgChartService";
import {
  getDirectoryExportAccess,
  hasAnyDirectoryExport,
  resyncDirectoryExportAccess,
  withDirectoryExportAccess,
  type DirectoryExportAccess,
  type DirectoryExportFormat,
} from "../utils/directoryExportAccess";

const FORMAT_LABEL: Record<DirectoryExportFormat, string> = {
  html: "el HTML",
  xls: "el Excel",
};

/**
 * Descargas del organigrama activo. Cada botón aparece solo si la sesión
 * tiene su permiso (ORG_DIRECTORY_EXPORT_HTML / ORG_DIRECTORY_EXPORT_XLS).
 * La autorización real la hace el backend en cada descarga: si responde 403
 * (permiso revocado con JWT vigente) se consultan los permisos vigentes y se
 * actualiza la sesión guardada.
 */
export function OrgChartDirectoryExportBar() {
  const [access, setAccess] = useState<DirectoryExportAccess>(() =>
    getDirectoryExportAccess(getAuthUser()),
  );
  const [busy, setBusy] = useState<DirectoryExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sin permisos no hay acciones; el mensaje de un rechazo reciente sí se
  // mantiene visible para explicar por qué desaparecieron los botones.
  if (!hasAnyDirectoryExport(access) && !error) return null;

  const handleForbidden = async (format: DirectoryExportFormat) => {
    const next = await resyncDirectoryExportAccess(
      format,
      access,
      fetchDirectoryExportPermissions,
    );
    setAccess(next);
    const user = getAuthUser();
    if (user) {
      updateAuthUserPermissions(
        withDirectoryExportAccess(user.permissions, next),
      );
    }
    setError(
      `Acceso denegado: ya no tienes permiso para descargar ${FORMAT_LABEL[format]}.`,
    );
  };

  const runDownload = async (
    format: DirectoryExportFormat,
    action: () => Promise<void>,
    fallback: string,
  ) => {
    setError(null);
    setBusy(format);
    try {
      await action();
    } catch (err) {
      if (err instanceof DirectoryExportForbiddenError) {
        await handleForbidden(err.format);
      } else {
        setError(err instanceof Error ? err.message : fallback);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-cyan-300/10 bg-[#020617]/70 px-3 py-2 text-xs sm:px-4 lg:px-6"
      aria-label="Descarga del organigrama activo"
    >
      <span className="font-medium text-slate-200">Directorio activo</span>
      <span className="text-slate-500">
        Excel y HTML del organigrama
      </span>
      {access.xls ? (
        <button
          type="button"
          onClick={() =>
            void runDownload(
              "xls",
              downloadOrgChartDirectoryExcel,
              "No se pudo descargar el Excel.",
            )
          }
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-950/50 px-2.5 py-1 font-medium text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-900/40 disabled:cursor-wait disabled:opacity-60"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 15.5h12"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {busy === "xls" ? "Generando…" : "Descargar Excel"}
        </button>
      ) : null}
      {access.html ? (
        <button
          type="button"
          onClick={() =>
            void runDownload(
              "html",
              downloadOrgChartHtml,
              "No se pudo descargar el HTML.",
            )
          }
          disabled={busy !== null}
          className="inline-flex items-center rounded-md border border-cyan-300/25 bg-cyan-950/50 px-2.5 py-1 font-medium text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-900/40 disabled:cursor-wait disabled:opacity-60"
        >
          {busy === "html" ? "Generando…" : "Descargar HTML"}
        </button>
      ) : null}
      {error ? (
        <span role="alert" className="text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
  );
}
