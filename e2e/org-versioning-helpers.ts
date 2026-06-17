import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import type { AuthUser } from "../src/auth/types";

export const FRONTEND_BASE =
  process.env.SMOKE_FRONTEND_URL?.trim() || "http://localhost:5173";

export const API_BASE =
  process.env.SMOKE_API_BASE_URL?.trim() || "http://localhost:3000";

/**
 * Secreto JWT dev. Mismo mecanismo que los smoke tests:
 *  1. SMOKE_JWT_SECRET explícito
 *  2. AUTH_JWT_SECRET del .env del backend (dev local)
 *  3. fallback al default de desarrollo
 */
function resolveJwtSecret(): string {
  const fromEnv = process.env.SMOKE_JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;

  try {
    const envPath = resolve(__dirname, "../../Organigrama_Backend/.env");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      if (trimmed.slice(0, idx).trim() !== "AUTH_JWT_SECRET") continue;
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (value) return value;
    }
  } catch {
    // sin acceso al .env del backend; se usa el default dev
  }

  return "organigrama-dev-jwt-secret-change-me";
}

export type DevProfile = {
  personId: string;
  fullName: string;
  eduEmail: string;
  permissions: string[];
};

/** Perfil técnico autorizado para versionamiento. */
export const TECH_PROFILE: DevProfile = {
  personId: "1229",
  fullName: "USUARIO DESARROLLO FABRICA",
  eduEmail: "desarrollofabrica@cun.edu.co",
  permissions: ["ORG_READ_ALL", "ORG_ADMIN"],
};

/** Usuario normal sin acceso a versionamiento. */
export const NORMAL_PROFILE: DevProfile = {
  personId: "1144",
  fullName: "IRON ALEXANDER FUENTES RODRIGUEZ",
  eduEmail: "iron_fuentes@cun.edu.co",
  permissions: [],
};

/**
 * Firma un token dev completo (incluye eduEmail y permissions en el payload),
 * igual a lo que emite el backend en login real. Necesario porque el backend
 * resuelve `canUseVersioning` desde el JWT (`buildOrgViewerContext`).
 */
export async function mintDevToken(profile: DevProfile): Promise<string> {
  const jwt = await import("jsonwebtoken");
  return jwt.default.sign(
    {
      personId: profile.personId,
      googleSubject: `e2e-${profile.personId}`,
      googleEmail: profile.eduEmail,
      eduEmail: profile.eduEmail,
      permissions: profile.permissions,
    },
    resolveJwtSecret(),
    { expiresIn: "2h" },
  );
}

export function toAuthUser(profile: DevProfile): AuthUser {
  return {
    personId: profile.personId,
    fullName: profile.fullName,
    eduEmail: profile.eduEmail,
    googleEmail: profile.eduEmail,
    pictureUrl: null,
    permissions: profile.permissions,
  };
}

/** Inyecta sesión dev (token + authUser + gate de perfil completo) en sessionStorage. */
export async function injectDevSession(
  page: Page,
  profile: DevProfile,
): Promise<{ token: string; user: AuthUser }> {
  const token = await mintDevToken(profile);
  const user = toAuthUser(profile);
  await page.goto(`${FRONTEND_BASE}/`);
  await page.evaluate(
    ({ token, user }) => {
      sessionStorage.setItem("organigrama.accessToken", token);
      sessionStorage.setItem("organigrama.authUser", JSON.stringify(user));
      sessionStorage.setItem("organigrama.profileCompleted", "true");
    },
    { token, user },
  );
  return { token, user };
}
