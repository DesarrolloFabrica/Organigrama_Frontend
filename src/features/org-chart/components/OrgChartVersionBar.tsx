import { useState, type FormEvent } from "react";
import { createOrgChartSnapshot } from "../services/orgChartService";
import { useOrgChartVersion } from "../context/OrgChartVersionContext";
import { orgChartVersionSelectorLabel } from "../utils/filterVisibleOrgChartVersions";

type SnapshotModalProps = {
  open: boolean;
  sourceVersionId: number | undefined;
  onClose: () => void;
  onCreated: () => void;
};

function SnapshotModal({
  open,
  sourceVersionId,
  onClose,
  onCreated,
}: SnapshotModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sourceVersionId) {
      setError("Seleccione una versión fuente.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createOrgChartSnapshot({
        sourceVersionId,
        code: code.trim(),
        name: name.trim(),
        periodLabel: periodLabel.trim() || undefined,
        description: description.trim() || undefined,
      });
      setCode("");
      setName("");
      setPeriodLabel("");
      setDescription("");
      onCreated();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear el snapshot.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-cyan-300/20 bg-[#06111f] p-5 shadow-2xl"
        role="dialog"
        aria-labelledby="org-version-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="org-version-modal-title"
          className="text-sm font-semibold text-slate-100"
        >
          Crear snapshot del organigrama
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-xs text-slate-300">
            Código
            <input
              className="mt-1 w-full rounded-md border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              maxLength={100}
              placeholder="2026-06-cambio-plantilla"
            />
          </label>
          <label className="block text-xs text-slate-300">
            Nombre
            <input
              className="mt-1 w-full rounded-md border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={255}
              placeholder="Organigrama Junio 2026"
            />
          </label>
          <label className="block text-xs text-slate-300">
            Periodo
            <input
              className="mt-1 w-full rounded-md border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
              value={periodLabel}
              onChange={(event) => setPeriodLabel(event.target.value)}
              maxLength={255}
              placeholder="Junio 2026"
            />
          </label>
          <label className="block text-xs text-slate-300">
            Descripción
            <textarea
              className="mt-1 w-full rounded-md border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Snapshot antes de cambios significativos"
            />
          </label>
          {error ? (
            <p className="text-xs text-rose-300">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md border border-slate-600/60 px-3 py-1.5 text-xs text-slate-200"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando…" : "Crear snapshot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function OrgChartVersionBar() {
  const {
    canVersion,
    selectedVersionId,
    setSelectedVersionId,
    versions,
    isLoadingVersions,
    refetchVersions,
    showAdvancedHistorical,
    setShowAdvancedHistorical,
  } = useOrgChartVersion();
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  if (!canVersion) return null;

  const selectedVersion = versions.find(
    (version) => version.id === selectedVersionId,
  );

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 border-b border-cyan-300/10 bg-[#020617]/70 px-3 py-2 text-xs sm:px-4 lg:px-6"
        aria-label="Versionamiento del organigrama"
      >
        <span className="text-slate-400">Versión del organigrama:</span>
        <select
          className="max-w-[min(100%,18rem)] rounded-md border border-cyan-300/20 bg-slate-950/80 px-2 py-1 text-slate-100"
          value={selectedVersionId ?? ""}
          disabled={isLoadingVersions || versions.length === 0}
          onChange={(event) => {
            const nextId = Number(event.target.value);
            if (!Number.isNaN(nextId)) {
              setSelectedVersionId(nextId);
            }
          }}
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {orgChartVersionSelectorLabel(version)}
            </option>
          ))}
        </select>
        {selectedVersion?.periodLabel ? (
          <span className="text-slate-500">{selectedVersion.periodLabel}</span>
        ) : null}
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-500">
          <input
            type="checkbox"
            className="size-3 rounded border-slate-600 bg-slate-950"
            checked={showAdvancedHistorical}
            onChange={(event) => setShowAdvancedHistorical(event.target.checked)}
          />
          Histórico avanzado
        </label>
        <button
          type="button"
          className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-100 hover:bg-cyan-500/20"
          onClick={() => setSnapshotOpen(true)}
          disabled={!selectedVersionId}
        >
          Crear snapshot
        </button>
      </div>

      <SnapshotModal
        open={snapshotOpen}
        sourceVersionId={selectedVersionId}
        onClose={() => setSnapshotOpen(false)}
        onCreated={() => refetchVersions()}
      />
    </>
  );
}
