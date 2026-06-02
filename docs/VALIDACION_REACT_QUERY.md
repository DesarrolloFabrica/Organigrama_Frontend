# Validación técnica — React Query + cache visual organigrama

**Fecha:** 2026-06-01  
**Alcance:** Revisión de código, corrección de bugs, `npm run build`. Sin nuevas funcionalidades ni cambios de diseño.

---

## Archivos revisados

| Área | Archivos |
|------|----------|
| Sesión visual | `orgChartMainSession.ts`, `appLogout.ts`, `LogoutButton.tsx`, `OnboardingPage.tsx`, `LoginPage.tsx`, `OrgChartPage.tsx` |
| Viewport / mapa | `OrgMapView.tsx` |
| Prefetch | `orgChartPrefetch.ts` |
| Invalidaciones | `invalidations.ts`, `useProfileMutations.ts` |
| Carga UI | `PersonDetailPanel.tsx`, `NodeSummaryPanel.tsx`, `OrgChartSearchPanel.tsx`, guards, `OrgChartPage.tsx`, `OrgChartExplorePage.tsx` |
| Telemetría | `devTelemetry.ts`, `BootLoadingPage.tsx` |
| React Query | `queryClient.ts`, hooks en `lib/react-query/hooks/` |

---

## 1. Estado persistido del árbol

### Comportamiento esperado

- Snapshot ligado al usuario autenticado (`AuthUser.personId`).
- Limpieza en logout y en login de otro usuario.
- No reutilizar árbol/expansión/viewport de sesión anterior.

### Hallazgos

| ID | Severidad | Descripción |
|----|-----------|-------------|
| S1 | **Alta** | `orgChartMainSession` no guardaba `ownerKey`: otro usuario en la misma pestaña podía leer `sessionStorage` v1 con árbol ajeno. |
| S2 | **Media** | `OnboardingPage` solo llamaba `clearAuthSession()` al cerrar sesión (no limpiaba cache visual ni React Query). |
| S3 | **Media** | `LoginPage` no limpiaba snapshot al iniciar sesión con Google (riesgo si se reutiliza pestaña sin logout explícito previo). |

### Correcciones aplicadas

- `ownerKey` obligatorio en snapshot (`organigrama.orgChartMain.v2`).
- `getOrgChartMainSession()` valida `ownerKey === getAuthUser().personId`; si no coincide, `clearOrgChartMainSession()` y retorna `null`.
- Elimina clave legacy `organigrama.orgChartMain.v1` al limpiar.
- `performAppLogout()` centraliza: auth, profile gate, sesión visual, prefetch in-flight, `queryClient.clear()`.
- Usado en `LogoutButton`, `OnboardingPage`, y antes de `saveAuthSession` en login Google.

### Verificación estática

- Logout → `memorySession = null`, `sessionStorage` sin clave v2.
- Login nuevo usuario → `performAppLogout` antes de guardar token.
- Montaje `/org` → `getOrgChartMainSession()` solo devuelve datos del `personId` actual.

---

## 2. Viewport y expansión

### Comportamiento esperado

Al volver de `/org/team/:personId` a `/org`:

- zoom, posición, selección, expansión (`showRootChildren`, `expandedHubNodeId`), ficha minimizada, `expandedNodeId` (resumen).
- `OrgMapInitialCenter` deshabilitado si hay viewport guardado (`cameraNonce === 0 && !hasPersistedViewport`).

### Hallazgos

| ID | Severidad | Descripción |
|----|-----------|-------------|
| V1 | **Media** | Al cambiar expansión, el efecto persistía `viewport` desde la prop `persistedMapState` y podía pisar el viewport actualizado por pan/zoom antes de que el padre recibiera `onEnd`. |

### Correcciones aplicadas

- `lastViewportRef` en `OrgMapView`: el efecto de expansión usa el último viewport conocido (restaurado o `onMoveEnd`), no solo la prop inicial.

### Verificación estática

- `OrgChartPage` restaura estado desde `getOrgChartMainSession()` en primer montaje.
- `persistSnapshot()` antes de `navigate` a equipo.
- `key="org-main-map"` evita remount por cambio de `tree.id`.

### Prueba manual recomendada

1. En `/org`: expandir root, pan/zoom, seleccionar persona, minimizar ficha.
2. Explorar equipo → `/org/team/:id`.
3. Volver (botón o `/org`).
4. Confirmar que mapa, selección y resumen coinciden con el paso 1.

---

