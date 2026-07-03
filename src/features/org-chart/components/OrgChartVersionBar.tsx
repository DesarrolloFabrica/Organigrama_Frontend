import { useOrgChartVersion } from "../context/OrgChartVersionContext";
import { orgChartVersionSelectorLabel } from "../utils/filterVisibleOrgChartVersions";

export function OrgChartVersionBar() {
  const {
    canVersion,
    selectedVersionId,
    setSelectedVersionId,
    versions,
    isLoadingVersions,
  } = useOrgChartVersion();

  if (!canVersion) return null;

  const selectedVersion = versions.find(
    (version) => version.id === selectedVersionId,
  );

  return (
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
    </div>
  );
}
