import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PersonDetailPanel } from "../../org-chart/components/PersonDetailPanel";
import type { ProfileModuleCode } from "../../org-chart/components/profile-modules/profile-module.types";
import { OrgChartVersionBar } from "../../org-chart/components/OrgChartVersionBar";
import { entityDetailOverlayWidthClass } from "../../org-chart/utils/personPresentationRules";
import { ActiveQueryBar } from "../components/ActiveQueryBar";
import { AiProjectCandidatePreview } from "../components/AiProjectCandidatePreview";
import { CompetencyPeopleResults } from "../components/CompetencyPeopleResults";
import { ExplorerHeader } from "../components/ExplorerHeader";
import { QueryBuilderPanel } from "../components/QueryBuilderPanel";
import { useCompetencyPeopleSearch } from "../hooks/useCompetencyPeopleSearch";
import type { CompetencyPeopleSearchQuery } from "../types/competencyPeopleSearch.types";
import {
  broadenCompetencyPeopleQuery,
  competencyPeopleQuerySignature,
  EMPTY_COMPETENCY_PEOPLE_QUERY,
  readCompetencyPeopleQuery,
  sameCompetencyPeopleQuery,
  selectCompetencyDomain,
  selectCompetencySpecialty,
  shouldCanonicalizeCompetencyPeopleQuery,
  toggleCompetencySkill,
  writeCompetencyPeopleQuery,
} from "../utils/competencyPeopleSearchState";

export function CompetencyExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(
    () => readCompetencyPeopleQuery(searchParams),
    [searchParams],
  );
  const querySignature = competencyPeopleQuerySignature(query);
  const [paginationState, setPaginationState] = useState({
    querySignature,
    page: 1,
  });
  const page =
    paginationState.querySignature === querySignature
      ? paginationState.page
      : 1;
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [activeDetailModule, setActiveDetailModule] =
    useState<ProfileModuleCode | null>(null);
  const search = useCompetencyPeopleSearch(query, page);

  useEffect(() => {
    if (!search.data) return;
    if (!shouldCanonicalizeCompetencyPeopleQuery(query, search.data.query))
      return;
    setSearchParams(
      writeCompetencyPeopleQuery(searchParams, search.data.query),
      { replace: true },
    );
  }, [query, search.data, searchParams, setSearchParams]);

  const displayData =
    search.data && sameCompetencyPeopleQuery(query, search.data.query)
      ? search.data
      : undefined;

  function updateQuery(next: CompetencyPeopleSearchQuery) {
    setPaginationState({
      querySignature: competencyPeopleQuerySignature(next),
      page: 1,
    });
    setSearchParams(writeCompetencyPeopleQuery(searchParams, next));
  }

  function broadenQuery() {
    updateQuery(broadenCompetencyPeopleQuery(query));
  }

  const isInitialPending = search.isPending && !search.data;
  const detailOpen = Boolean(selectedPersonId);

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-1 flex-col overflow-hidden">
      <OrgChartVersionBar />
      <main className="min-h-0 flex-1 overflow-y-scroll overscroll-y-contain [scrollbar-gutter:stable]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <ExplorerHeader />

          <AiProjectCandidatePreview />

          <ActiveQueryBar
            query={query}
            selectedCriteria={displayData?.selectedCriteria}
            resultCount={query.domainCode ? (displayData?.total ?? null) : null}
            onRemoveDomain={() => updateQuery(selectCompetencyDomain(null))}
            onRemoveSpecialty={() =>
              updateQuery(selectCompetencySpecialty(query, null))
            }
            onRemoveSkill={(code) =>
              updateQuery(toggleCompetencySkill(query, code))
            }
            onClear={() => updateQuery(EMPTY_COMPETENCY_PEOPLE_QUERY)}
          />

          {search.data?.warnings.length ? (
            <p role="status" className="text-xs text-amber-200/80">
              Se retiraron criterios obsoletos o incompatibles de la URL.
            </p>
          ) : null}

          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:items-start">
            <div className="min-h-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:[scrollbar-gutter:stable]">
              <QueryBuilderPanel
                query={query}
                selectedCriteria={displayData?.selectedCriteria}
                facets={
                  displayData?.facets ?? {
                    domains: [],
                    specialties: [],
                    skills: [],
                  }
                }
                isLoading={isInitialPending}
                onSelectDomain={(code) =>
                  updateQuery(selectCompetencyDomain(code))
                }
                onSelectSpecialty={(code) =>
                  updateQuery(selectCompetencySpecialty(query, code))
                }
                onAddSkill={(code) =>
                  updateQuery(toggleCompetencySkill(query, code))
                }
              />
            </div>

            <section
              aria-label="Resultados de personas por competencia"
              className="min-w-0 rounded-xl border border-cyan-400/12 bg-[#06111f]/40 px-4 py-5 sm:px-5 sm:py-6"
            >
              <CompetencyPeopleResults
                query={query}
                data={displayData}
                isLoading={isInitialPending}
                isError={search.isError}
                error={search.error}
                onRetry={() => void search.refetch()}
                onSelectDomain={(code) =>
                  updateQuery(selectCompetencyDomain(code))
                }
                onBroaden={broadenQuery}
                onOpenPerson={setSelectedPersonId}
                onPageChange={(nextPage) =>
                  setPaginationState({ querySignature, page: nextPage })
                }
              />
            </section>
          </div>
        </div>
      </main>

      {detailOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Perfil de la persona"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPersonId(null);
          }}
        >
          <aside
            className={`entity-detail-overlay flex h-full min-h-0 w-full flex-col overflow-hidden ${entityDetailOverlayWidthClass(activeDetailModule)}`}
          >
            <PersonDetailPanel
              personId={selectedPersonId}
              treeDescendantCount={null}
              layoutVariant="overlay"
              onActiveModuleChange={setActiveDetailModule}
              onClose={() => {
                setSelectedPersonId(null);
                setActiveDetailModule(null);
              }}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
