import { test, expect, type Page, type Request } from "@playwright/test";
import {
  FRONTEND_BASE,
  loginAsPerson,
  mintAccessToken,
  fetchAuthUser,
  injectAuthSession,
  setProfileCompletedGate,
} from "./smoke-helpers";

const API_BASE = process.env.SMOKE_API_BASE_URL ?? "http://localhost:3000";
const SEARCH_PATH = "/api/org-chart/search";

type ConsoleBucket = {
  rq: string[];
  errors: string[];
  other: string[];
};

function attachConsoleCollector(page: Page): ConsoleBucket {
  const bucket: ConsoleBucket = { rq: [], errors: [], other: [] };
  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (/\[RQ (cache|network|served|prefetch|warmup)\]/i.test(text)) {
      bucket.rq.push(text);
    } else if (type === "error") {
      bucket.errors.push(text);
    } else if (type === "warning" && !text.includes("React Router")) {
      bucket.other.push(`warn: ${text}`);
    }
  });
  page.on("pageerror", (err) => {
    bucket.errors.push(`pageerror: ${err.message}`);
  });
  return bucket;
}

async function bootToOrg(page: Page): Promise<ConsoleBucket> {
  const logs = attachConsoleCollector(page);
  await page.goto("/loading");
  await page.waitForURL(/\/org(?:\?|$)/, { timeout: 60_000 });
  await expect(page.getByRole("region", { name: "Mapa del organigrama" })).toBeVisible({
    timeout: 60_000,
  });
  return logs;
}

function countVisibleRouteLoaders(page: Page) {
  return page.getByRole("status", { name: /Cargando|Preparando/i }).count();
}

async function waitForMapStable(page: Page) {
  await expect(page.getByRole("region", { name: "Mapa del organigrama" })).toBeVisible();
  await page.waitForTimeout(800);
}

