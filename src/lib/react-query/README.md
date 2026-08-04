# React Query — Organigrama OP

Capa oficial de datos del frontend ([TanStack Query](https://tanstack.com/query)).

## Configuración global

- `queryClient.ts` — `staleTime` 5 min, `gcTime` 30 min, sin refetch al foco, `retry: 1`.
- `QueryClientProvider` en `main.tsx`.

## Claves de cache (`queryKeys.ts`)

| Key | Uso |
|-----|-----|
| `["org-root"]` | Raíz del organigrama |
| `["org-node", personId]` | Vista exploración por persona |
| `["org-children", personId]` | Hijos directos (expansión lazy) |
| `["org-summary", personId]` | Resumen jerárquico del panel |
| `["org-person-detail", personId]` | Ficha técnica (`PersonDetailPanel`) |
| `["org-person-video", personId]` | Metadatos + ticket de Presentación |
| `["org-search", query]` | Búsqueda global (término ya recortado) |
| `["profile"]` | Perfil del usuario autenticado |
| `["onboarding-status"]` | Paso y flags derivados del onboarding |

## Hooks

| Hook | Servicio HTTP |
|------|----------------|
| `useOrgChartRoot()` | `GET /api/org-chart/root` |
| `useOrgChartNode(id)` | `GET /api/org-chart/node/:id` |
| `useOrgChartChildren(id)` | `GET /api/org-chart/children/:id` |
| `useOrgChartSummary(id)` | `GET /api/org-chart/summary/:id` |
| `useOrgPersonDetail(id)` | `GET /api/org-chart/person/:id` |
| `useOrgPersonVideo(id, enabled)` | `GET /api/org-chart/person/:id/video` |
| `useOrgChartSearch(query)` | `GET /api/org-chart/search?q=…` |
| `useDebouncedValue(value, ms)` | Utilidad para debounce de búsqueda |
| `useProfile()` | `GET /api/profile/me` |
| `usePatchProfile()` | `PATCH /api/profile/me` |
| `usePostPhotoFromGoogle()` | `POST /api/profile/me/photo-from-google` |
| `useOnboardingStatus()` | Perfil + cache `onboarding-status` |

## Invalidaciones (`invalidations.ts`)

`invalidateAfterProfileChange(profile)` invalida solo el `personId` del perfil y el árbol raíz:

- `["profile"]`, `["onboarding-status"]`, `["org-root"]`
- `["org-node", personId]`, `["org-person-detail", personId]`, `["org-summary", personId]`

## UX / rendimiento

- **Prefetch colaboradores** (`orgChartPrefetch.ts`): hijos directos visibles → solo `org-node` (deduplicado por padre; summary bajo demanda en panel).
- **Sesión `/org`** (`orgChartMainSession.ts`): árbol, selección, expansión y viewport entre visitas.
- **Warmup boot**: `org-root` + `profile` + `onboarding-status` en `BootLoadingPage`.
- **Telemetría dev** (`devTelemetry.ts`): opt-in; apagada por defecto. Activar con `localStorage.setItem('organigrama.rqDebug', '1')` o `VITE_RQ_TELEMETRY=true`. Emite `console.debug` HIT/MISS/network.

## Componentes con React Query

- `RequireProfileComplete`, `RequireProfileIncomplete`
- `LoginPage`, `BootLoadingPage`
- `OrgChartPage`, `OrgChartExplorePage`
- `OnboardingPage`
- `NodeSummaryPanel`
- `PersonDetailPanel`
- `OrgChartSearchPanel`
- `LogoutButton` — `queryClient.clear()` al cerrar sesión

## Carga en UI

- Skeleton / overlay: `isLoading && !data` (o `results === undefined` en búsqueda).
- Con cache: `placeholderData: keepPreviousData` en node, summary, person detail y search.

## Legacy (sin ruta activa)

- `OrgChartView.tsx` — árbol en tarjetas; no importado en `App.tsx`. Hijos vía `fetchQuery` + cache `org-children`.

## Servicios (`orgChartService.ts`)

Los `fetch*` del servicio son **queryFn** de React Query en pantallas principales; no llamar en paralelo desde UI salvo login puntual con `fetchQuery` + misma key.
