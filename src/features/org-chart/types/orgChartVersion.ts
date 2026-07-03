export type OrgChartVersion = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  periodLabel: string | null;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrgChartSnapshotPayload = {
  sourceVersionId: number;
  code: string;
  name: string;
  periodLabel?: string;
  description?: string;
};

export type OrgChartRequestOptions = {
  versionId?: number;
  /**
   * Posición visual (`org_visual_relation.id`) para pedir el equipo de una
   * posición concreta de la persona (multi-posición). Opcional.
   */
  relationId?: number | string | null;
};
