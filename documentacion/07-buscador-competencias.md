# Buscador de competencias (Frontend)

> Ruta `/org/competency-explorer`: selección Domain → Specialty → Skills → People.

[← Anterior](./06-competencias-mc1.md) · [Índice](./README.md) · [Siguiente →](./08-deploy.md)

API, facets y AND: [Backend — buscador API](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/08-buscador-competencias-api.md).

## Estado

| Pieza | Clasificación |
|-------|---------------|
| Página + `useCompetencyPeopleSearch` | **PRODUCTIVO** |
| Banner “IA para proyectos” | **PLANNED** (textarea disabled, “Próximamente”) |
| `useCompetencyExplorerQuery` + `mocks/` | **LEGACY** (tests/diseño; no alimentan la página) |

## Ruta y URL state

- Ruta: `/org/competency-explorer` (lazy en `App.tsx`).
- Query: `domain`, `specialty`, `skills` (códigos separados por coma).
- Dominio y especialidad: **single**. Skills: **multi** (toggle).
- Cambiar dominio limpia especialidad y skills; cambiar especialidad limpia skills.
- Paginación 1-based; al cambiar criterios vuelve a página 1.

## Flujo UI

```text
Domain / Field  →  Specialty  →  Skills  →  People
```

Sin dominio: facets de dominio + universo; sin ranking de personas.

Resultados: tarjetas (foto, cargo, explicación determinista). **Sin score** ficticio. Clic abre `PersonDetailPanel` (mismos permisos de ficha).

## Estados de presentación

Definidos en `competencyPeopleSearchPresentation.ts` (nombres conceptuales):

| Estado | UI |
|--------|-----|
| LOADING | Skeleton |
| ERROR | Alerta + Reintentar |
| INITIAL | Facets de dominio |
| Resultados / vacío | Lista o “ampliar consulta” |
| Fin de página | Paginación |

Feature: `src/features/competency-explorer/`.

[← Anterior](./06-competencias-mc1.md) · [Índice](./README.md) · [Siguiente →](./08-deploy.md)
