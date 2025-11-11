# ==============================================================================
# PRODUCTION IMAGE - Usa artefato do build do CI
# ==============================================================================
FROM node:22-alpine AS production

# Install pnpm and wget for healthcheck (em uma única layer)
RUN npm install -g pnpm@10.21.0 && \
    apk add --no-cache wget && \
    npm cache clean --force

WORKDIR /app

# Copy package files (layer cacheável)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install production dependencies only (layer cacheável)
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built application (será copiado pelo CI ou build local)
COPY apps/web/.next ./apps/web/.next
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.mjs ./apps/web/

# Set environment
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/web

EXPOSE 3000

# Healthcheck otimizado
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["pnpm", "start"]