# Organigrama Frontend

Cliente web **Organigrama OP** para visualizar el organigrama de la Dirección de Operaciones. Consume el backend con **carga progresiva por niveles**; la primera versión es solo lectura.

## Requisitos

- Node.js LTS
- npm
- Backend en ejecución (por defecto `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Comandos

| Comando        | Descripción                         |
| -------------- | ----------------------------------- |
| `npm run dev`  | Servidor de desarrollo (Vite), puerto **5173** |
| `npm run build`| Build de producción                 |
| `npm run preview` | Vista previa del build estático  |

## Configuración opcional

Variable de entorno (prefijo `VITE_`):

- `VITE_API_BASE_URL` — URL base del API si no es `http://localhost:3000`.

Ejemplo en `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Integración

El frontend espera:

- `GET {BASE}/api/health` — indicador de conexión.
- `GET {BASE}/api/org-chart/root` — carga inicial (raíz + hijos directos).
- `GET {BASE}/api/org-chart/node/:id` — exploración de un equipo (raíz + hijos directos).
- `GET {BASE}/api/org-chart/children/:id` — expansión lazy al abrir nodos en el mapa.
- `GET {BASE}/api/org-chart/person/:id` — ficha técnica de persona.
- `GET {BASE}/api/org-chart/summary/:personId` — resumen jerárquico en panel.

**Deprecated (no usar en la UI principal):**

- `GET {BASE}/api/org-chart` — árbol completo (legacy).
- `GET {BASE}/api/org-chart/team/:id` — subárbol completo (legacy); en la app activa se usa `/node/:id` + `/children/:id`.
