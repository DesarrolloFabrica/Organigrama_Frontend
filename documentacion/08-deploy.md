# Deploy (Frontend)

> Build Docker del SPA, build-args Vite y smoke de UI.

[← Anterior](./07-buscador-competencias.md) · [Índice](./README.md) · [Siguiente →](./09-operacion-y-troubleshooting.md)

Deploy del API: [Backend — deploy](https://github.com/DesarrolloFabrica/Organigrama_Backend/blob/main/documentacion/09-deploy.md).

El deploy es **manual**. No hay `cloudbuild.yaml` de producto en este repo.

## Qué se despliega

Servicio Cloud Run (región típica `us-central1`): imagen Node 22 Alpine; SPA servida con `serve` en **8080**.

Vite incrusta env en **build time** — hay que rebuild si cambia la URL del API.

## Build

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://<CLOUD_RUN_BACKEND_URL> \
  --build-arg VITE_GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID> \
  -t organigrama-frontend:<TAG> \
  .
```

El Dockerfile puede definir `ARG` con defaults. **No** uses esos defaults como documentación de secretos: pásalos siempre por `--build-arg`.

Opcional: `VITE_ORG_CHART_VERSION_ADMIN_EMAILS` (allowlist de UI de versiones).

## Secuencia típica

1. Backend ya desplegado y healthy.
2. Build FE con `VITE_API_BASE_URL` del backend **actual**.
3. Deploy imagen + tráfico 100 %.
4. Smoke: home 200 + login + `/org` root.

## Rollback

**MANUAL:** tráfico Cloud Run a la revisión anterior. No hay script npm de rollback.

## Qué no desplegar

- Build apuntando a API de laboratorio o MDE.
- Árboles `*_isolated` como fuente de verdad.
- Client IDs o URLs de ejemplos históricos como valores fijos eternos.

[← Anterior](./07-buscador-competencias.md) · [Índice](./README.md) · [Siguiente →](./09-operacion-y-troubleshooting.md)
