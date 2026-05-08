# Organigrama Frontend

Cliente web **Organigrama OP** para visualizar el organigrama de la Dirección de Operaciones. Consume el backend en `GET /api/org-chart`; la primera versión es solo lectura.

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
- `GET {BASE}/api/org-chart` — JSON del árbol del organigrama.
