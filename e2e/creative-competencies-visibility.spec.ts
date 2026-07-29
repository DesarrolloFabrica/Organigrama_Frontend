/**
 * MC1.10.4 — Verificación visual real de competencias (DETALLE → Competencias).
 * Usa Playwright ya presente. Requiere FE :5173 y API :3000 con DEV_LOGIN.
 *
 * npx playwright test creative-competencies-visibility
 */
import { test, expect, type Page } from "@playwright/test";
import {
  FRONTEND_BASE,
  injectAuthSession,
  setProfileCompletedGate,
} from "./smoke-helpers";
import type { AuthUser } from "../src/auth/types";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const API_BASE =
  process.env.SMOKE_API_BASE_URL?.trim() || "http://localhost:3000";
const SCREENSHOT_DIR = resolve("e2e/artifacts/mc1104");

async function loginViaDevEmail(
  page: Page,
  email: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(`dev-login ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    accessToken: string;
    user: AuthUser;
  };
  await injectAuthSession(page, data.accessToken, data.user);
  return data.user;
}

type ProfileCase = {
  label: string;
  personId: string;
  searchHint: string;
  expectDomain: RegExp;
  expectSpecialty: RegExp;
  expectAvailable: boolean;
  expectStaleMessage?: RegExp;
};

const PROFILES: ProfileCase[] = [
  {
    label: "nidia",
    personId: "1163",
    searchHint: "NIDIA MARCELA PRADA",
    expectDomain: /Diseño Visual/i,
    expectSpecialty: /Gráfico|Diseño Gráfico|VISUAL_GRAPHIC|Graphic/i,
    expectAvailable: true,
  },
  {
    label: "daniel",
    personId: "1164",
    searchHint: "DANIEL ALEJANDRO PEREZ",
    expectDomain: /Diseño Visual/i,
    expectSpecialty: /Gráfico|Diseño Gráfico|VISUAL_GRAPHIC|Graphic/i,
    expectAvailable: true,
  },
  {
    label: "juan_pablo",
    personId: "1176",
    searchHint: "JUAN PABLO SANABRIA",
    expectDomain: /Producción Audiovisual|Audiovisual/i,
    expectSpecialty: /Motion|AV_MOTION|Motion Graphics/i,
    expectAvailable: true,
  },
  {
    label: "santiago",
    personId: "1172",
    searchHint: "SANTIAGO VANEGAS",
    expectDomain: /Producción Audiovisual|Audiovisual/i,
    expectSpecialty: /Editing|Edición|AV_EDITING|Montaje/i,
    expectAvailable: true,
  },
  {
    label: "ginna",
    personId: "1166",
    searchHint: "GINNA MARCELA GARZON",
    expectDomain: /Diseño Visual/i,
    expectSpecialty: /./,
    expectAvailable: false,
    expectStaleMessage:
      /versión anterior del modelo|catálogo|requiere (actualización|reevaluación)|evaluación histórica/i,
  },
];

async function openPersonCompetencies(
  page: Page,
  profile: ProfileCase,
): Promise<void> {
  const search = page.getByRole("searchbox", {
    name: /Buscar en el organigrama/i,
  });
  await expect(search).toBeVisible({ timeout: 30_000 });
  await search.click();
  await search.fill("");
  await search.fill(profile.searchHint.split(" ").slice(0, 3).join(" "));
  await page.waitForTimeout(800);

  const openFicha = page.getByRole("button", {
    name: new RegExp(`Abrir ficha de ${profile.searchHint.split(" ")[0]}`, "i"),
  });
  await expect(openFicha.first()).toBeVisible({ timeout: 20_000 });
  await openFicha.first().click();

  const detailRegion = page.getByRole("complementary", {
    name: /Ficha técnica de la persona/i,
  });
  await expect(detailRegion).toBeVisible({ timeout: 25_000 });
  await expect(detailRegion).toContainText(
    new RegExp(profile.searchHint.split(" ")[0], "i"),
    { timeout: 15_000 },
  );

  await expect(
    detailRegion.getByText(/Vista limitada — sin permiso de ficha completa/i),
  ).toHaveCount(0);

  const competenciasTab = detailRegion.getByRole("tab", {
    name: /^Competencias$/i,
  });
  await expect(competenciasTab).toBeVisible({ timeout: 10_000 });
  await competenciasTab.click();
  await page.waitForTimeout(1500);

  const loading = page.getByLabel(/Cargando competencias/i);
  if (await loading.isVisible().catch(() => false)) {
    await expect(loading).toBeHidden({ timeout: 45_000 });
  }
}

test.describe("MC1.10.4 creative competencies visibility", () => {
  test("DETALLE Competencias: Nidia→Daniel→Juan Pablo→Santiago→Ginna + caché", async ({
    page,
  }) => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const results: Record<string, { ok: boolean; detail: string }> = {};

    // Usuario con ORG_READ_ALL (ficha completa / pestaña Competencias).
    await loginViaDevEmail(page, "desarrollofabrica@cun.edu.co");
    await setProfileCompletedGate(page, true);
    await page.goto(`${FRONTEND_BASE}/org`);
    await expect(
      page.getByRole("region", { name: "Mapa del organigrama" }),
    ).toBeVisible({ timeout: 60_000 });

    for (const profile of PROFILES) {
      await openPersonCompetencies(page, profile);

      const panel = page.locator("#person-panel-competencias, .mc-explorer").first();
      const explorer = page.locator(".mc-explorer");
      const staleCard = page.getByRole("status").filter({
        hasText: profile.expectStaleMessage ?? /catálogo|modelo/i,
      });

      if (profile.expectAvailable) {
        await expect(explorer).toBeVisible({ timeout: 30_000 });
        await expect(explorer).toContainText(profile.expectDomain);
        await expect(explorer).toContainText(profile.expectSpecialty);

        const limited = await page
          .getByText(/Vista limitada|sin permiso de ficha completa/i)
          .isVisible()
          .catch(() => false);
        expect(limited, `${profile.label} no debe ser vista limitada`).toBe(
          false,
        );

        const notEvaluated = await page
          .getByText(/Aún no hay una evaluación de competencias/i)
          .isVisible()
          .catch(() => false);
        expect(
          notEvaluated,
          `${profile.label} no debe mostrar NOT_EVALUATED`,
        ).toBe(false);

        await page.screenshot({
          path: resolve(SCREENSHOT_DIR, `${profile.label}-competencias.png`),
          fullPage: false,
        });

        results[profile.label] = {
          ok: true,
          detail: `VISIBLE domain+specialty personId=${profile.personId}`,
        };
      } else {
        const staleVisible =
          (await staleCard.first().isVisible().catch(() => false)) ||
          (await page
            .getByText(profile.expectStaleMessage!)
            .first()
            .isVisible()
            .catch(() => false));
        const notEvaluatedAmbiguous = await page
          .getByText(/Aún no hay una evaluación de competencias/i)
          .isVisible()
          .catch(() => false);

        await page.screenshot({
          path: resolve(SCREENSHOT_DIR, `${profile.label}-competencias.png`),
          fullPage: false,
        });

        const ok = staleVisible && !notEvaluatedAmbiguous;
        results[profile.label] = {
          ok,
          detail: ok
            ? "STALE explícito (no NOT_EVALUATED)"
            : `staleVisible=${staleVisible} notEvaluated=${notEvaluatedAmbiguous}`,
        };
        expect(ok, results[profile.label].detail).toBe(true);
      }

      // Cerrar panel (botón X del detalle)
      const detailRegion = page.getByRole("complementary", {
        name: /Ficha técnica de la persona/i,
      });
      await detailRegion
        .getByRole("button", { name: /Cerrar panel de detalle/i })
        .click({ timeout: 5_000 })
        .catch(async () => {
          await page.keyboard.press("Escape");
        });
      await page.waitForTimeout(500);

      const search = page.getByRole("searchbox", {
        name: /Buscar en el organigrama/i,
      });
      await search.fill("");
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.waitForTimeout(300);
    }

    await test.info().attach("mc1104-browser-results.json", {
      body: JSON.stringify({ results, screenshotDir: SCREENSHOT_DIR }, null, 2),
      contentType: "application/json",
    });

    const failed = Object.entries(results).filter(([, v]) => !v.ok);
    expect(failed, JSON.stringify(failed)).toHaveLength(0);
  });
});
