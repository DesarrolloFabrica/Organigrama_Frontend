# MC1.4.1 — Explorador de Competencias (frontend)

Vertical slice funcional del Explorador en la ficha de persona del Organigrama.

## Arquitectura

Feature modular en `src/features/competencies/` + hooks React Query.
Integración: pestañas **Ficha | Competencias** en `PersonDetailPanel`.

## Layout (MC1.4.1.1)

El Explorador usa **container queries** (`.mc-explorer`) según el ancho del panel lateral (~420 px), no el viewport.

| Ancho contenedor | Layout | Métricas |
|------------------|--------|----------|
| &lt; 420 px | Selector + detalle (1 col) | 1 col |
| 420–559 px | Selector + detalle | 2 cols |
| ≥ 560 px | Lista + detalle (`0.75fr` / `1.5fr`) | 2 cols |
| ≥ 640 px | Lista + detalle | 3 cols |

En la ficha actual (`max-w-[420px]`) el modo por defecto es **una columna**: selector arriba + detalle legible debajo.

### Métricas

Cada bloque: etiqueta corta · valor · hint breve.  
Textos metodológicos largos → “Cómo interpretar estas métricas”.  
Fuerza: `31 / 100` (no seniority).

### Bordes

Borde exterior del área y del detalle; selección en lista; separadores `border-t` internos. Skills sin caja pesada.

### Nombre de persona

`line-clamp-2` + `title` (tooltip nativo) en cabecera de ficha.

## Flujo API / estados

Sin cambios respecto a MC1.4.1 (mismos endpoints, hooks y estados).

## Pruebas

```bash
npm test
npm run build
```

Incluye `competencyLayout.spec.ts` (stack/split y columnas).

## Limitaciones

Sin radar, gráficos ni cambios de backend.
