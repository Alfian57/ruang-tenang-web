# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# ============================================
# BUILD ARGUMENTS untuk NEXT_PUBLIC_* env vars
# Gunakan placeholder untuk runtime injection
# ============================================
ARG NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL__

# Convert ARG ke ENV agar terbaca oleh next build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Install dependencies based on the preferred package manager
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f bun.lock ]; then npm install; \
  else npm install; \
  fi

# Copy source code
COPY . .

# Build the application dengan env yang sudah di-set
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy entrypoint script for runtime env injection
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Gunakan entrypoint untuk inject env saat runtime
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
