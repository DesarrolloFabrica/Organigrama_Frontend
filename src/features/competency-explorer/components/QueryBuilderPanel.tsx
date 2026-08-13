import type {
  CompetencyPeopleSearchFacet,
  CompetencyPeopleSearchQuery,
  CompetencyPeopleSearchResponse,
} from "../types/competencyPeopleSearch.types";

type Props = {
  query: CompetencyPeopleSearchQuery;
  selectedCriteria?: CompetencyPeopleSearchResponse["selectedCriteria"];
  facets: CompetencyPeopleSearchResponse["facets"];
  isLoading: boolean;
  onSelectDomain: (code: string | null) => void;
  onSelectSpecialty: (code: string | null) => void;
  onAddSkill: (code: string) => void;
};

export function QueryBuilderPanel({
  query,
  selectedCriteria,
  facets,
  isLoading,
  onSelectDomain,
  onSelectSpecialty,
  onAddSkill,
}: Props) {
  return (
    <aside
      aria-label="Constructor de consulta"
      className="flex h-full min-h-0 flex-col rounded-xl border border-cyan-400/12 bg-[#06111f]/55"
    >
      <div className="border-b border-slate-700/50 px-3.5 py-3">
        <h2 className="text-sm font-medium text-slate-100">Consulta</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Dominio → especialidad → skills
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
        <FacetStep
          number="1"
          title="Dominio"
          selectedLabel={
            selectedCriteria?.domain?.label ?? query.domainCode ?? undefined
          }
          changeLabel="Cambiar dominio"
          onChange={() => onSelectDomain(null)}
          options={!query.domainCode ? facets.domains : []}
          onSelect={onSelectDomain}
          emptyLabel="No hay dominios publicados en su universo visible."
          isLoading={isLoading && !query.domainCode}
        />

        <FacetStep
          number="2"
          title="Especialidad"
          disabled={!query.domainCode}
          disabledLabel="Seleccione primero un dominio."
          selectedLabel={
            selectedCriteria?.specialty?.label ??
            query.specialtyCode ??
            undefined
          }
          changeLabel="Cambiar especialidad"
          onChange={() => onSelectSpecialty(null)}
          options={
            query.domainCode && !query.specialtyCode ? facets.specialties : []
          }
          onSelect={onSelectSpecialty}
          emptyLabel="Este dominio no tiene especialidades publicadas."
          isLoading={
            isLoading && Boolean(query.domainCode) && !query.specialtyCode
          }
        />

        <FacetStep
          number="3"
          title="Skills"
          disabled={!query.specialtyCode}
          disabledLabel="Seleccione primero una especialidad."
          options={query.specialtyCode ? facets.skills : []}
          onSelect={onAddSkill}
          emptyLabel={
            query.skillCodes.length > 0
              ? "No hay más skills que mantengan coincidencias."
              : "Esta especialidad no tiene skills publicadas."
          }
          isLoading={isLoading && Boolean(query.specialtyCode)}
        />
      </div>
    </aside>
  );
}

function FacetStep({
  number,
  title,
  disabled = false,
  disabledLabel,
  selectedLabel,
  changeLabel,
  onChange,
  options,
  onSelect,
  emptyLabel,
  isLoading,
}: {
  number: string;
  title: string;
  disabled?: boolean;
  disabledLabel?: string;
  selectedLabel?: string;
  changeLabel?: string;
  onChange?: () => void;
  options: CompetencyPeopleSearchFacet[];
  onSelect: (code: string) => void;
  emptyLabel: string;
  isLoading: boolean;
}) {
  return (
    <section aria-labelledby={`competency-step-${number}`}>
      <h3
        id={`competency-step-${number}`}
        className={`text-[11px] font-medium uppercase tracking-[0.12em] ${
          disabled ? "text-slate-600" : "text-slate-400"
        }`}
      >
        {number}. {title}
      </h3>

      {disabled ? (
        <StepMessage>{disabledLabel}</StepMessage>
      ) : selectedLabel ? (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-cyan-300/35 bg-cyan-950/35 px-2.5 py-2">
          <span className="min-w-0 truncate text-[13px] text-cyan-50">
            {selectedLabel}
          </span>
          {onChange ? (
            <button
              type="button"
              onClick={onChange}
              className="shrink-0 text-[11px] text-cyan-300/80 underline underline-offset-2 hover:text-cyan-100"
            >
              {changeLabel}
            </button>
          ) : null}
        </div>
      ) : isLoading ? (
        <div
          className="mt-2 space-y-1.5"
          aria-label={`Cargando ${title}`}
          aria-busy
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-9 animate-pulse rounded-lg bg-slate-800/65"
            />
          ))}
        </div>
      ) : options.length === 0 ? (
        <StepMessage>{emptyLabel}</StepMessage>
      ) : (
        <ul className="mt-2.5 space-y-1.5" aria-label={title}>
          {options.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                onClick={() => onSelect(option.code)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[13px] text-slate-300 outline-none transition-colors hover:border-cyan-400/25 hover:bg-cyan-950/30 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                <span className="leading-snug">{option.label}</span>
                <span className="shrink-0 tabular-nums text-[10px] text-slate-500">
                  {option.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StepMessage({ children }: { children?: string }) {
  return (
    <div className="mt-2 rounded-lg border border-dashed border-slate-700/70 bg-slate-950/30 px-3 py-3">
      <p className="text-[12px] leading-relaxed text-slate-500">{children}</p>
    </div>
  );
}