## 3. Prefetch inteligente

### Comportamiento esperado

- Solo hijos directos del array `children` pasado a `prefetchDirectChildrenHints` (sin recursión).
- Sin tormenta de requests duplicados en la misma expansión.

### Hallazgos

| ID | Severidad | Descripción |
|----|-----------|-------------|
| P1 | **Baja** | Varios `onDirectChildrenVisible` seguidos podían lanzar `prefetchQuery` en paralelo para la misma key antes de completar la primera. |

### Correcciones aplicadas

- Set `inflightPrefetchKeys`: omite prefetch si ya hay uno en vuelo para la misma key.
- Sigue respetando cache React Query (`getQueryData` → HIT, sin red).
- `clearPrefetchHintsState()` en logout.

### Verificación estática

- `prefetchDirectChildrenHints` itera solo `children[]` del argumento.
- `ensureChildrenLoaded` pasa `node.children` o resultado de `onLoadChildren`, nunca nietos.

---

## 4. Invalidaciones focalizadas

### Comportamiento esperado

Tras PATCH perfil / foto Google:

- `["profile"]`, `["onboarding-status"]`, `["org-root"]`
- Solo `["org-node", personId]`, `["org-person-detail", personId]`, `["org-summary", personId]` del usuario editado.

### Hallazgos

Ninguno en código actual. `invalidateAfterProfileChange(client, profile)` ya recibe `profile.personId`.

### Verificación estática

- `usePatchProfile` / `usePostPhotoFromGoogle`: `setQueryData(profile)` + `invalidateAfterProfileChange(queryClient, data)`.
- `PersonDetailPanel`: `useOrgPersonDetail` se invalida para ese `personId` → refetch con datos nuevos.

### Prueba manual recomendada

Editar perfil / foto → abrir ficha propia → datos actualizados sin refrescar toda la app.

---

## 5. Estados de carga

### Patrón adoptado

| Componente | Skeleton / loader |
|------------|-------------------|
| `PersonDetailPanel` | `isLoading && !detail` |
| `NodeSummaryPanel` | `isLoading && !data` |
| `OrgChartSearchPanel` | `isLoading && results === undefined` |
| `OrgChartPage` route overlay | `isRootLoading && !tree` (con sesión restaurada, `tree` existe → sin overlay) |
| `OrgChartExplorePage` | `isLoading && !tree` + `keepPreviousData` en node |
| Guards | `isLoading && !profile` |

No se añadieron spinners por `isFetching && data` (opcional futuro); con cache + `keepPreviousData` la UI permanece visible.

---

## 6. Telemetría dev

### Verificación

- `devTelemetry.ts`: todas las funciones salen si `!import.meta.env.DEV`.
- `orgChartPrefetch.ts`: log extra in-flight solo con `import.meta.env.DEV`.
- `BootLoadingPage`: log warmup solo en DEV.
- Build producción (`vite build`): `import.meta.env.DEV === false` → código de log eliminado o no ejecutado.

---

## 7. Build y smoke test

### Build

```text
npm run build → exit 0 (tsc -b && vite build)
```

### Smoke test manual (checklist)

Ejecutar en `npm run dev` con consola abierta (solo verás `[RQ …]` en desarrollo):

- [ ] Login Google
- [ ] Onboarding (si aplica) + guardar perfil
- [ ] `/loading` → `/org`
- [ ] Expandir root + hijos (logs MISS/HIT en prefetch)
- [ ] Abrir ficha de colaborador
- [ ] Ir a `/org/team/:personId`
- [ ] Volver a `/org` (estado visual restaurado)
- [ ] Editar perfil / foto (ficha propia coherente)
- [ ] Logout
- [ ] Login con otra cuenta (sin árbol de usuario anterior)

---

## Resumen ejecutivo

| Métrica | Resultado |
|---------|-----------|
| Bugs encontrados | 5 (S1–S3, V1, P1) |
| Bugs corregidos | 5 |
| Nuevas funcionalidades | 0 |
| Cambio diseño visual | No |
| Cambio lógica de negocio | No (solo aislamiento de sesión y persistencia más segura) |
| `npm run build` | OK |

---

## Referencia rápida post-fix

- Logout / login limpio: `auth/appLogout.ts`
- Sesión por usuario: `features/org-chart/state/orgChartMainSession.ts` (`ownerKey`)
- Prefetch: `lib/react-query/orgChartPrefetch.ts`
- Evidencia hooks: `lib/react-query/README.md`
