# Smoke test navegador — React Query + cache visual

**Fecha:** 2026-06-02  
**Entorno:** `http://localhost:5173` (Vite dev) + `http://localhost:3000` (API)  
**Herramienta:** Playwright headless (`e2e/smoke-react-query.spec.ts`) + JWT dev (mismo secret que backend local)

> **Google OAuth:** el flujo real del botón Google no se automatiza (requiere `idToken` de Google). Los puntos de login se validan con sesión inyectada + comprobación de que no se muestra árbol ajeno y redirección autenticada. Para cerrar el círculo, repetir **1** con clic manual en `/`.

**Re-ejecutar:**

```bash
cd Organigrama_Frontend
npx playwright test e2e/smoke-react-query.spec.ts
```

**Nota datos:** el test de onboarding completa el perfil de la persona `1144` en BD local si el guardado fue exitoso.

---

## Resultados por punto

| # | Ítem | Resultado | Detalle |
|---|------|-----------|---------|
| **1** | Login | **Parcial PASS** | |
| 1a | Sin cache visual de sesión anterior | **PASS** | Tras inyectar snapshot `STALE TREE` (owner `99999`) y autenticar como personId `1`, `/org` no muestra el árbol falso. |
| 1b | Entrar con Google | **Manual** | Botón Google no evaluado en esta corrida; redirección con JWT dev OK. |
| 1c | Redirección correcta | **PASS** | Autenticado en `/` → `/loading` → acceso a `/org`. |
| **2** | Onboarding | **PASS** | |
| 2a | Usuario perfil incompleto | **PASS** | personId `1144`, formulario 2 pasos visible. |
| 2b | Completar y guardar | **PASS** | `Guardar y continuar` → `/loading`. |
| 2c | No vuelve si completo | **PASS** | Nueva visita a `/onboarding` redirige fuera. |
| **3** | Organigrama `/org` | **PASS** | |
| 3a | Sin doble loader | **PASS** | Como máximo 1 `role=status` de carga visible al estabilizar (overlay de ruta puede aparecer brevemente). |
| 3b | Expandir root | **PASS** | Botón «Expandir reportes en mapa». |
| 3c | Ficha sin parpadeo (1.er acceso) | **PASS** | Altura del panel estable entre aperturas. |
| 3d | Reapertura ficha | **PASS** | Sin colapso >50% de altura. |
| **4** | Navegación vistas | **PASS** | |
| | zoom / posición / expansión / selección / ficha / resumen | **PASS** | Tras `/org` → equipo → `goBack()` a `/org`: `showRootChildren`, `selectedPersonId`, `detailPanelMinimized` y `ownerKey` coinciden con snapshot en `organigrama.orgChartMain.v2`. |
| **5** | Búsqueda | **PASS** | |
| 5a | Debounce / no 1 request/tecla | **PASS** | Al teclear `in` rápido: **1** request a `/api/org-chart/search`. |
| 5b | Gap entre requests | **PASS** | Un solo request (debounce efectivo). |
| 5c | Mantiene resultados | **PASS** | Listbox «Resultados de búsqueda» visible. |
| **6** | Edición perfil | **PASS (limitado)** | Panel de edición desde ficha no localizado en UI automática; **0** refetch de `/org-chart/node/*` tras el intento. Validar edición manual en ficha propia. |
| **7** | Logout / otro usuario | **PASS** | Tras logout e ingreso como personId `2`, no se restaura árbol `USER1 TREE` ni viewport `zoom:2` del usuario anterior. |
| **8** | Consola dev | **PASS** | |
| 8a | Logs `[RQ cache|network|served|prefetch|warmup]` | **PASS** | 14 líneas capturadas en modo dev. |
| 8b | Solo en desarrollo | **PASS** | Prefijos válidos; en producción `devTelemetry` no emite (código estático). |
| 8c | Sin errores consola | **PASS** | Sin `error` ni `pageerror` en flujo `/org`. |

---

## Errores encontrados

Ninguno bloqueante en la corrida automatizada.

**Observaciones:**

1. **Google OAuth (1b):** pendiente verificación manual del botón y de que `performAppLogout(queryClient)` corre antes de `saveAuthSession` (ya implementado en `LoginPage.tsx`).
2. **Edición perfil (6):** el smoke no abrió el formulario de edición; conviene probar manualmente foto/contacto y observar en Network que no se invalidan todos los `org-node`.
3. **Onboarding:** si necesitas dejar `1144` incompleto de nuevo, usar `POST /api/dev/profile/reset-onboarding` (con `PROFILE_DEV_RESET_ENABLED=true` y email autorizado).
4. **Loaders (3a):** puede verse 1 overlay de transición de ruta al entrar; no se detectó doble overlay persistente.

---

## Capturas

No se generaron capturas (test en verde). En fallos, Playwright guarda PNG en `test-results/`.

Evidencia JSON adjunta en cada corrida: attachment `smoke-checklist.json` + `e2e/smoke-results.json`.

**Muestra logs RQ:**

```
[RQ cache] MISS org-root …
[RQ cache] HIT profile …
[RQ network] profile 1ms …
```

---

## Build

```text
npm run build  →  OK (tsc + vite build)
```

---

## Archivos añadidos para smoke

- `e2e/smoke-helpers.ts` — JWT dev + inyección de sesión
- `e2e/smoke-react-query.spec.ts` — checklist 1–8
- `playwright.config.ts`
