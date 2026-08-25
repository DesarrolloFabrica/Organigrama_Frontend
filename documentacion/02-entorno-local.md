# Entorno local (Frontend)

> Instalación y arranque de la SPA. La API se ejecuta en el repo Backend.

[← Anterior](./01-arquitectura.md) · [Índice](./README.md) · [Siguiente →](./03-autenticacion-y-visibilidad.md)

## Secuencia

```text
clone Frontend → .env.local → npm install → npm run dev
  (API Backend disponible en http://localhost:3000)
```

Guía del API: [Backend — entorno local](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/02-entorno-local.md).

**Acceso corporativo:** cuenta `@cun.edu.co` en Core, mismo `GOOGLE_CLIENT_ID` que el Backend, y API levantada con datos reales. No hay modo demo sin persona en Core.

## Requisitos

| Requisito | Notas |
|-----------|--------|
| Node.js **22** | Alineado con Dockerfile |
| npm | Con `package-lock.json` |
| API local o remota | `VITE_API_BASE_URL` |

## Variables (`.env.example` → `.env.local`)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
# Opcional — UI de versiones (espejo de ORG_CHART_VERSION_ADMIN_EMAILS del API):
# VITE_ORG_CHART_VERSION_ADMIN_EMAILS=correo1@cun.edu.co,correo2@cun.edu.co
```

Vite incrusta estas variables en **build time**. Sin slash final en la URL del API.

## Arranque

```bash
cp .env.example .env.local
# editar VITE_*
npm install
npm run dev
```

Puerto típico: **5173**. El Backend debe tener `CORS_ORIGIN=http://localhost:5173`.

| Script | Uso |
|--------|-----|
| `npm run dev` | Vite |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
| `npm test` | Tests (si aplica al package) |

Login: botón Google, o coordinar `POST /api/auth/dev-login` del Backend (solo desarrollo).

[← Anterior](./01-arquitectura.md) · [Índice](./README.md) · [Siguiente →](./03-autenticacion-y-visibilidad.md)
