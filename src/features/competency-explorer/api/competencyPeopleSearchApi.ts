import { getAccessToken } from "../../../auth/authStorage";
import type {
  CompetencyPeopleSearchRequest,
  CompetencyPeopleSearchResponse,
} from "../types/competencyPeopleSearch.types";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export class CompetencyPeopleSearchApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "CompetencyPeopleSearchApiError";
    this.status = status;
    this.code = code;
  }
}

export function buildCompetencyPeopleSearchPath(
  request: CompetencyPeopleSearchRequest,
  versionId?: number,
): string {
  const params = new URLSearchParams();
  if (request.domainCode) params.set("domain", request.domainCode);
  if (request.specialtyCode) params.set("specialty", request.specialtyCode);
  if (request.skillCodes.length > 0) {
    params.set("skills", request.skillCodes.join(","));
  }
  if (request.page && request.page > 1)
    params.set("page", String(request.page));
  if (request.pageSize) params.set("pageSize", String(request.pageSize));
  if (versionId !== undefined) params.set("versionId", String(versionId));
  const query = params.toString();
  return `/api/org-chart/competency-people-search${query ? `?${query}` : ""}`;
}

export async function fetchCompetencyPeopleSearch(
  request: CompetencyPeopleSearchRequest,
  options: { versionId?: number; signal?: AbortSignal } = {},
): Promise<CompetencyPeopleSearchResponse> {
  const token = getAccessToken();
  const response = await fetch(
    `${BASE_URL}${buildCompetencyPeopleSearchPath(request, options.versionId)}`,
    {
      signal: options.signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as {
        message?: string | { message?: string; code?: string };
        code?: string;
      };
      code = body.code;
      if (typeof body.message === "string") message = body.message;
      if (body.message && typeof body.message === "object") {
        message = body.message.message ?? message;
        code = body.message.code ?? code;
      }
    } catch {
      // Keep the stable HTTP fallback when the server returns no JSON body.
    }
    throw new CompetencyPeopleSearchApiError(response.status, message, code);
  }

  return response.json() as Promise<CompetencyPeopleSearchResponse>;
}
