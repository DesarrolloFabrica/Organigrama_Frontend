/** Claves de cache del organigrama (estables, sin keys dinámicas innecesarias). */
export const orgQueryKeys = {
  root: (versionId?: number) =>
    versionId !== undefined
      ? (["org-root", versionId] as const)
      : (["org-root"] as const),
  node: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-node", personId, versionId] as const)
      : (["org-node", personId] as const),
  children: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-children", personId, versionId] as const)
      : (["org-children", personId] as const),
  summary: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-summary", personId, versionId] as const)
      : (["org-summary", personId] as const),
  personDetail: (personId: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-person-detail", personId, versionId] as const)
      : (["org-person-detail", personId] as const),
  search: (query: string, versionId?: number) =>
    versionId !== undefined
      ? (["org-search", query, versionId] as const)
      : (["org-search", query] as const),
  versions: ["org-chart-versions"] as const,
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
