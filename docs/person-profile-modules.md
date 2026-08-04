# Módulos extensibles del perfil (PersonDetailPanel)

**Estado módulos base (4A):** **IMPLEMENTADA_Y_VALIDADA**  
**Estado Presentación (4B):** **IMPLEMENTADA_CON_BLOQUEOS** — ver [`person-profile-presentation.md`](./person-profile-presentation.md) (falta secreto local para smoke stream)  
**Arquitectura:** `Organigrama_Backend/docs/person-profile-modules-and-presentation-architecture.md`

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

---

## 3. Responsabilidades de PersonDetailPanel

Conserva shell, cabecera, tablist, reset por `personId`, loading/error, scroll.  
Probe de video en paralelo sin bloquear Ficha.  
Notifica `onActiveModuleChange` para ensanche del overlay.

---

## 4. Disponibilidad

| Módulo | Visible cuando |
|--------|----------------|
| Ficha | Siempre (con detalle cargado) |
| Competencias | `hasFullProfile && !isVacancy` |
| Presentación | `hasFullProfile && !isVacancy && hasPresentation === true` |

`hasPresentation` = probe éxito + `hasVideo === true`.  
Carga / error de probe: sin pestaña Presentación.

---

## 5. Selección y reset

- Default / cambio de persona: `ficha`.
- Si el activo deja de estar disponible → fallback `ficha`.
- Aparición tardía de Presentación **no** cambia el módulo activo.

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
