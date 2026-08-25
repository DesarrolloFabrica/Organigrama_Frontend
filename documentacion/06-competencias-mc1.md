# Competencias MC1 (Frontend)

> Qué recibe la UI (`mc1Profile`), radar y estados de disponibilidad.

[← Anterior](./05-perfiles-cv-y-video.md) · [Índice](./README.md) · [Siguiente →](./07-buscador-competencias.md)

Pipeline, store, CLI y PA2: [Backend — competencias MC1](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/07-competencias-mc1.md). **No** duplicar aquí el pipeline P0–P4.

## Qué recibe el Frontend

Endpoints de ficha (JWT + full profile):

- `GET …/person/:id/competencies`
- `…/professional-profile`
- `…/domains/:domain`
- `…/domains/:domain/specialties/:specialty`

Cliente: `src/features/competencies/api/competenciesApi.ts`.

El payload refleja el **reader** del store (con posible fallback PA2 ya resuelto en Backend). La SPA **no** ejecuta Gemini ni el pipeline.

## Modelo visual

```text
Field / Domain → Specialty → Skills
```

| Concepto UI | Interpretación |
|-------------|----------------|
| Fields / Domains | Áreas publicables |
| Specialties | Especialidades observadas |
| Skills | Skills observadas (pueden ser “abiertas”) |
| `evidenceState` / coverage | Señal de evidencia en radar — **≠** seniority |
| WEAK | No significa “incompetente” ni Jr/Sr |

## Rendering

- Pestaña Competencias solo con full profile y no vacante.
- Radar / explorador interpretan estados de evidencia; empty si el API no trae perfil.
- 403 → no hay permiso de ficha completa (mensaje de no disponible / sin acceso).

## Lab

`/dev/mc1-profile-preview` — herramienta de laboratorio **sin** `RequireAuth`. No es producto.

[← Anterior](./05-perfiles-cv-y-video.md) · [Índice](./README.md) · [Siguiente →](./07-buscador-competencias.md)
