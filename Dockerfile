# Multi-stage build for Web Koperasi UMB with Prisma
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on preferred package manager
COPY package.json package-lock.json* ./

# Set npm configurations for better reliability
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set registry https://registry.npmjs.org/

# Install dependencies with retry and better error handling
RUN npm ci --omit=dev --verbose || \
    (sleep 10 && npm ci --omit=dev --verbose) || \
    (sleep 30 && npm ci --omit=dev --verbose)

# Clean cache
RUN npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev) for build stage
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm ci --verbose || \
    (sleep 10 && npm ci --verbose) || \
    (sleep 30 && npm ci --verbose)

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/auth/session || exit 1

CMD ["node", "server.js"]