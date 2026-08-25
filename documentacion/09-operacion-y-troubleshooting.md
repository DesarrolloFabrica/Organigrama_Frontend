# Operación y troubleshooting (Frontend)

> Fallos de UI, build y consumo del API. Si la causa es Backend, enlazar allá.

[← Anterior](./08-deploy.md) · [Índice](./README.md)

Ops API / Drive / MC1 CLI: [Backend — operación](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/10-operacion-y-mantenimiento.md).

## Troubleshooting rápido

| Síntoma | Empezar aquí |
|---------|----------------|
| Mapa no carga | ¿API up? ¿CORS? ¿JWT? Network a `/api/org-chart/root`. Si 401 → sesión. Si 5xx → Backend. |
| Nodos vacíos / árbol raro | ¿Versión seleccionada? ¿Legacy 410 en Network? Backend [organigrama API](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/05-organigrama-api.md) |
| Perfil no renderiza / limited inesperado | DTO redactado; no “arreglar” ocultando botones. Backend [permisos](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/04-autenticacion-y-permisos.md) |
| CV no aparece en UI | `{ hasCv: false }` puede ser denegación. Sync Drive es Backend. |
| Video UI no reproduce | Re-probe metadatos (ticket TTL corto). No usar links Drive. Backend [video](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/06-perfiles-cv-y-video.md) |
| Competency explorer vacío | Universo autorizado + store; no mocks. Backend [buscador API](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/08-buscador-competencias-api.md) |
| Competencias vacías en ficha | 403 vs store vacío. Backend [MC1](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/07-competencias-mc1.md) |
| Build / runtime FE | `VITE_*` incorrectos en imagen; rebuild tras cambiar URL API |
| Login falla | Client ID, persona en Core, CORS. Backend [entorno](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/02-entorno-local.md) |

## Principios

- Controles UI ≠ seguridad.
- Tras grant de permisos: **re-login**.
- No apuntar `VITE_API_BASE_URL` a hosts de experimento sin acuerdo.

## Checklist post-deploy FE

1. Home 200.
2. Login Google.
3. `/org` carga root.
4. Abrir una ficha + (si aplica) video/competencias.
5. `/org/competency-explorer` responde (401 sin token en API es esperado en smoke API).

[← Anterior](./08-deploy.md) · [Índice](./README.md)
