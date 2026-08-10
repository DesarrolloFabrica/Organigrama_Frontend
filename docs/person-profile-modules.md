# Módulos extensibles del perfil (PersonDetailPanel)

**Estado módulos base (4A):** **IMPLEMENTADA_Y_VALIDADA**  
**Estado Presentación (4B + visibilidad global autenticada):** **IMPLEMENTADA_CON_BLOQUEOS** — ver [`person-profile-presentation.md`](./person-profile-presentation.md)  
**Arquitectura:** `Organigrama_Backend/docs/person-profile-modules-and-presentation-architecture.md`  
**Auditoría:** [`../../docs/person-profile-video-visibility-audit.md`](../../docs/person-profile-video-visibility-audit.md)

---

## 1. Propósito

Registro tipado de módulos en el panel de detalle, con montaje lazy y `unmountOnExit` donde aplica.

Módulos visibles:

1. **Ficha** (order 10)
2. **Competencias** (order 20)
3. **Presentación** (order 30, condicional `hasVideo`)

---

## 2. Contrato

```ts
type ProfileModuleCode = 'ficha' | 'competencias' | 'presentacion';

type ProfileModuleDefinition = {
  code: ProfileModuleCode;
  label: string;
  order: number;
  tabId: string;
  panelId: string;
  lazyLoad: boolean;
  unmountOnExit: boolean;
  isAvailable: (ctx) => boolean;
};
```

Archivos:

```
src/features/org-chart/components/profile-modules/
  profile-module.types.ts
  usePersonProfileModules.ts
  PersonFichaPanel.tsx
  PersonCompetenciesPanel.tsx
  PersonPresentationPanel.tsx
  profile-modules.spec.ts
```

Helpers de selección: `firstAvailableModule`, `fallbackToAvailableModule`, `resolveActiveProfileModule`.

---

## 3. Responsabilidades de PersonDetailPanel

Conserva shell, cabecera, tablist, reset por `personId`, loading/error, scroll.  
Probe de video en paralelo (también en vista limitada) sin bloquear Ficha.  
Notifica `onActiveModuleChange` para ensanche del overlay.

---

## 4. Disponibilidad

| Módulo | Visible cuando |
|--------|----------------|
| Ficha | Siempre (con detalle cargado; contenido privado solo si `hasFullProfile`) |
| Competencias | `hasFullProfile && !isVacancy` |
| Presentación | `!isVacancy && hasPresentation === true` (**sin** exigir ficha completa) |

`hasPresentation` = probe éxito + `hasVideo === true`.  
Carga / error de probe: sin pestaña Presentación.

---

## 5. Selección y reset

- Cambio de persona: primer módulo disponible (`firstAvailableModule`).
- Si el activo deja de estar disponible → fallback al primero disponible (no asume siempre `ficha`).
- Aparición tardía de Presentación **no** cambia el módulo activo si el actual sigue válido.
- Tablist solo con **2+** módulos; un solo módulo → contenido directo.

---

## 6. Montaje lazy / unmount

- Solo el módulo activo montado.
- Competencias y Presentación: `lazyLoad` + `unmountOnExit`.
- Presentación limpia `<video>` (pause / quitar src / load).

---

## 7. Accesibilidad

tablist, tab, tabpanel, aria-controls/selected, flechas Home/End.  
Video con `aria-label` conceptual.

---

## 8. Pruebas

`profile-modules.spec.ts`, `personPresentationRules.spec.ts`, `personVideoStreamUrl.spec.ts`, build.
