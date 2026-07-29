# MC1.4.2 — Radar interactivo de especialidades

## Componentes

- `CompetencyRadar.tsx` — SVG heptágono, hover/focus/clic
- `CompetencyRadarTooltip.tsx` — tooltip con skills diferidas
- `CompetencyRadarHelp.tsx` — leyenda + disclosure de interpretación
- `radarGeometry.ts` — geometría pura
- `radarLabels.ts` — orden estable + etiquetas cortas

## Valor representado

**Coverage (0–1) → radio.** No Strength, no Confidence, no ranking score.

## Orden de ejes (estable, horario desde arriba)

Frontend → Backend → Bases de datos → IA aplicada → Ing. y calidad → APIs → Cloud

## Interacción

| Acción | Efecto |
|--------|--------|
| Hover / Focus | Tooltip; carga diferida de detalle (~200 ms debounce) vía React Query |
| Clic / Enter / Space | Selecciona especialidad → detalle inferior |
| Escape | Cierra tooltip |
| Hover | No cambia selección permanente |

Al montar: **1** request de resumen + **1** de especialidad default. No 7 en paralelo.

## Accesibilidad

Hit area 20 px, `role="button"`, `aria-label` completo, foco visible, selector `<select>` como fallback.

## Animación

Entrada del polígono ~420 ms ease-out; desactivada con `prefers-reduced-motion`.

## Pruebas

```bash
npm test
npm run build
```

Incluye `radarGeometry.spec.ts` y `radarLabels.spec.ts`.
