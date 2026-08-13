import type {
  CompetencyPeopleSearchQuery,
  CompetencyPeopleSearchResponse,
} from "../types/competencyPeopleSearch.types";

type Props = {
  query: CompetencyPeopleSearchQuery;
  selectedCriteria?: CompetencyPeopleSearchResponse["selectedCriteria"];
  resultCount: number | null;
  onRemoveDomain: () => void;
  onRemoveSpecialty: () => void;
  onRemoveSkill: (code: string) => void;
  onClear: () => void;
};

export function ActiveQueryBar({
  query,
  selectedCriteria,
  resultCount,
  onRemoveDomain,
  onRemoveSpecialty,
  onRemoveSkill,
  onClear,
}: Props) {
  if (!query.domainCode) {
    return (
      <section
        aria-label="Consulta activa"
        className="rounded-xl border border-dashed border-slate-600/50 bg-[#06111f]/40 px-3.5 py-3"
      >
        <p className="text-sm font-medium text-slate-300">
          Consulta sin criterios
        </p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Seleccione un dominio para comenzar la búsqueda progresiva.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Consulta activa"
      className="rounded-xl border border-cyan-400/15 bg-[#06111f]/55 px-3.5 py-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-medium text-slate-200">
              Consulta activa
            </p>
            {resultCount !== null ? (
              <p className="text-[11px] text-cyan-300/80">
                {resultCount === 0
                  ? "Sin personas encontradas"
                  : `${resultCount} persona${resultCount === 1 ? "" : "s"}`}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <CriterionChip
              kind="Dominio"
              label={selectedCriteria?.domain?.label ?? query.domainCode}
              onRemove={onRemoveDomain}
            />
            {query.specialtyCode ? (
              <CriterionChip
                kind="Especialidad"
                label={
                  selectedCriteria?.specialty?.label ?? query.specialtyCode
                }
                onRemove={onRemoveSpecialty}
              />
            ) : null}
            {query.skillCodes.map((code) => (
              <CriterionChip
                key={code}
                kind="Skill"
                label={
                  selectedCriteria?.skills.find((skill) => skill.code === code)
                    ?.label ?? code
                }
                onRemove={() => onRemoveSkill(code)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-lg border border-slate-600/50 px-2.5 py-1.5 text-[12px] text-slate-300 outline-none transition-colors hover:border-slate-400/50 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        >
          Limpiar consulta
        </button>
      </div>
    </section>
  );
}

function CriterionChip({
  kind,
  label,
  onRemove,
}: {
  kind: "Dominio" | "Especialidad" | "Skill";
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-950/35 py-1 pl-2 pr-1 text-[12px] text-cyan-50">
      <span className="min-w-0 truncate">
        <span className="mr-1 text-[10px] uppercase tracking-wide text-slate-500">
          {kind}
        </span>
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-0.5 text-slate-400 outline-none hover:bg-slate-800/80 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        aria-label={`Quitar ${kind.toLowerCase()} ${label}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}