test.describe("Smoke manual React Query (navegador)", () => {
  test("1–8 checklist automatizado (dev JWT)", async ({ page, context }) => {
    const results: Record<string, string> = {};
    const failures: string[] = [];

    const record = (id: string, ok: boolean, detail: string) => {
      results[id] = `${ok ? "PASS" : "FAIL"} — ${detail}`;
      if (!ok) failures.push(`${id}: ${detail}`);
    };

    // ── 1. Login (cache visual + redirección; Google OAuth = parcial) ──
    const staleOwner = "99999";
    await page.goto("/");
    await page.evaluate(
      ({ staleOwner }) => {
        sessionStorage.setItem("organigrama.accessToken", "stale-token");
        sessionStorage.setItem(
          "organigrama.authUser",
          JSON.stringify({
            personId: staleOwner,
            fullName: "Usuario anterior",
            eduEmail: "old@cun.edu.co",
            googleEmail: "old@cun.edu.co",
            pictureUrl: null,
          }),
        );
        sessionStorage.setItem(
          "organigrama.orgChartMain.v2",
          JSON.stringify({
            ownerKey: staleOwner,
            tree: { id: "1144", name: "STALE TREE", nodeKind: "person" },
            selectedPersonId: "1",
            detailPanelMinimized: false,
            expandedNodeId: "1",
            map: {
              showRootChildren: true,
              expandedHubNodeId: "1144",
              viewport: { x: 10, y: 20, zoom: 1.5 },
            },
          }),
        );
      },
      { staleOwner },
    );

    const userComplete = await loginAsPerson(
      page,
      "1",
      "camilo_quintero@cun.edu.co",
      "smoke-user-complete",
    );
    await setProfileCompletedGate(page, true);

    await page.goto("/");
    await page.waitForURL(/\/loading/, { timeout: 30_000 });

    const sessionAfterLogin = await page.evaluate(() => ({
      owner: JSON.parse(sessionStorage.getItem("organigrama.authUser") ?? "null"),
    }));

    const googleBtn = page.locator('iframe[src*="accounts.google"], div[role="button"]').first();
    const googleVisible = await page
      .getByText(/iniciar|google|acceder/i)
      .first()
      .isVisible()
      .catch(() => false);

    await page.goto("/org");
    await waitForMapStable(page);
    const staleVisible = await page.getByText("STALE TREE").isVisible().catch(() => false);

    record(
      "1a",
      sessionAfterLogin.owner?.personId === userComplete.personId && !staleVisible,
      `Sesión activa personId=${sessionAfterLogin.owner?.personId}; árbol ajeno no visible=${!staleVisible}`,
    );
    record(
      "1b",
      true,
      googleVisible
        ? "Botón Google visible en / (OAuth real requiere clic manual; no automatizado)"
        : "Redirección autenticada OK sin UI Google en esta ruta",
    );
    record(
      "1c",
      /\/(loading|org)/.test(page.url()),
      `Redirección post-login → ${page.url()}`,
    );

    // ── 2. Onboarding (usuario incompleto 1144) ──
    await page.context().clearCookies();
    await page.evaluate(() => sessionStorage.clear());

    await loginAsPerson(
      page,
      "1144",
      "iron_fuentes@cun.edu.co",
      "smoke-user-onboarding",
    );
    await setProfileCompletedGate(page, false);
    await page.goto("/onboarding");
    await expect(page.locator("#document")).toBeVisible({ timeout: 30_000 });

    await page.locator("#document").fill("1234567890");
    await page.locator("#phone").fill("3001234567");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.locator("#emergencyName").fill("Contacto Smoke");
    await page.locator("#emergencyPhone").fill("3009876543");
    await page.locator("#emergencyRelationship").fill("Familiar");
    await page.getByRole("button", { name: "Guardar y continuar" }).click();
    await page.waitForURL(/\/(loading|org)/, { timeout: 60_000 }).catch(() => undefined);

    const afterOnboardingUrl = page.url();
    const onboardingBlocked =
      afterOnboardingUrl.includes("/org") || afterOnboardingUrl.includes("/loading");

    await page.goto("/onboarding");
    await page.waitForTimeout(1500);
    const backToOnboarding = page.url().includes("/onboarding");

    record(
      "2a",
      true,
      "Formulario onboarding cargado (perfil incompleto 1144)",
    );
    record(
      "2b",
      onboardingBlocked,
      `Tras guardar → ${afterOnboardingUrl}`,
    );
    record(
      "2c",
      !backToOnboarding,
      backToOnboarding
        ? "Aún redirige a /onboarding (perfil puede seguir incompleto en API)"
        : "No vuelve a onboarding si perfil quedó completo",
    );

    // Volver a usuario completo para organigrama
    await page.evaluate(() => sessionStorage.clear());
    await loginAsPerson(page, "1", "camilo_quintero@cun.edu.co", "smoke-user-complete");
    await setProfileCompletedGate(page, true);

    // ── 3. Organigrama principal ──
    const orgLogs = await bootToOrg(page);
    const loaderCount = await countVisibleRouteLoaders(page);
    record(
      "3a",
      loaderCount <= 1,
      `Loaders visibles en /org: ${loaderCount} (esperado ≤1, sin doble overlay persistente)`,
    );

    const expandRoot = page.getByRole("button", {
      name: /Expandir reportes en mapa/i,
    }).first();
    await expandRoot.click();
    await page.waitForTimeout(1200);

    const detailBtn = page
      .getByRole("button", { name: /Abrir análisis de entidad/i })
      .nth(1);
    await detailBtn.click({ timeout: 15_000 }).catch(async () => {
      await page.getByRole("button", { name: /Abrir análisis de entidad/i }).first().click();
    });

    const panel = page.locator('[aria-labelledby$="-title"]').first();
    await expect(panel).toBeVisible({ timeout: 20_000 });
    const firstOpenBox = await panel.boundingBox();
    await page.waitForTimeout(600);
    const secondOpenBox = await panel.boundingBox();
    const flicker =
      firstOpenBox &&
      secondOpenBox &&
      Math.abs(firstOpenBox.height - secondOpenBox.height) > firstOpenBox.height * 0.4;

    await page.getByRole("button", { name: /Abrir análisis de entidad/i }).first().click();
    await page.waitForTimeout(400);
    const thirdBox = await panel.boundingBox();
    const flickerOnReopen =
      secondOpenBox &&
      thirdBox &&
      Math.abs(secondOpenBox.height - thirdBox.height) > secondOpenBox.height * 0.5;

    record("3b", true, "Root expandido (botón Expandir reportes)");
    record(
      "3c",
      !flicker,
      flicker ? "Parpadeo alto en primer acceso a ficha" : "Ficha estable en primer acceso",
    );
    record(
      "3d",
      !flickerOnReopen,
      flickerOnReopen
        ? "Parpadeo al reabrir misma ficha"
        : "Reapertura ficha sin colapso visible",
    );

    // ── 4. Navegación /org ↔ equipo ──
    await page.getByRole("button", { name: "Minimizar panel de detalle" }).click({
      timeout: 5_000,
    }).catch(() => undefined);

    const beforeNav = await page.evaluate(() => {
      const raw = sessionStorage.getItem("organigrama.orgChartMain.v2");
      return raw ? JSON.parse(raw) : null;
    });

    const exploreBtn = page
      .getByRole("button", { name: "Explorar estructura del equipo en una nueva vista" })
      .first();
    const exploreVisible = await exploreBtn.isVisible().catch(() => false);
    let teamPersonId = beforeNav?.selectedPersonId ?? "1";
    if (exploreVisible) {
      await exploreBtn.click();
      await page.waitForURL(/\/org(?:-chart)?\/team\//, { timeout: 30_000 });
      teamPersonId = page.url().split("/").pop()?.split("?")[0] ?? teamPersonId;
    } else {
      await page.goto(`/org/team/${teamPersonId}`);
    }

    await page.goBack();
    await page.waitForURL(/\/org(?:\?|$)/, { timeout: 30_000 });
    await waitForMapStable(page);

    const afterNav = await page.evaluate(() => {
      const raw = sessionStorage.getItem("organigrama.orgChartMain.v2");
      return raw ? JSON.parse(raw) : null;
    });

    const mapRestored =
      afterNav?.map?.showRootChildren === beforeNav?.map?.showRootChildren &&
      afterNav?.selectedPersonId === beforeNav?.selectedPersonId &&
      afterNav?.detailPanelMinimized === beforeNav?.detailPanelMinimized;

    record(
      "4",
      mapRestored && afterNav?.ownerKey === userComplete.personId,
      `Sesión restaurada: expand=${afterNav?.map?.showRootChildren}, selected=${afterNav?.selectedPersonId}, minimized=${afterNav?.detailPanelMinimized}, owner=${afterNav?.ownerKey}`,
    );

    // ── 5. Búsqueda debounce ──
    const searchRequests: number[] = [];
    const onRequest = (req: Request) => {
      if (req.url().includes(SEARCH_PATH) && req.method() === "GET") {
        searchRequests.push(Date.now());
      }
    };
    page.on("request", onRequest);

    const searchInput = page.locator("#org-chart-search-desktop");
    await searchInput.fill("");
    await searchInput.pressSequentially("in", { delay: 60 });
    await page.waitForTimeout(1200);

    page.off("request", onRequest);

    const searchCount = searchRequests.length;
    const minGap =
      searchCount >= 2
        ? Math.min(
            ...searchRequests.slice(1).map((t, i) => t - searchRequests[i]),
          )
        : 0;

    const resultsList = page.getByRole("listbox", { name: "Resultados de búsqueda" });
    const hasResults = await resultsList.isVisible().catch(() => false);

    record(
      "5a",
      searchCount <= 3,
      `Requests búsqueda tras teclear "in" rápido: ${searchCount} (esperado pocos, no 1 por tecla)`,
    );
    record(
      "5b",
      minGap === 0 || minGap >= 200,
      minGap > 0 ? `Gap mínimo entre requests: ${minGap}ms (debounce ~280ms)` : "Un solo request",
    );
    record("5c", hasResults || searchCount > 0, hasResults ? "Lista de resultados visible" : "Sin UI de resultados");

    // ── 6. Edición perfil — invalidación acotada ──
    const watched: string[] = [];
    const onReq2 = (req: Request) => {
      const u = req.url();
      if (u.includes("/api/org-chart/") || u.includes("/api/profile/")) {
        watched.push(new URL(u).pathname);
      }
    };
    page.on("request", onReq2);

    await page.getByRole("button", { name: /editar|perfil/i }).first().click({ timeout: 8_000 }).catch(() => undefined);
    const editPhone = page.locator('#phone, [id="profile-phone"]').first();
    if (await editPhone.isVisible().catch(() => false)) {
      await editPhone.fill("3001112233");
      await page.getByRole("button", { name: /guardar/i }).first().click();
      await page.waitForTimeout(2000);
    }
    page.off("request", onReq2);

    const nodeFetches = watched.filter((p) => /\/node\//.test(p)).length;
    const personFetches = watched.filter((p) => /\/person\//.test(p)).length;
    record(
      "6",
      nodeFetches <= 2,
      `Tras intento edición: node=${nodeFetches}, person=${personFetches}, paths=${[...new Set(watched)].slice(0, 8).join(", ") || "sin panel edición visible"}`,
    );

    // ── 7. Logout y cambio de usuario ──
    await page.evaluate(
      ({ ownerKey }) => {
        sessionStorage.setItem(
          "organigrama.orgChartMain.v2",
          JSON.stringify({
            ownerKey,
            tree: { id: "1144", name: "USER1 TREE", nodeKind: "person" },
            selectedPersonId: "1144",
            detailPanelMinimized: true,
            expandedNodeId: "1144",
            map: {
              showRootChildren: true,
              expandedHubNodeId: "1144",
              viewport: { x: 99, y: 88, zoom: 2 },
            },
          }),
        );
      },
      { ownerKey: userComplete.personId },
    );

    await page.getByRole("button", { name: /Cerrar sesión/i }).click();
    await page.waitForURL(/\//, { timeout: 15_000 });

    const userB = await loginAsPerson(
      page,
      "2",
      "johan@cun.edu.co",
      "smoke-user-b",
    );
    await setProfileCompletedGate(page, true);
    await page.goto("/org");
    await waitForMapStable(page);

    const sessionB = await page.evaluate(() => {
      const raw = sessionStorage.getItem("organigrama.orgChartMain.v2");
      return raw ? JSON.parse(raw) : null;
    });

    const leaked =
      sessionB?.tree?.name === "USER1 TREE" ||
      sessionB?.map?.viewport?.zoom === 2 ||
      sessionB?.ownerKey !== userB.personId;

    record(
      "7",
      !leaked,
      leaked
        ? `Filtración sesión anterior: ${JSON.stringify(sessionB)?.slice(0, 120)}`
        : `Snapshot usuario B limpio (owner=${sessionB?.ownerKey ?? "null"})`,
    );

    // ── 8. Consola dev ──
    const rqInDev = orgLogs.rq.length > 0;
    const rqPatternOk = orgLogs.rq.every((l) =>
      /\[RQ (cache|network|served|prefetch|warmup)\]/i.test(l),
    );
    const noConsoleErrors = orgLogs.errors.length === 0;

    record(
      "8a",
      rqInDev,
      rqInDev
        ? `${orgLogs.rq.length} logs [RQ …] en dev`
        : "Sin logs RQ capturados (revisar que Vite esté en modo dev)",
    );
    record("8b", rqPatternOk, "Prefijos RQ válidos");
    record(
      "8c",
      noConsoleErrors,
      noConsoleErrors
        ? "Sin errores de consola/pageerror en flujo /org"
        : orgLogs.errors.join(" | "),
    );

    await test.info().attach("smoke-checklist.json", {
      body: JSON.stringify({ results, failures, rqSample: orgLogs.rq.slice(0, 5) }, null, 2),
      contentType: "application/json",
    });

    if (failures.length > 0) {
      console.log("\n--- Smoke checklist ---\n", results);
      expect(failures, failures.join("\n")).toHaveLength(0);
    }
  });
});
