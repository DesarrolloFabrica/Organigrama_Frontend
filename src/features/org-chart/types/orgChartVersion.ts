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
};
