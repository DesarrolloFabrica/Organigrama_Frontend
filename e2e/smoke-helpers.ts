import type { Page } from "@playwright/test";
import type { AuthUser } from "../src/auth/types";

const JWT_SECRET =
  process.env.SMOKE_JWT_SECRET?.trim() ||
  "organigrama-dev-jwt-secret-change-me";

const API_BASE =
  process.env.SMOKE_API_BASE_URL?.trim() || "http://localhost:3000";

export const FRONTEND_BASE =
  process.env.SMOKE_FRONTEND_URL?.trim() || "http://localhost:5173";

export async function mintAccessToken(
  personId: string,
  googleEmail: string,
  googleSubject: string,
): Promise<string> {
  const jwt = await import("jsonwebtoken");
  return jwt.default.sign(
    { personId, googleSubject, googleEmail },
    JWT_SECRET,
    { expiresIn: "2h" },
  );
}

export async function fetchAuthUser(
  accessToken: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`auth/me ${res.status}`);
  }
  const data = (await res.json()) as {
    personId: string;
    fullName: string;
    eduEmail: string | null;
    googleEmail: string;
    pictureUrl: string | null;
  };
  return {
    personId: data.personId,
    fullName: data.fullName,
    eduEmail: data.eduEmail,
    googleEmail: data.googleEmail,
    pictureUrl: data.pictureUrl,
  };
}

export async function injectAuthSession(
  page: Page,
  accessToken: string,
  user: AuthUser,
): Promise<void> {
  await page.goto(`${FRONTEND_BASE}/`);
  await page.evaluate(
    ({ accessToken, user }) => {
      sessionStorage.setItem("organigrama.accessToken", accessToken);
      sessionStorage.setItem("organigrama.authUser", JSON.stringify(user));
    },
    { accessToken, user },
  );
}

export async function loginAsPerson(
  page: Page,
  personId: string,
  googleEmail: string,
  googleSubject: string,
): Promise<AuthUser> {
  const token = await mintAccessToken(personId, googleEmail, googleSubject);
  const user = await fetchAuthUser(token);
  await injectAuthSession(page, token, user);
  return user;
}

export async function setProfileCompletedGate(
  page: Page,
  completed: boolean,
): Promise<void> {
  await page.evaluate((completed) => {
    sessionStorage.setItem(
      "organigrama.profileCompleted",
      completed ? "true" : "false",
    );
  }, completed);
}
