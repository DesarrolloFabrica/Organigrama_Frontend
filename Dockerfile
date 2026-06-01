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

ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

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
