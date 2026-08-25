# Perfiles, CV y video (Frontend)

> Ficha full/limited, botones de CV y reproducción de presentación.

[← Anterior](./04-organigrama.md) · [Índice](./README.md) · [Siguiente →](./06-competencias-mc1.md)

Contratos API / Drive / ticket: [Backend — perfiles, CV y video](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/06-perfiles-cv-y-video.md).

## Flujo al abrir una persona

```text
Clic en nodo / tarjeta
      ↓
GET …/person/:id  (JWT)
      ↓
UI: Ficha (siempre) · Competencias (solo full) · Presentación (si hasVideo)
```

Panel: `PersonDetailPanel`. Módulos: `ficha` | `competencias` | `presentacion`.

| Módulo | Visible cuando | Contenido |
|--------|----------------|-----------|
| Ficha | Siempre (detalle cargado) | Datos OP; PII solo si full profile |
| Competencias | Full profile y no vacante | Radar / explorador MC1 |
| Presentación | No vacante y `hasVideo === true` | `<video>` interno |

Presentación **no** exige ficha completa. Competencias **sí**.

Código: `src/features/org-chart/components/profile-modules/`.

Onboarding propio (`/onboarding`): `GET/PATCH /api/profile/me` — independiente del panel de terceros.

## CV en UI

- Hook/servicio: `useOrgPersonCv` → `GET …/person/:id/cv`.
- Acción en pestaña Ficha (enlace/descarga), **no** pestaña “CV” separada.
- Si `hasCv: false`: no enumerar existencia; puede ser denegación.

## Video en UI

1. Probe metadatos `GET …/video` con JWT.
2. Si `hasVideo`, montar `<video src={streamUrl}>` (URL incluye ticket).
3. Sin autoplay; al cambiar de persona/pestaña: **pausar y desmontar** (sin audio de fondo).
4. No usar `webViewLink` ni iframe Drive.

Estados: loading del probe, sin video, error de stream (ticket caducado → re-pedir metadatos), seek vía Range en el Backend.

[← Anterior](./04-organigrama.md) · [Índice](./README.md) · [Siguiente →](./06-competencias-mc1.md)
