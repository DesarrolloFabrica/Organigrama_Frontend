# Imagen de producción para Cloud Run (Vite SPA + serve)
# Build:  docker build -t organigrama-frontend .
# Run:    docker run --rm -p 8080:8080 organigrama-frontend
#
# NOTA: para que el front apunte al backend correcto en producción,
# pasar la variable en build time:
#   docker build --build-arg VITE_API_BASE_URL=https://TU-BACKEND.run.app -t organigrama-frontend .

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Valores por defecto para Cloud Build / docker build sin --build-arg.
# Vite no sobrescribe variables ya presentes en el entorno (prioridad sobre .env.*).
ARG VITE_API_BASE_URL=https://organigrama-backend-550902908078.us-central1.run.app
ARG VITE_GOOGLE_CLIENT_ID=550902908078-fvabjtle954fqr6alhofdv7fvvr4bcbv.apps.googleusercontent.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Allowlist de versionamiento del organigrama (UI).
# Si no se pasa (o se pasa vacia), el build usa DEFAULT_VERSION_ADMIN_EMAILS de
# src/features/org-chart/utils/canUseOrgVersioning.ts.
# Debe coincidir con ORG_CHART_VERSION_ADMIN_EMAILS del backend.
ARG VITE_ORG_CHART_VERSION_ADMIN_EMAILS=
ENV VITE_ORG_CHART_VERSION_ADMIN_EMAILS=$VITE_ORG_CHART_VERSION_ADMIN_EMAILS

RUN npm run build

# --- Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g serve@14 && chown node:node /app
USER node

COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:8080"]
