import { useOrgChartVersion } from "../context/OrgChartVersionContext";
import { orgChartVersionSelectorLabel } from "../utils/filterVisibleOrgChartVersions";

export function OrgChartVersionBar() {
  const {
    canVersion,
    selectedVersionId,
    setSelectedVersionId,
    selectedScopeVersionId,
    setSelectedScopeVersionId,
    versions,
    visibleScopedVersionGroups,
    isLoadingVersions,
  } = useOrgChartVersion();

  if (!canVersion) return null;

  const selectedVersion = versions.find(
    (version) => version.id === selectedVersionId,
  );

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-cyan-300/10 bg-[#020617]/70 px-3 py-2 text-xs sm:px-4 lg:px-6"
      aria-label="Versionamiento del organigrama"
    >
      <label className="flex flex-wrap items-center gap-2">
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
      </label>
      {visibleScopedVersionGroups.map((group) => {
        const selectedInGroup =
          selectedScopeVersionId === "none" ||
          group.versions.some((version) => version.id === selectedScopeVersionId)
            ? selectedScopeVersionId
            : "";
        return (
          <div
            key={group.scopeCode}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 border-l border-cyan-300/20 pl-4"
            aria-label={`Versionamiento de ${group.scopeLabel}`}
          >
            <label className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">
                Versión de {group.scopeLabel}:
              </span>
              <select
                className="max-w-[min(100%,18rem)] rounded-md border border-cyan-300/20 bg-slate-950/80 px-2 py-1 text-slate-100"
                value={selectedInGroup ?? ""}
                disabled={isLoadingVersions}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === "none") {
                    setSelectedScopeVersionId("none");
                    return;
                  }
                  const nextId = Number(next);
                  if (!Number.isNaN(nextId)) {
                    setSelectedScopeVersionId(nextId);
                  }
                }}
              >
                <option value="none">Según versión global</option>
                {group.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {orgChartVersionSelectorLabel(version)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );
      })}
    </div>
  );
}
