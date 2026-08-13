import type { CompetencyPeopleSearchQuery } from "../types/competencyPeopleSearch.types";

export const EMPTY_COMPETENCY_PEOPLE_QUERY: CompetencyPeopleSearchQuery = {
  domainCode: null,
  specialtyCode: null,
  skillCodes: [],
};

function clean(value: string | null | undefined): string | null {
  const result = String(value ?? "").trim();
  return result || null;
}

function uniqueCodes(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const code = raw.trim();
    if (code && !seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }
  return result;
}

export function readCompetencyPeopleQuery(
  params: URLSearchParams,
): CompetencyPeopleSearchQuery {
  const domainCode = clean(params.get("domain"));
  const specialtyCode = domainCode ? clean(params.get("specialty")) : null;
  const skillCodes =
    domainCode && specialtyCode
      ? uniqueCodes(
          params.getAll("skills").flatMap((value) => value.split(",")),
        )
      : [];
  return { domainCode, specialtyCode, skillCodes };
}

export function writeCompetencyPeopleQuery(
  current: URLSearchParams,
  query: CompetencyPeopleSearchQuery,
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.delete("domain");
  next.delete("specialty");
  next.delete("skills");
  if (query.domainCode) next.set("domain", query.domainCode);
  if (query.domainCode && query.specialtyCode) {
    next.set("specialty", query.specialtyCode);
    if (query.skillCodes.length > 0) {
      next.set("skills", uniqueCodes(query.skillCodes).join(","));
    }
  }
  return next;
}

export function selectCompetencyDomain(
  code: string | null,
): CompetencyPeopleSearchQuery {
  return { domainCode: clean(code), specialtyCode: null, skillCodes: [] };
}

export function selectCompetencySpecialty(
  query: CompetencyPeopleSearchQuery,
  code: string | null,
): CompetencyPeopleSearchQuery {
  if (!query.domainCode) return EMPTY_COMPETENCY_PEOPLE_QUERY;
  return {
    domainCode: query.domainCode,
    specialtyCode: clean(code),
    skillCodes: [],
  };
}

export function toggleCompetencySkill(
  query: CompetencyPeopleSearchQuery,
  code: string,
): CompetencyPeopleSearchQuery {
  if (!query.domainCode || !query.specialtyCode) return query;
  const cleaned = clean(code);
  if (!cleaned) return query;
  const exists = query.skillCodes.includes(cleaned);
  return {
    ...query,
    skillCodes: exists
      ? query.skillCodes.filter((skillCode) => skillCode !== cleaned)
      : [...query.skillCodes, cleaned],
  };
}

export function sameCompetencyPeopleQuery(
  left: CompetencyPeopleSearchQuery,
  right: CompetencyPeopleSearchQuery,
): boolean {
  return (
    left.domainCode === right.domainCode &&
    left.specialtyCode === right.specialtyCode &&
    left.skillCodes.length === right.skillCodes.length &&
    left.skillCodes.every((code, index) => code === right.skillCodes[index])
  );
}

export function competencyPeopleQuerySignature(
  query: CompetencyPeopleSearchQuery,
): string {
  return [
    query.domainCode ?? "",
    query.specialtyCode ?? "",
    query.skillCodes.join(","),
  ].join("|");
}

export function broadenCompetencyPeopleQuery(
  query: CompetencyPeopleSearchQuery,
): CompetencyPeopleSearchQuery {
  if (query.skillCodes.length > 0) {
    return toggleCompetencySkill(
      query,
      query.skillCodes[query.skillCodes.length - 1],
    );
  }
  if (query.specialtyCode) return selectCompetencySpecialty(query, null);
  return selectCompetencyDomain(null);
}

export function shouldCanonicalizeCompetencyPeopleQuery(
  requested: CompetencyPeopleSearchQuery,
  response: CompetencyPeopleSearchQuery,
): boolean {
  return !sameCompetencyPeopleQuery(requested, response);
}
