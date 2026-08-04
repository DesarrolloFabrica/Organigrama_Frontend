# Presentación — módulo de video en PersonDetailPanel (Fase 4B)

**Estado:** **IMPLEMENTADA_CON_BLOQUEOS** (2026-08-03) — código y tests OK; smoke browser completo pendiente de `PERSON_VIDEO_STREAM_TICKET_SECRET` local (≥32).  
**Módulos:** [`person-profile-modules.md`](./person-profile-modules.md)  
**Arquitectura:** `Organigrama_Backend/docs/person-profile-modules-and-presentation-architecture.md`

---

## 1. Propósito

Mostrar la pestaña **Presentación** cuando la persona tiene video activo, y reproducirlo **dentro** del Organigrama con `<video>` nativo + stream ticketed del backend.

No abre pestaña externa, Drive, `webViewLink` ni iframe de Drive.

---

## 2. Disponibilidad

Visible solo si:

- perfil completo;
- no vacante;
- probe `GET …/video` **resuelto con éxito**;
- `hasVideo === true`.

Mientras el probe carga o falla: **no** aparece la pestaña (sin skeleton en tablist). Ficha no se bloquea.

Error de probe ≠ `hasVideo: false` (ambos ocultan UI; estados internos distintos).

No se consulta en vista limitada ni vacantes.

---

## 3. API

| Uso | Endpoint | Auth |
|-----|----------|------|
| Metadatos + ticket | `GET /api/org-chart/person/:id/video` | JWT sesión (`getJson`) |
| Bytes del video | `streamUrl` relativo con `?ticket=` | Solo ticket (sin Bearer) |

Cliente: `getPersonVideo(personId)` + `parsePersonVideoResponse`.

---

## 4. Ticket

- TTL backend ~120 s.
- Cache RQ de disponibilidad: `staleTime` 5 min.
- Distinguir **disponibilidad cacheable** vs **credenciales efímeras**.
- Al entrar a Presentación: si faltan ≤15 s de vigencia → `refreshPersonVideo()` / `refetch()`.
- Sin polling de renovación durante play.
- Máx. **1** reintento automático por montaje ante `error` del `<video>`; luego reintento manual.

---

## 5. streamUrl

- Debe ser path relativo `/api/org-chart/person/…/video/stream?ticket=…`.
- Validación: `assertSafePersonVideoStreamPath` / `resolvePersonVideoStreamUrl`.
- Rechaza absolutas, `javascript:`, `data:`, Drive, `..`.
- Resolución: `getOrgChartApiBaseUrl()` + path (Vite/API separados).
- **No** loguear ni mostrar la URL (contiene ticket).

---

## 6. Reproductor

```html
<video controls playsInline preload="metadata" controlsList="nodownload" />
```

- Sin autoplay / loop / mute automático.
- Sin fetch+Blob.
- Fullscreen nativo del navegador.
- Contenedor 16:9, ancho 100%, fondo neutro.
- `controlsList="nodownload"`: reducción UI, **no** seguridad.

---

## 7. Renovación

1. Entrada: ticket fresco → usar; si no → refetch metadatos.
2. Mid-play: no cambiar `src` si funciona.
3. `error` del video: 1× refetch + restaurar `currentTime` si es válido; no autoplay si el usuario no había iniciado play.

---

## 8. Estados UI

| Estado | Mensaje |
|--------|---------|
| Preparando | Preparando la presentación… |
| Lista | (reproductor) |
| Renovando | Renovando acceso… |
| Error | No fue posible reproducir el video. (+ Reintentar) |
| No disponible | La presentación ya no está disponible. |
| Formato | Este formato de video no es compatible con el navegador. |

Sin mensajes técnicos (403, ticket, Drive).

---

## 9. Desmontaje

Al cambiar pestaña/persona, cerrar/minimizar panel o perder Presentación:

- pause;
- quitar `src` + `load()`;
- listeners vía cleanup de efectos.

`unmountOnExit: true` en el registro de módulos.

Logout: `queryClient.clear()` elimina tickets en memoria RQ.

---

## 10. Panel ampliado

Desktop: ~**600 px** con módulo Presentación activo; **420 px** en Ficha/Competencias.  
Móvil: sheet full-width existente; no impone 600 px.

---

## 11. Accesibilidad

- tablist / tab / tabpanel + teclado.
- `aria-label` en video; `aria-live="polite"` en estados.
- Sin foco automático al reproductor.

---

## 12. Seguridad (frontend)

No localStorage/sessionStorage de ticket/URL.  
No logs/analytics con ticket.  
No reconstruir URL sensible.  
Protección real: TTL + scope + backend.

---

## 13. Pruebas

- `personVideoStreamUrl.spec.ts`
- `personPresentationRules.spec.ts`
- `personVideoResponse.spec.ts`
- `profile-modules.spec.ts`
- Build frontend

Smoke navegador: ver entrega de fase (personas con/sin video, limitada, vacante, audio al salir).

---

## 14. Limitaciones

- Codecs no universales (p. ej. algunos `.mov`).
- Ticket corto vs buffering largo → 1 auto-retry.
- `nodownload` no impide captura de bytes.
- Smoke E2E automatizado completo pendiente de entorno con secreto local.

---

## 15. Estado

**IMPLEMENTADA_CON_BLOQUEOS** — UI/cliente/hook/tests/build listos. Smoke real de reproducción bloqueado hasta configurar secreto de ticket en el backend local.
