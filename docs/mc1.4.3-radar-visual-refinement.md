# MC1.4.3 — Refinamiento visual del radar

## Alcance

Solo UX/UI del Explorador. Sin cambios de API, PA2, métricas ni contratos.

## Mejoras

- Radar más protagonico (~82 % del viewBox en labels)
- Labels con `text-anchor` angular (start / middle / end)
- Estados independientes: **SELECTED** / **DEFAULT** / **HOVERED**
- Animación del polígono solo al montar / persona / dominio (`radarPolygonDataKey`)
- Anillo de selección animado al cambiar de eje
- Tooltip: Coverage destacado, PRIMARY primero, máx. 5 skills
- % de Coverage solo en hover / focus / selected
- Leyenda compacta + disclosure
- Selector atenuado; resumen “Especialidad seleccionada” entre radar y detalle
- Detalle: razones colapsables; skills accesibles sin abrir metodología
- Skills compactas en cabecera
- Táctil: primer toque selecciona; sin tooltip flotante bloqueante

## Coverage

Sigue siendo el **único** valor radial.

## Validación Camilo

| Acción | Selected | Default indicator |
|--------|----------|-------------------|
| Inicial | Frontend | Frontend |
| Clic Backend | Backend | Frontend (sigue) |

```bash
npm test
npm run build
```
