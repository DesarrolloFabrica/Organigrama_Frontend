export type CompetencyPeopleSearchQuery = {
  domainCode: string | null;
  specialtyCode: string | null;
  skillCodes: string[];
};

export type CompetencyPeopleSearchWarning = {
  code:
    | "DOMAIN_INVALID"
    | "SPECIALTY_REQUIRES_DOMAIN"
    | "SPECIALTY_INVALID"
    | "SPECIALTY_OUTSIDE_DOMAIN"
    | "SKILLS_REQUIRE_SPECIALTY"
    | "SKILL_INVALID";
  criterion: "domain" | "specialty" | "skill";
  value: string;
};

export type CompetencyPeopleSearchFacet = {
  code: string;
  label: string;
  count: number;
};

export type CompetencyPeopleSearchValue = {
  code: string;
  label: string;
};

export type CompetencyPeopleSearchPerson = {
  personId: string;
  displayName: string;
  photoUrl: string | null;
  jobTitle: string | null;
  domainMatchRole: "PRIMARY" | "SECONDARY";
  matchedDomain: CompetencyPeopleSearchValue;
  matchedSpecialty: CompetencyPeopleSearchValue | null;
  matchedSkills: CompetencyPeopleSearchValue[];
  explanation: {
    domain: CompetencyPeopleSearchValue & {
      role: "PRIMARY" | "SECONDARY";
    };
    specialty: CompetencyPeopleSearchValue | null;
    skills: CompetencyPeopleSearchValue[];
  };
};

export type CompetencyPeopleSearchResponse = {
  query: CompetencyPeopleSearchQuery;
  selectedCriteria: {
    domain: CompetencyPeopleSearchValue | null;
    specialty: CompetencyPeopleSearchValue | null;
    skills: CompetencyPeopleSearchValue[];
  };
  warnings: CompetencyPeopleSearchWarning[];
  authorizedUniverseTotal: number;
  total: number;
  people: CompetencyPeopleSearchPerson[];
  facets: {
    domains: CompetencyPeopleSearchFacet[];
    specialties: CompetencyPeopleSearchFacet[];
    skills: CompetencyPeopleSearchFacet[];
  };
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type CompetencyPeopleSearchRequest = CompetencyPeopleSearchQuery & {
  page?: number;
  pageSize?: number;
};
