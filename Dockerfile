# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

# ---- 1. Install all workspace dependencies (cached on lockfile changes only)
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

# ---- 2a. Build the backend (TypeScript -> backend/dist)
FROM deps AS build-backend
COPY . .
RUN npm run build -w backend

# ---- 2b. Build the frontend (Vite -> frontend/dist)
FROM deps AS build-frontend
COPY . .
RUN npm run build -w frontend

# ---- 3. Production-only dependencies for the backend workspace
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
# npm may nest some backend deps under backend/node_modules; make sure the directory exists so it can be copied.
RUN npm ci --omit=dev --workspace=backend && mkdir -p backend/node_modules && npm cache clean --force

# ---- 4. API-only runtime (used by docker-compose as target "api")
FROM node:${NODE_VERSION}-alpine AS api
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=build-backend /app/backend/package.json ./backend/package.json
COPY --from=build-backend /app/backend/dist ./backend/dist
# Files stay root-owned (read-only for the app); the process runs as the unprivileged "node" user.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1
CMD ["node", "backend/dist/server.js"]

# ---- 5. Default target: API + built SPA on one port
FROM api AS app
ENV STATIC_DIR=/app/public
COPY --from=build-frontend /app/frontend/dist ./public
