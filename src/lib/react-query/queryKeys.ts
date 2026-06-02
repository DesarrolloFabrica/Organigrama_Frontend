/** Claves de cache del organigrama (estables, sin keys dinámicas innecesarias). */
export const orgQueryKeys = {
  root: ["org-root"] as const,
  node: (personId: string) => ["org-node", personId] as const,
  children: (personId: string) => ["org-children", personId] as const,
  summary: (personId: string) => ["org-summary", personId] as const,
  personDetail: (personId: string) => ["org-person-detail", personId] as const,
  search: (query: string) => ["org-search", query] as const,
  /** Prefijos para invalidar familias de queries del organigrama. */
  allNodes: ["org-node"] as const,
  allPersonDetails: ["org-person-detail"] as const,
};

export const profileQueryKeys = {
  profile: ["profile"] as const,
};

export const onboardingQueryKeys = {
  status: ["onboarding-status"] as const,
};
