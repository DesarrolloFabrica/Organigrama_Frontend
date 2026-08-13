import type {
  CompetencyPeopleSearchPerson,
  CompetencyPeopleSearchQuery,
} from "../types/competencyPeopleSearch.types";

export type CompetencyPeopleSearchViewState =
  "INITIAL" | "LOADING" | "ERROR" | "EMPTY" | "RESULTS";

export function resolveCompetencyPeopleSearchViewState(args: {
  query: CompetencyPeopleSearchQuery;
  isLoading: boolean;
  isError: boolean;
  total?: number;
}): CompetencyPeopleSearchViewState {
  if (args.isLoading) return "LOADING";
  if (args.isError) return "ERROR";
  if (!args.query.domainCode) return "INITIAL";
  return (args.total ?? 0) > 0 ? "RESULTS" : "EMPTY";
}

export function competencyPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function competencyDomainRoleLabel(
  role: CompetencyPeopleSearchPerson["domainMatchRole"],
): string {
  return role === "PRIMARY" ? "Dominio principal" : "Dominio secundario";
}

export function competencyPersonMatchReason(
  person: CompetencyPeopleSearchPerson,
): string {
  const parts = [
    `${competencyDomainRoleLabel(person.domainMatchRole)}: ${person.matchedDomain.label}`,
  ];
  if (person.matchedSpecialty) parts.push(person.matchedSpecialty.label);
  if (person.matchedSkills.length > 0) {
    parts.push(person.matchedSkills.map((skill) => skill.label).join(", "));
  }
  return parts.join(" · ");
}
