import { describe, expect, it, vi } from "vitest";
import {
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCompetencyPeopleSearchPath } from "../api/competencyPeopleSearchApi";
import { ActiveQueryBar } from "../components/ActiveQueryBar";
import { CompetencyPersonCard } from "../components/CompetencyPersonCard";
import { QueryBuilderPanel } from "../components/QueryBuilderPanel";
import type {
  CompetencyPeopleSearchPerson,
  CompetencyPeopleSearchQuery,
} from "../types/competencyPeopleSearch.types";
import { orgQueryKeys } from "../../../lib/react-query/queryKeys";
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
} from "./competencyPeopleSearchState";
import {
  competencyDomainRoleLabel,
  competencyPersonInitials,
  competencyPersonMatchReason,
  resolveCompetencyPeopleSearchViewState,
} from "./competencyPeopleSearchPresentation";

const fullQuery: CompetencyPeopleSearchQuery = {
  domainCode: "SOFTWARE_ENGINEERING",
  specialtyCode: "FRONTEND_ENGINEERING",
  skillCodes: ["typescript", "react"],
};

const person: CompetencyPeopleSearchPerson = {
  personId: "42",
  displayName: "Ana Pérez",
  photoUrl: null,
  jobTitle: "Ingeniera de software",
  domainMatchRole: "PRIMARY",
  matchedDomain: {
    code: "SOFTWARE_ENGINEERING",
    label: "Ingeniería de software",
  },
  matchedSpecialty: {
    code: "FRONTEND_ENGINEERING",
    label: "Ingeniería Frontend",
  },
  matchedSkills: [
    { code: "typescript", label: "TypeScript" },
    { code: "react", label: "React" },
  ],
  explanation: {
    domain: {
      code: "SOFTWARE_ENGINEERING",
      label: "Ingeniería de software",
      role: "PRIMARY",
    },
    specialty: { code: "FRONTEND_ENGINEERING", label: "Ingeniería Frontend" },
    skills: [
      { code: "typescript", label: "TypeScript" },
      { code: "react", label: "React" },
    ],
  },
};

