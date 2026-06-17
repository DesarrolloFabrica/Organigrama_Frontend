import { test, expect, type Page, type Request } from "@playwright/test";
import {
  API_BASE,
  NORMAL_PROFILE,
  TECH_PROFILE,
  injectDevSession,
  mintDevToken,
} from "./org-versioning-helpers";

const DAVID_ID = "1165";
const PARENT_ID = "1162";
const BORRADOR_ID = 4;
const ACTIVE_ID = 3;
const BORRADOR_CODE = "borrador-nueva-plantilla";

const MAP_REGION = "Mapa del organigrama";

type RequestLog = {
  urls: string[];
};

function collectOrgRequests(page: Page): RequestLog {
  const log: RequestLog = { urls: [] };
  page.on("request", (req: Request) => {
    const url = req.url();
    if (url.includes("/api/org-chart/")) {
      log.urls.push(url);
    }
  });
  return log;
}

async function bootOrg(page: Page): Promise<void> {
  await page.goto("/org");
  await expect(page.getByRole("region", { name: MAP_REGION })).toBeVisible({
    timeout: 60_000,
  });
}

function hasVersionId4(urls: string[]): boolean {
  return urls.some((u) => /[?&]versionId=0*4(?:&|$)/.test(u));
}

function hasBorradorCode(urls: string[]): boolean {
  return urls.some((u) => u.toLowerCase().includes("versioncode=borrador"));
}

function hasVersionsList(urls: string[]): boolean {
  return urls.some((u) => /\/api\/org-chart\/versions(?:\?|$)/.test(u));
}

async function childrenIncludesDavid(
  token: string,
  versionId: number,
): Promise<boolean> {
  const res = await fetch(
    `${API_BASE}/api/org-chart/children/${PARENT_ID}?versionId=${versionId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`children/${PARENT_ID}?versionId=${versionId} → ${res.status}`);
  }
  const json = (await res.json()) as Array<{ id?: string | number }>;
  return Array.isArray(json) && json.some((n) => String(n?.id) === DAVID_ID);
}

test.describe("Versionamiento — aislamiento del borrador", () => {
  // ── Caso 1: usuario técnico autorizado ──
  test("técnico ve selector, cambia a borrador y David se desconecta de 1162", async ({
    page,
  }) => {
    const { token } = await injectDevSession(page, TECH_PROFILE);
    const reqLog = collectOrgRequests(page);

    await bootOrg(page);

    // Barra de versionamiento visible
    const versionBar = page.getByLabel("Versionamiento del organigrama");
    await expect(versionBar).toBeVisible({ timeout: 30_000 });

    // Solo las dos versiones esperadas en el selector
    const select = versionBar.locator("select");
    await expect(select).toBeVisible();
    const optionTexts = (await select.locator("option").allTextContents()).map((t) =>
      t.trim(),
    );
    expect(optionTexts).toEqual([
      "Periodo febrero - junio 2026 (vigente)",
      "Borrador nueva plantilla (borrador)",
    ]);

    // Cambiar al borrador → debe dispararse request con versionId=4
    reqLog.urls.length = 0;
    await select.selectOption(String(BORRADOR_ID));
    await expect
      .poll(() => hasVersionId4(reqLog.urls), { timeout: 20_000 })
      .toBe(true);

    // Aislamiento de datos: David NO es hijo de 1162 en el borrador
    const davidInBorrador = await childrenIncludesDavid(token, BORRADOR_ID);
    expect(davidInBorrador, "David no debe estar conectado a 1162 en el borrador").toBe(
      false,
    );

    // Volver a la versión vigente → David SÍ es hijo de 1162
    await select.selectOption(String(ACTIVE_ID));
    await page.waitForTimeout(500);
    const davidInActive = await childrenIncludesDavid(token, ACTIVE_ID);
    expect(davidInActive, "David debe estar conectado a 1162 en la versión vigente").toBe(
      true,
    );
  });

  // ── Caso 2: usuario normal ──
  test("usuario normal no ve versionamiento ni hace llamadas al borrador", async ({
    page,
  }) => {
    await injectDevSession(page, NORMAL_PROFILE);
    const reqLog = collectOrgRequests(page);

    await bootOrg(page);
    await page.waitForTimeout(1500);

    // Sin barra, sin selector, sin textos ni botones de versionamiento
    await expect(page.getByLabel("Versionamiento del organigrama")).toHaveCount(0);
    await expect(page.getByText("Borrador nueva plantilla")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Crear snapshot" })).toHaveCount(0);

    // Red: ninguna llamada a versions, versionId=4 ni versionCode=borrador
    expect(hasVersionsList(reqLog.urls), "no debe listar versiones").toBe(false);
    expect(hasVersionId4(reqLog.urls), "no debe pedir versionId=4").toBe(false);
    expect(hasBorradorCode(reqLog.urls), "no debe pedir versionCode=borrador").toBe(
      false,
    );
  });

  // ── Caso 3: usuario normal con storage manipulado ──
  test("usuario normal con storage versionId=4 manipulado: se ignora", async ({
    page,
  }) => {
    await injectDevSession(page, NORMAL_PROFILE);

    // Inyectar versionId=4 en storage conocido del organigrama ANTES de cargar /org
    await page.evaluate(
      ({ ownerKey }) => {
        sessionStorage.setItem(
          "organigrama.orgChartMain.v2",
          JSON.stringify({
            ownerKey,
            versionId: 4,
            tree: null,
            selectedPersonId: null,
            detailPanelMinimized: false,
            expandedNodeId: null,
            map: {
              showRootChildren: false,
              expandedHubNodeId: null,
              viewport: null,
            },
          }),
        );
        localStorage.setItem("organigrama.selectedVersionId", "4");
        localStorage.setItem("selectedVersionId", "4");
      },
      { ownerKey: NORMAL_PROFILE.personId },
    );

    const reqLog = collectOrgRequests(page);
    await bootOrg(page);
    await page.waitForTimeout(1500);

    // El frontend ignora el valor: sin selector y sin requests con versionId=4
    await expect(page.getByLabel("Versionamiento del organigrama")).toHaveCount(0);
    expect(hasVersionId4(reqLog.urls), "no debe usar versionId=4 heredado").toBe(false);
    expect(hasVersionsList(reqLog.urls), "no debe listar versiones").toBe(false);
  });

  // ── Caso 4: usuario normal forzando API directamente ──
  test("usuario normal forzando API de versión recibe 403", async () => {
    const token = await mintDevToken(NORMAL_PROFILE);
    const headers = { Authorization: `Bearer ${token}` };

    const endpoints = [
      `/api/org-chart/root?versionId=${BORRADOR_ID}`,
      `/api/org-chart/children/${PARENT_ID}?versionId=${BORRADOR_ID}`,
      `/api/org-chart/person/${DAVID_ID}?versionId=${BORRADOR_ID}`,
      `/api/org-chart/search?q=david&versionId=${BORRADOR_ID}`,
      `/api/org-chart/versions`,
      `/api/org-chart/root?versionCode=${BORRADOR_CODE}`,
    ];

    for (const path of endpoints) {
      const res = await fetch(`${API_BASE}${path}`, { headers });
      expect(res.status, `${path} debe responder 403`).toBe(403);
    }
  });
});
