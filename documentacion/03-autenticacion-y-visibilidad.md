# Autenticación y visibilidad (Frontend)

> Cómo la SPA guarda sesión y reacciona a full/limited profile. El Backend es autoridad de seguridad.

[← Anterior](./02-entorno-local.md) · [Índice](./README.md) · [Siguiente →](./04-organigrama.md)

Fuente técnica (guards, matriz, tickets): [Backend — autenticación y permisos](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/04-autenticacion-y-permisos.md).

## Sesión

1. Usuario inicia con Google Identity → ID token.
2. SPA llama `POST /api/auth/google`.
3. Guarda JWT y datos de usuario en el cliente (Bearer en requests).
4. `GET /api/auth/me` para refrescar identidad cuando aplique.
5. Rutas de producto envueltas en `RequireAuth` (salvo `/` y lab `/dev/mc1-profile-preview`).

**No** hay cookies de sesión ni refresh token en el producto.

Tras un grant de permisos en BD, el usuario debe **cerrar sesión y volver a entrar** (permisos van en el JWT).

## Full vs limited en UI

El DTO de `GET …/person/:id` ya viene redactado.

| Señal | Efecto en UI |
|-------|----------------|
| `hasFullProfile` (o equivalente del DTO) | Muestra PII, CV, pestaña Competencias |
| Vista limitada | Identidad institucional + foto; sin documento/teléfonos/CV |
| 403 en competencies | No mostrar explorador de competencias |
| `{ hasCv: false }` | No asumir que “no hay archivo”; puede ser denegación anti-enumeración |

Controles ocultos en la UI **no** sustituyen la autorización del API.

## Flags del JWT en cliente

El Frontend puede exponer `hasOrgReadAll` / `isOrgAdmin` desde el usuario, pero **no** los usa como muro de pantallas: la API ya redacta.

El selector de **versiones** del organigrama usa `VITE_ORG_CHART_VERSION_ADMIN_EMAILS` (allowlist de UI), no `ORG_ADMIN` del JWT.

## Video y fotos

- Metadatos video: JWT de sesión.
- Stream: URL con `ticket` (sin Bearer en `<video>`).
- Fotos: a menudo `?access_token=` en `<img>` porque el tag no envía headers.

Detalle UI: [05-perfiles-cv-y-video.md](./05-perfiles-cv-y-video.md).

[← Anterior](./02-entorno-local.md) · [Índice](./README.md) · [Siguiente →](./04-organigrama.md)
