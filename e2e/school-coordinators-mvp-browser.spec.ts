/**
 * MC1 C2 — Verificación visual real coordinadores de escuela.
 * Organigrama → ficha → Competencias. Capturas + conteos DOM vs API.
 *
 * npx playwright test e2e/school-coordinators-mvp-browser.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  FRONTEND_BASE,
  injectAuthSession,
  setProfileCompletedGate,
} from "./smoke-helpers";
import type { AuthUser } from "../src/auth/types";

const API_BASE =
  process.env.SMOKE_API_BASE_URL?.trim() || "http://localhost:3000";

const ARTIFACT_ROOT = resolve(
  "../Organigrama_Backend/tmp/mc1-school-coordinators-mvp/browser-verification",
);
const SCREENSHOT_DIR = resolve(ARTIFACT_ROOT, "screenshots");
const RESPONSIVE_DIR = resolve(ARTIFACT_ROOT, "responsive");

type CohortCase = {
  key: string;
  document: string;
  personId: string;
  searchHint: string;
  expectClassificationPending: boolean;
  expectDomain?: RegExp;
  expectNoDomainSelector: boolean;
};

const COHORT: CohortCase[] = [
  {
    key: "viviana",
    document: "1117526801",
    personId: "601",
    searchHint: "VIVIANA ANDREA CABRERA",
    expectClassificationPending: false,
    expectDomain: /Software/i,
    expectNoDomainSelector: true,
  },
  {
    key: "maira",
    document: "1023935373",
    personId: "1078",
    searchHint: "MAIRA ALEJANDRA DONCEL",
    expectClassificationPending: true,
    expectNoDomainSelector: true,
  },
  {
    key: "andres",
    document: "1020720408",
    personId: "1079",
    searchHint: "ANDRES FELIPE PRIETO",
    expectClassificationPending: true,
    expectNoDomainSelector: true,
  },
  {
    key: "carlos",
    document: "1010174410",
    personId: "1080",
    searchHint: "CARLOS ANDRES RODRIGUEZ",
    expectClassificationPending: true,
    expectNoDomainSelector: true,
  },
  {
    key: "aura",
    document: "1042448655",
    personId: "1297",
    searchHint: "AURA MARCELA ROYERO",
    expectClassificationPending: true,
    expectNoDomainSelector: true,
  },
];

async function loginViaDevEmail(page: Page, email: string): Promise<void> {
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
  if (!Array.isArray(data.user.permissions)) {
    data.user.permissions = [];
  }

  // Evitar pasar por LoginPage (race: fetchProfileMe → logout).
  await page.addInitScript(
    ({ accessToken, user }) => {
      sessionStorage.setItem("organigrama.accessToken", accessToken);
      sessionStorage.setItem("organigrama.authUser", JSON.stringify(user));
      sessionStorage.setItem("organigrama.profileCompleted", "true");
    },
    { accessToken: data.accessToken, user: data.user },
  );

  await page.goto(`${FRONTEND_BASE}/org`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/org/, { timeout: 30_000 });
  await expect(
    page.getByRole("region", { name: "Mapa del organigrama" }),
  ).toBeVisible({ timeout: 90_000 });
  // Estabilizar: confirmar que no hubo redirect a login
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/org/);
}

async function openPersonCompetencies(
  page: Page,
  profile: CohortCase,
): Promise<void> {
  await expect(page).toHaveURL(/\/org/, { timeout: 15_000 });

  const search = page
    .getByRole("searchbox", { name: /Buscar en el organigrama/i })
    .or(page.getByPlaceholder(/Buscar persona o plaza/i));
  await expect(search.first()).toBeVisible({ timeout: 30_000 });
  await search.first().click();
  await search.first().fill("");
  await search.first().fill(profile.searchHint.split(" ").slice(0, 3).join(" "));
  await page.waitForTimeout(900);

  const openFicha = page.getByRole("button", {
    name: new RegExp(
      `Abrir ficha de ${profile.searchHint.split(" ")[0]}`,
      "i",
    ),
  });
  await expect(openFicha.first()).toBeVisible({ timeout: 25_000 });
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
  await page.waitForTimeout(1800);

  const loading = page.getByLabel(/Cargando competencias/i);
  if (await loading.isVisible().catch(() => false)) {
    await expect(loading).toBeHidden({ timeout: 60_000 });
  }
}

function loadApiCounts(document: string) {
  const path = resolve(ARTIFACT_ROOT, "api-responses", `${document}.json`);
  if (!existsSync(path)) return null;
  const data = JSON.parse(readFileSync(path, "utf8")) as {
    mvpCapabilities?: {
      consolidated: unknown[];
      complementary: unknown[];
      emerging: unknown[];
      tools: unknown[];
      methodologies: unknown[];
    } | null;
  };
  const m = data.mvpCapabilities;
  if (!m) return null;
  return {
    consolidated: m.consolidated?.length ?? 0,
    complementary: m.complementary?.length ?? 0,
    emerging: m.emerging?.length ?? 0,
    tools: m.tools?.length ?? 0,
    methodologies: m.methodologies?.length ?? 0,
  };
}

async function countSectionItems(
  panel: ReturnType<Page["locator"]>,
  title: string,
): Promise<number> {
  const section = panel
    .locator("section")
    .filter({ has: panel.page().getByText(title, { exact: true }) })
    .first();
  if ((await section.count()) === 0) return 0;
  // tools use li chips; caps use li rows
  return section.locator("li").count();
}

test.describe("MC1 C2 school coordinators browser verification", () => {
  test("fichas + capturas + comparación API/DOM", async ({ page }) => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    mkdirSync(RESPONSIVE_DIR, { recursive: true });

    const consoleErrors: Array<{ document: string; text: string }> = [];
    const networkErrors: Array<{
      document: string;
      url: string;
      status: number;
    }> = [];
    let currentDoc = "";

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({ document: currentDoc, text: msg.text() });
      }
    });
    page.on("response", (res) => {
      const status = res.status();
      if (status >= 400 && res.url().includes("/api/")) {
        networkErrors.push({
          document: currentDoc,
          url: res.url(),
          status,
        });
      }
    });

    await loginViaDevEmail(page, "desarrollofabrica@cun.edu.co");

    const visibleRows: Array<Record<string, unknown>> = [];
    const perPerson: Array<Record<string, unknown>> = [];

    for (const profile of COHORT) {
      currentDoc = profile.document;
      await openPersonCompetencies(page, profile);

      const panel = page
        .locator("#person-panel-competencias, .mc-explorer")
        .first();
      await expect(panel).toBeVisible({ timeout: 20_000 });

      const bodyText = await panel.innerText();
      expect(bodyText).not.toMatch(/\bSECONDARY_SIGNAL\b/);
      expect(bodyText).not.toMatch(/\bPRIMARY_MATCH\b/);
      expect(bodyText).not.toMatch(/\bACADEMIC_MANAGEMENT\b/);

      if (profile.expectClassificationPending) {
        await expect(
          panel.getByText(/Perfil profesional en proceso de clasificación/i),
        ).toBeVisible();
      }

      if (profile.expectDomain) {
        await expect(panel.getByText(profile.expectDomain).first()).toBeVisible();
        await expect(
          panel.getByText(/Capacidades profesionales complementarias/i).first(),
        ).toBeVisible();
      }

      // No selector vacío / multidominio innecesario
      const domainTabs = panel.getByRole("tablist");
      if (profile.expectNoDomainSelector) {
        expect(await domainTabs.count()).toBe(0);
      }

      const consolidated = await countSectionItems(
        panel,
        "Competencias consolidadas",
      );
      const complementary = await countSectionItems(
        panel,
        "Competencias complementarias",
      );
      const emerging = await countSectionItems(
        panel,
        "Capacidades emergentes",
      );
      const tools = await countSectionItems(panel, "Herramientas");
      const methodologies = await countSectionItems(panel, "Metodologías");

      const api = loadApiCounts(profile.document);
      if (api) {
        expect(consolidated).toBe(api.consolidated);
        expect(complementary).toBe(api.complementary);
        expect(emerging).toBe(api.emerging);
        expect(tools).toBe(api.tools);
        expect(methodologies).toBe(api.methodologies);
      }

      // Debe haber contenido MVP (no solo mensaje vacío)
      expect(consolidated + complementary + emerging + tools).toBeGreaterThan(
        0,
      );

      const shotName = `${profile.document}-${profile.key}.png`;
      await panel.screenshot({
        path: resolve(SCREENSHOT_DIR, shotName),
        animations: "disabled",
      });
      // también copia con el nombre pedido en la raíz browser-verification
      await panel.screenshot({
        path: resolve(ARTIFACT_ROOT, shotName),
        animations: "disabled",
      });

      if (profile.key === "viviana") {
        await page.screenshot({
          path: resolve(SCREENSHOT_DIR, `${profile.document}-viviana-full.png`),
          fullPage: true,
          animations: "disabled",
        });
      }

      visibleRows.push({
        document: profile.document,
        personKey: profile.key,
        api,
        visible: {
          consolidated,
          complementary,
          emerging,
          tools,
          methodologies,
        },
        deltaZero: api
          ? consolidated === api.consolidated &&
            complementary === api.complementary &&
            tools === api.tools
          : null,
      });

      perPerson.push({
        document: profile.document,
        consoleErrors: consoleErrors
          .filter((e) => e.document === profile.document)
          .map((e) => e.text),
        networkErrors: networkErrors.filter(
          (e) => e.document === profile.document,
        ),
        result: "PASS_PENDING_AGGREGATE",
      });

      // cerrar panel si hay botón
      const closeBtn = page.getByRole("button", {
        name: /Cerrar ficha|Cerrar detalle|Cerrar/i,
      });
      if (await closeBtn.first().isVisible().catch(() => false)) {
        await closeBtn.first().click();
        await page.waitForTimeout(400);
      } else {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
      }
    }

    // Responsive sample: Viviana + Aura
    for (const profile of [COHORT[0], COHORT[4]]) {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await openPersonCompetencies(page, profile);
      const panel = page.locator(".mc-explorer").first();
      await panel.screenshot({
        path: resolve(
          RESPONSIVE_DIR,
          `${profile.document}-desktop-1920.png`,
        ),
        animations: "disabled",
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(overflow).toBe(false);
      await panel.screenshot({
        path: resolve(RESPONSIVE_DIR, `${profile.document}-mobile-390.png`),
        animations: "disabled",
      });
      await page.keyboard.press("Escape");
      await page.setViewportSize({ width: 1280, height: 800 });
    }

    // Intermediate viewports smoke (Aura)
    for (const size of [
      { w: 1366, h: 768 },
      { w: 768, h: 1024 },
    ]) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await openPersonCompetencies(page, COHORT[4]);
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(overflow).toBe(false);
      await page.locator(".mc-explorer").first().screenshot({
        path: resolve(
          RESPONSIVE_DIR,
          `1042448655-aura-${size.w}x${size.h}.png`,
        ),
        animations: "disabled",
      });
      await page.keyboard.press("Escape");
    }

    writeFileSync(
      resolve(ARTIFACT_ROOT, "render-comparison.json"),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          rows: visibleRows,
        },
        null,
        2,
      )}\n`,
    );

    writeFileSync(
      resolve(ARTIFACT_ROOT, "console-report.json"),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          env: {
            backend: API_BASE,
            frontend: FRONTEND_BASE,
            mocks: false,
          },
          consoleErrors,
          networkErrors,
          people: perPerson,
        },
        null,
        2,
      )}\n`,
    );
  });
});
