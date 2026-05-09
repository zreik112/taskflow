# This Dockerfile is kept for reference and local testing only.
# Render deployment uses the native Node.js runtime defined in render.yaml.
# (Runtime: node, buildCommand: npm ci && npm run build, startCommand: node src/app.js)

# ── Stage 1: Build the React frontend ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN ls -la dist/ && ls -la dist/assets/

# ── Stage 2: Production-only dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 3: Production image ──────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY src ./src
COPY db ./db
COPY knexfile.js ./
COPY package.json ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/healthz || exit 1
CMD ["node", "src/app.js"]
