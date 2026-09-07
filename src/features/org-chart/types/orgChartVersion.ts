export type OrgChartVersionScopeType = "GLOBAL" | "COORDINATION";

export type OrgChartScopeVersionId = number | "none";

export type OrgChartVersion = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  periodLabel: string | null;
  isActive: boolean;
  isLocked: boolean;
  scopeType?: OrgChartVersionScopeType;
  scopeCode?: string | null;
  scopeLabel?: string | null;
  scopeRootPersonId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrgChartSnapshotPayload = {
  sourceVersionId: number;
  code: string;
  name: string;
  periodLabel?: string;
  description?: string;
  scopeType?: OrgChartVersionScopeType;
  scopeCode?: string;
  scopeLabel?: string;
  scopeRootPersonId?: number;
};

export type OrgChartRequestOptions = {
  versionId?: number;
  /**
   * Versión de coordinación a superponer, o `"none"` para heredar el subárbol
   * de la versión global. Si se omite, el API usa overlays activos.
   */
  scopeVersionId?: OrgChartScopeVersionId;
  /**
   * Posición visual (`org_visual_relation.id`) para pedir el equipo de una
   * posición concreta de la persona (multi-posición). Opcional.
   */
  relationId?: number | string | null;
};
