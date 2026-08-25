# Organigrama Frontend — documentación

> SPA React/Vite: mapa del organigrama, fichas, CV, video y buscador de competencias.

Este repositorio es la **capa de presentación**. La autoridad de seguridad y datos es el Backend.

Repositorio hermano: [Organigrama_Backend](https://github.com/DesarrolloFabrica/Organigrama_Backend) · su guía: [documentacion/](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/README.md).

## Lectura rápida

1. Login Google → JWT en memoria/cliente → `Authorization: Bearer` hacia el API.
2. Rutas de producto bajo `/org` (mapa, team, competency-explorer).
3. La API **redacta** fichas; la UI no es control de acceso.
4. Competencias y buscador leen el store MC1 vía API (sin pipeline en el browser).
5. Video: metadatos con JWT → `<video src>` con **ticket** en query.

## Stack

React 19 · Vite 8 · React Router 7 · TanStack Query 5 · XYFlow · Tailwind 4

## Estructura relevante

```text
src/
├── App.tsx                 # rutas
├── features/
│   ├── org-chart/          # mapa, ficha, CV, video
│   ├── competencies/       # radar / explorador de ficha
│   └── competency-explorer/ # buscador Domain→People
├── lib/react-query/        # hooks de datos
└── contexts/               # auth, transiciones
```

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/` | Login / home |
| `/onboarding` | Perfil propio |
| `/org` | Mapa global |
| `/org/team/:personId` | Vista centrada en líder |
| `/org/competency-explorer` | Buscador de competencias |
| `/org-chart` | Redirect → `/org` |
| `/dev/mc1-profile-preview` | Lab (sin `RequireAuth`) |

## Índice

| Tema | Documento |
|------|-----------|
| [Arquitectura](./01-arquitectura.md) | Capas UI → API |
| [Entorno local](./02-entorno-local.md) | Vite, env, arranque |
| [Autenticación y visibilidad](./03-autenticacion-y-visibilidad.md) | Sesión, full/limited UI |
| [Organigrama](./04-organigrama.md) | Mapa, lazy, búsqueda |
| [Perfiles, CV y video](./05-perfiles-cv-y-video.md) | Ficha y reproducción |
| [Competencias MC1](./06-competencias-mc1.md) | Radar y `mc1Profile` |
| [Buscador](./07-buscador-competencias.md) | Explorer UI |
| [Deploy](./08-deploy.md) | Docker / Cloud Run SPA |
| [Troubleshooting](./09-operacion-y-troubleshooting.md) | Fallos de UI |

## Onboarding

1. [Entorno local](./02-entorno-local.md) (API Backend en `:3000`)
2. [Arquitectura](./01-arquitectura.md) + [Auth UI](./03-autenticacion-y-visibilidad.md)
3. [Organigrama](./04-organigrama.md) + [Ficha](./05-perfiles-cv-y-video.md)
4. [MC1 UI](./06-competencias-mc1.md) + [Buscador](./07-buscador-competencias.md)

## Relación con el API

Base: `VITE_API_BASE_URL` (sin slash final). Prefijo HTTP del Backend: `/api`.

Detalle de seguridad y contratos: documentación Backend enlazada desde cada tema.

[Siguiente →](./01-arquitectura.md)