describe("competency people search production flow", () => {
  it("1. hydrates the initial state from an empty URL", () => {
    expect(readCompetencyPeopleQuery(new URLSearchParams())).toEqual(
      EMPTY_COMPETENCY_PEOPLE_QUERY,
    );
  });

  it("2. selects a single domain and clears all children", () => {
    expect(selectCompetencyDomain("SOFTWARE_ENGINEERING")).toEqual({
      domainCode: "SOFTWARE_ENGINEERING",
      specialtyCode: null,
      skillCodes: [],
    });
  });

  it("3. replaces a domain instead of accumulating domains", () => {
    expect(selectCompetencyDomain("VISUAL_DESIGN")).toEqual({
      domainCode: "VISUAL_DESIGN",
      specialtyCode: null,
      skillCodes: [],
    });
  });

  it("4. selects one specialty under the current domain", () => {
    expect(
      selectCompetencySpecialty(
        {
          domainCode: "SOFTWARE_ENGINEERING",
          specialtyCode: null,
          skillCodes: [],
        },
        "FRONTEND_ENGINEERING",
      ),
    ).toEqual({
      domainCode: "SOFTWARE_ENGINEERING",
      specialtyCode: "FRONTEND_ENGINEERING",
      skillCodes: [],
    });
  });

  it("5. replacing specialty clears selected skills", () => {
    expect(selectCompetencySpecialty(fullQuery, "BACKEND_ENGINEERING")).toEqual(
      {
        domainCode: "SOFTWARE_ENGINEERING",
        specialtyCode: "BACKEND_ENGINEERING",
        skillCodes: [],
      },
    );
  });

  it("6. specialty cannot survive without a domain", () => {
    expect(
      selectCompetencySpecialty(
        EMPTY_COMPETENCY_PEOPLE_QUERY,
        "FRONTEND_ENGINEERING",
      ),
    ).toEqual(EMPTY_COMPETENCY_PEOPLE_QUERY);
  });

  it("7. adds multiple skills without duplicates", () => {
    const base = { ...fullQuery, skillCodes: ["typescript"] };
    expect(toggleCompetencySkill(base, "react").skillCodes).toEqual([
      "typescript",
      "react",
    ]);
    expect(toggleCompetencySkill(base, "typescript").skillCodes).toEqual([]);
  });

  it("8. chip removal removes exactly the requested skill", () => {
    expect(toggleCompetencySkill(fullQuery, "typescript").skillCodes).toEqual([
      "react",
    ]);
  });

  it("9. removing specialty clears all skills", () => {
    expect(selectCompetencySpecialty(fullQuery, null)).toEqual({
      domainCode: "SOFTWARE_ENGINEERING",
      specialtyCode: null,
      skillCodes: [],
    });
  });

  it("10. removing domain clears specialty and skills", () => {
    expect(selectCompetencyDomain(null)).toEqual(EMPTY_COMPETENCY_PEOPLE_QUERY);
  });

  it("11. hydrates domain, specialty and comma-separated skills from URL", () => {
    const params = new URLSearchParams(
      "domain=SOFTWARE_ENGINEERING&specialty=FRONTEND_ENGINEERING&skills=typescript,react",
    );
    expect(readCompetencyPeopleQuery(params)).toEqual(fullQuery);
  });

  it("12. deduplicates repeated skill URL parameters in stable order", () => {
    const params = new URLSearchParams(
      "domain=SOFTWARE_ENGINEERING&specialty=FRONTEND_ENGINEERING&skills=react,typescript&skills=react",
    );
    expect(readCompetencyPeopleQuery(params).skillCodes).toEqual([
      "react",
      "typescript",
    ]);
  });

  it("13. drops orphan URL children before the request", () => {
    const params = new URLSearchParams(
      "specialty=FRONTEND_ENGINEERING&skills=react",
    );
    expect(readCompetencyPeopleQuery(params)).toEqual(
      EMPTY_COMPETENCY_PEOPLE_QUERY,
    );
  });

  it("14. serializes canonical criteria while preserving unrelated URL params", () => {
    const params = writeCompetencyPeopleQuery(
      new URLSearchParams("debug=1&domain=OLD"),
      fullQuery,
    );
    expect(params.get("debug")).toBe("1");
    expect(readCompetencyPeopleQuery(params)).toEqual(fullQuery);
  });

  it("15. back and forward URL snapshots hydrate independently", () => {
    const before = readCompetencyPeopleQuery(
      new URLSearchParams("domain=SOFTWARE_ENGINEERING"),
    );
    const after = readCompetencyPeopleQuery(
      new URLSearchParams(
        "domain=SOFTWARE_ENGINEERING&specialty=FRONTEND_ENGINEERING",
      ),
    );
    expect(before.specialtyCode).toBeNull();
    expect(after.specialtyCode).toBe("FRONTEND_ENGINEERING");
  });

  it("16. detects a stale server-canonicalized URL and ignores an equal one", () => {
    const canonical = { ...fullQuery, skillCodes: ["typescript"] };
    expect(shouldCanonicalizeCompetencyPeopleQuery(fullQuery, canonical)).toBe(
      true,
    );
    expect(shouldCanonicalizeCompetencyPeopleQuery(canonical, canonical)).toBe(
      false,
    );
  });

  it("17. rapid query changes receive distinct React Query keys", () => {
    const first = orgQueryKeys.competencyPeopleSearch(
      "SOFTWARE_ENGINEERING",
      null,
      [],
      1,
      7,
    );
    const second = orgQueryKeys.competencyPeopleSearch(
      "VISUAL_DESIGN",
      null,
      [],
      1,
      7,
    );
    expect(first).not.toEqual(second);
  });

  it("18. query signatures are deterministic and order-sensitive for AND skills", () => {
    expect(competencyPeopleQuerySignature(fullQuery)).toBe(
      "SOFTWARE_ENGINEERING|FRONTEND_ENGINEERING|typescript,react",
    );
    expect(
      sameCompetencyPeopleQuery(fullQuery, {
        ...fullQuery,
        skillCodes: ["react", "typescript"],
      }),
    ).toBe(false);
  });

  it("19. broadens a zero-result query one leaf criterion at a time", () => {
    const withoutReact = broadenCompetencyPeopleQuery(fullQuery);
    expect(withoutReact.skillCodes).toEqual(["typescript"]);
    expect(
      broadenCompetencyPeopleQuery({ ...withoutReact, skillCodes: [] }),
    ).toEqual({
      domainCode: "SOFTWARE_ENGINEERING",
      specialtyCode: null,
      skillCodes: [],
    });
  });

  it("20. exposes loading, error, initial, zero and results states", () => {
    expect(
      resolveCompetencyPeopleSearchViewState({
        query: fullQuery,
        isLoading: true,
        isError: false,
      }),
    ).toBe("LOADING");
    expect(
      resolveCompetencyPeopleSearchViewState({
        query: fullQuery,
        isLoading: false,
        isError: true,
      }),
    ).toBe("ERROR");
    expect(
      resolveCompetencyPeopleSearchViewState({
        query: EMPTY_COMPETENCY_PEOPLE_QUERY,
        isLoading: false,
        isError: false,
      }),
    ).toBe("INITIAL");
    expect(
      resolveCompetencyPeopleSearchViewState({
        query: fullQuery,
        isLoading: false,
        isError: false,
        total: 0,
      }),
    ).toBe("EMPTY");
    expect(
      resolveCompetencyPeopleSearchViewState({
        query: fullQuery,
        isLoading: false,
        isError: false,
        total: 1,
      }),
    ).toBe("RESULTS");
  });

  it("21. builds the single structured endpoint with encoded criteria and version", () => {
    const path = buildCompetencyPeopleSearchPath(
      { ...fullQuery, page: 2, pageSize: 24 },
      8,
    );
    const url = new URL(path, "http://local");
    expect(url.pathname).toBe("/api/org-chart/competency-people-search");
    expect(url.searchParams.get("domain")).toBe("SOFTWARE_ENGINEERING");
    expect(url.searchParams.get("skills")).toBe("typescript,react");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("versionId")).toBe("8");
  });

  it("22. presents deterministic role, initials and match reason without a score", () => {
    expect(competencyPersonInitials("Ana Pérez")).toBe("AP");
    expect(competencyDomainRoleLabel("PRIMARY")).toBe("Dominio principal");
    const reason = competencyPersonMatchReason(person);
    expect(reason).toContain("Ingeniería de software");
    expect(reason).toContain("TypeScript, React");
    expect(reason).not.toMatch(/%|score|confianza/i);
  });

  it("23. renders a production person card without mock percentages or evidence", () => {
    const html = renderToStaticMarkup(
      createElement(CompetencyPersonCard, { person, onOpen: vi.fn() }),
    );
    expect(html).toContain("Ana Pérez");
    expect(html).toContain("Ingeniera de software");
    expect(html).toContain("Ver perfil");
    expect(html).not.toMatch(/porcentaje|evidencia|%/i);
  });

  it("24. person card opens the existing profile flow with the exact person id", () => {
    const onOpen = vi.fn();
    const tree = CompetencyPersonCard({ person, onOpen });
    const button = findButton(tree, "Ver perfil");
    expect(button).not.toBeNull();
    const props = button!.props as { onClick: () => void };
    props.onClick();
    expect(onOpen).toHaveBeenCalledWith("42");
  });

  it("25. ActiveQueryBar renders only user domain, specialty and skill criteria", () => {
    const html = renderToStaticMarkup(
      createElement(ActiveQueryBar, {
        query: fullQuery,
        selectedCriteria: {
          domain: person.matchedDomain,
          specialty: person.matchedSpecialty,
          skills: person.matchedSkills,
        },
        resultCount: 1,
        onRemoveDomain: vi.fn(),
        onRemoveSpecialty: vi.fn(),
        onRemoveSkill: vi.fn(),
        onClear: vi.fn(),
      }),
    );
    expect(html).toContain("Dominio");
    expect(html).toContain("Especialidad");
    expect(html).toContain("Skill");
    expect(html).not.toContain("CONTEXT");
  });

  it("26. query builder shows only positive server facets and no ANY/ALL control", () => {
    const html = renderToStaticMarkup(
      createElement(QueryBuilderPanel, {
        query: { ...fullQuery, skillCodes: [] },
        selectedCriteria: {
          domain: person.matchedDomain,
          specialty: person.matchedSpecialty,
          skills: [],
        },
        facets: {
          domains: [],
          specialties: [],
          skills: [{ code: "typescript", label: "TypeScript", count: 2 }],
        },
        isLoading: false,
        onSelectDomain: vi.fn(),
        onSelectSpecialty: vi.fn(),
        onAddSkill: vi.fn(),
      }),
    );
    expect(html).toContain("TypeScript");
    expect(html).toContain(">2<");
    expect(html).not.toMatch(/ANY|ALL|Coincidencia amplia/);
  });
});

function findButton(node: ReactNode, text: string): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findButton(child, text);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  const props = node.props as { children?: ReactNode };
  if (node.type === "button" && flattenText(props.children).includes(text)) {
    return node;
  }
  return findButton(props.children, text);
}

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (!isValidElement(node)) return "";
  return flattenText((node.props as { children?: ReactNode }).children);
}
