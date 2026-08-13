/** Claves de cache del organigrama (estables, sin keys dinámicas innecesarias). */
export const orgQueryKeys = {
  root: (versionId?: number) =>
    versionId !== undefined
      ? (["org-root", versionId] as const)
      : (["org-root"] as const),
  node: (
    personId: string,
    versionId?: number,
    relationId?: number | string | null,
  ) =>
    [
      "org-node",
      personId,
      relationId != null ? String(relationId) : null,
      versionId ?? null,
    ] as const,
  children: (
    personId: string,
    versionId?: number,
    relationId?: number | string | null,
  ) =>
    [
      "org-children",
      personId,
      relationId != null ? String(relationId) : null,
      versionId ?? null,
    ] as const,
  summary: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-summary", personId, versionId] as const)
      : (["org-summary", personId] as const),
  personDetail: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-person-detail", personId, versionId] as const)
      : (["org-person-detail", personId] as const),
  /** Hoja de vida (CV) de una persona; no depende de la versión del organigrama. */
  personCv: (personId: string) => ["org-person-cv", personId] as const,
  /** Video de presentación (metadatos + ticket); no depende de versión. */
  personVideo: (personId: string) => ["org-person-video", personId] as const,
  /** Resumen del Explorador de Competencias (MC1). */
  personCompetencies: (personId: string, includeAudit = false) =>
    ["org-person-competencies", personId, includeAudit] as const,
  /** Perfil profesional multidominio (piloto MC1). */
  personProfessionalProfile: (personId: string, includeAudit = false) =>
    ["org-person-professional-profile", personId, includeAudit] as const,
  personCompetencyDomain: (
    personId: string,
    domainCode: string,
    includeAudit = false,
  ) =>
    ["org-person-competency-domain", personId, domainCode, includeAudit] as const,
  personCompetencySpecialty: (
    personId: string,
    domainCode: string,
    specialtyCode: string,
    includeAudit = false,
  ) =>
    [
      "org-person-competency-specialty",
      personId,
      domainCode,
      specialtyCode,
      includeAudit,
    ] as const,
  competencyPeopleSearch: (
    domainCode: string | null,
    specialtyCode: string | null,
    skillCodes: string[],
    page: number,
    versionId?: number,
  ) =>
    [
      "competency-people-search",
      versionId ?? null,
      domainCode,
      specialtyCode,
      skillCodes.join(","),
      page,
    ] as const,
  search: (query: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-search", query, versionId] as const)
      : (["org-search", query] as const),
  versions: ["org-chart-versions"] as const,
  /** Vacantes reales del schema `vacancies` (independiente de la versión). */
  vacancies: ["org-vacancies"] as const,
  /** Prefijos para invalidar familias de queries del organigrama. */
  allNodes: ["org-node"] as const,
  allPersonDetails: ["org-person-detail"] as const,
  allOrgData: ["org-root", "org-node", "org-children", "org-summary", "org-person-detail", "org-search"] as const,
};

export const profileQueryKeys = {
  profile: ["profile"] as const,
};

export const onboardingQueryKeys = {
  status: ["onboarding-status"] as const,
};
