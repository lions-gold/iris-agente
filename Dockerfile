# =============================================================
# DOCKERFILE - Iris AI & StockLlave Autonomous Engine
# Multi-stage build for ultra-minimal footprint & blazing speed
# Architect: Carlos Smith Zambrano Gonzalez
# =============================================================

# Stage 1: Build Frontend and Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with frozen lockfile / caching
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy application source code
COPY . .

# Compile optimized static bundle
RUN npm run build

# =============================================================
# Stage 2: Minimal High-Performance Production Runner
# =============================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root user for maximum security compliance
USER node

# Copy built artifacts and runtime dependencies
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server.ts ./server.ts
COPY --chown=node:node --from=builder /app/public ./public

# Expose standard production port
EXPOSE 3000

# Health check to ensure zero-downtime container recovery
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start full-stack Express server with TSX
CMD ["node", "--loader", "tsx", "server.ts"]
