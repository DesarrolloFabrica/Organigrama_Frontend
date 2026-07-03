# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke-react-query.spec.ts >> Smoke manual React Query (navegador) >> 1–8 checklist automatizado (dev JWT)
- Location: e2e\smoke-react-query.spec.ts:59:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, type Page, type Request } from "@playwright/test";
  2   | import {
  3   |   FRONTEND_BASE,
  4   |   loginAsPerson,
  5   |   mintAccessToken,
  6   |   fetchAuthUser,
  7   |   injectAuthSession,
  8   |   setProfileCompletedGate,
  9   | } from "./smoke-helpers";
  10  | 
  11  | const API_BASE = process.env.SMOKE_API_BASE_URL ?? "http://localhost:3000";
  12  | const SEARCH_PATH = "/api/org-chart/search";
  13  | 
  14  | type ConsoleBucket = {
  15  |   rq: string[];
  16  |   errors: string[];
  17  |   other: string[];
  18  | };
  19  | 
  20  | function attachConsoleCollector(page: Page): ConsoleBucket {
  21  |   const bucket: ConsoleBucket = { rq: [], errors: [], other: [] };
  22  |   page.on("console", (msg) => {
  23  |     const text = msg.text();
  24  |     const type = msg.type();
  25  |     if (/\[RQ (cache|network|served|prefetch|warmup)\]/i.test(text)) {
  26  |       bucket.rq.push(text);
  27  |     } else if (type === "error") {
  28  |       bucket.errors.push(text);
  29  |     } else if (type === "warning" && !text.includes("React Router")) {
  30  |       bucket.other.push(`warn: ${text}`);
  31  |     }
  32  |   });
  33  |   page.on("pageerror", (err) => {
  34  |     bucket.errors.push(`pageerror: ${err.message}`);
  35  |   });
  36  |   return bucket;
  37  | }
  38  | 
  39  | async function bootToOrg(page: Page): Promise<ConsoleBucket> {
  40  |   const logs = attachConsoleCollector(page);
  41  |   await page.goto("/loading");
  42  |   await page.waitForURL(/\/org(?:\?|$)/, { timeout: 60_000 });
  43  |   await expect(page.getByRole("region", { name: "Mapa del organigrama" })).toBeVisible({
  44  |     timeout: 60_000,
  45  |   });
  46  |   return logs;
  47  | }
  48  | 
  49  | function countVisibleRouteLoaders(page: Page) {
  50  |   return page.getByRole("status", { name: /Cargando|Preparando/i }).count();
  51  | }
  52  | 
  53  | async function waitForMapStable(page: Page) {
  54  |   await expect(page.getByRole("region", { name: "Mapa del organigrama" })).toBeVisible();
  55  |   await page.waitForTimeout(800);
  56  | }
  57  | 
  58  | test.describe("Smoke manual React Query (navegador)", () => {
  59  |   test("1–8 checklist automatizado (dev JWT)", async ({ page, context }) => {
  60  |     const results: Record<string, string> = {};
  61  |     const failures: string[] = [];
  62  | 
  63  |     const record = (id: string, ok: boolean, detail: string) => {
  64  |       results[id] = `${ok ? "PASS" : "FAIL"} — ${detail}`;
  65  |       if (!ok) failures.push(`${id}: ${detail}`);
  66  |     };
  67  | 
  68  |     // ── 1. Login (cache visual + redirección; Google OAuth = parcial) ──
  69  |     const staleOwner = "99999";
> 70  |     await page.goto("/");
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  71  |     await page.evaluate(
  72  |       ({ staleOwner }) => {
  73  |         sessionStorage.setItem("organigrama.accessToken", "stale-token");
  74  |         sessionStorage.setItem(
  75  |           "organigrama.authUser",
  76  |           JSON.stringify({
  77  |             personId: staleOwner,
  78  |             fullName: "Usuario anterior",
  79  |             eduEmail: "old@cun.edu.co",
  80  |             googleEmail: "old@cun.edu.co",
  81  |             pictureUrl: null,
  82  |           }),
  83  |         );
  84  |         sessionStorage.setItem(
  85  |           "organigrama.orgChartMain.v2",
  86  |           JSON.stringify({
  87  |             ownerKey: staleOwner,
  88  |             tree: { id: "1144", name: "STALE TREE", nodeKind: "person" },
  89  |             selectedPersonId: "1",
  90  |             detailPanelMinimized: false,
  91  |             expandedNodeId: "1",
  92  |             map: {
  93  |               showRootChildren: true,
  94  |               expandedHubNodeId: "1144",
  95  |               viewport: { x: 10, y: 20, zoom: 1.5 },
  96  |             },
  97  |           }),
  98  |         );
  99  |       },
  100 |       { staleOwner },
  101 |     );
  102 | 
  103 |     const userComplete = await loginAsPerson(
  104 |       page,
  105 |       "1",
  106 |       "camilo_quintero@cun.edu.co",
  107 |       "smoke-user-complete",
  108 |     );
  109 |     await setProfileCompletedGate(page, true);
  110 | 
  111 |     await page.goto("/");
  112 |     await page.waitForURL(/\/loading/, { timeout: 30_000 });
  113 | 
  114 |     const sessionAfterLogin = await page.evaluate(() => ({
  115 |       owner: JSON.parse(sessionStorage.getItem("organigrama.authUser") ?? "null"),
  116 |     }));
  117 | 
  118 |     const googleBtn = page.locator('iframe[src*="accounts.google"], div[role="button"]').first();
  119 |     const googleVisible = await page
  120 |       .getByText(/iniciar|google|acceder/i)
  121 |       .first()
  122 |       .isVisible()
  123 |       .catch(() => false);
  124 | 
  125 |     await page.goto("/org");
  126 |     await waitForMapStable(page);
  127 |     const staleVisible = await page.getByText("STALE TREE").isVisible().catch(() => false);
  128 | 
  129 |     record(
  130 |       "1a",
  131 |       sessionAfterLogin.owner?.personId === userComplete.personId && !staleVisible,
  132 |       `Sesión activa personId=${sessionAfterLogin.owner?.personId}; árbol ajeno no visible=${!staleVisible}`,
  133 |     );
  134 |     record(
  135 |       "1b",
  136 |       true,
  137 |       googleVisible
  138 |         ? "Botón Google visible en / (OAuth real requiere clic manual; no automatizado)"
  139 |         : "Redirección autenticada OK sin UI Google en esta ruta",
  140 |     );
  141 |     record(
  142 |       "1c",
  143 |       /\/(loading|org)/.test(page.url()),
  144 |       `Redirección post-login → ${page.url()}`,
  145 |     );
  146 | 
  147 |     // ── 2. Onboarding (usuario incompleto 1144) ──
  148 |     await page.context().clearCookies();
  149 |     await page.evaluate(() => sessionStorage.clear());
  150 | 
  151 |     await loginAsPerson(
  152 |       page,
  153 |       "1144",
  154 |       "iron_fuentes@cun.edu.co",
  155 |       "smoke-user-onboarding",
  156 |     );
  157 |     await setProfileCompletedGate(page, false);
  158 |     await page.goto("/onboarding");
  159 |     await expect(page.locator("#document")).toBeVisible({ timeout: 30_000 });
  160 | 
  161 |     await page.locator("#document").fill("1234567890");
  162 |     await page.locator("#phone").fill("3001234567");
  163 |     await page.getByRole("button", { name: "Continuar" }).click();
  164 |     await page.locator("#emergencyName").fill("Contacto Smoke");
  165 |     await page.locator("#emergencyPhone").fill("3009876543");
  166 |     await page.locator("#emergencyRelationship").fill("Familiar");
  167 |     await page.getByRole("button", { name: "Guardar y continuar" }).click();
  168 |     await page.waitForURL(/\/(loading|org)/, { timeout: 60_000 }).catch(() => undefined);
  169 | 
  170 |     const afterOnboardingUrl = page.url();
```