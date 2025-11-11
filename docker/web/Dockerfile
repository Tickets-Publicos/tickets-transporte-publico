# ==============================================================================
# PRODUCTION IMAGE - Usa artefato do build do CI
# ==============================================================================
FROM node:22-alpine AS production

# Install pnpm and wget for healthcheck
RUN npm install -g pnpm@10.18 && \
    apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application (será copiado pelo CI ou build local)
COPY apps/web/.next ./apps/web/.next
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.mjs ./apps/web/

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/apps/web

ENV PORT=3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["pnpm", "start"]