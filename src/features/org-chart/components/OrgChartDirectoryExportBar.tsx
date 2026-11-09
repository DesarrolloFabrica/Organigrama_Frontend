import { useState } from "react";
import { getAuthUser } from "../../../auth/authStorage";
import { downloadOrgChartDirectoryExcel } from "../services/orgChartService";
import { canDownloadOrgDirectory } from "../utils/canDownloadOrgDirectory";

export function OrgChartDirectoryExportBar() {
  const user = getAuthUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canDownloadOrgDirectory(user)) return null;

  const handleDownload = async () => {
    setError(null);
    setBusy(true);
    try {
      await downloadOrgChartDirectoryExcel();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el organigrama activo.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-cyan-300/10 bg-[#020617]/70 px-3 py-2 text-xs sm:px-4 lg:px-6"
      aria-label="Descarga del organigrama activo"
    >
      <span className="font-medium text-slate-200">Directorio activo</span>
      <span className="text-slate-500">
        Excel con área, jefe, contacto y emergencia (hasta líderes docentes)
      </span>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
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
        {busy ? "Generando…" : "Descargar Excel"}
      </button>
      {error ? (
        <span role="alert" className="text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
  );
}
