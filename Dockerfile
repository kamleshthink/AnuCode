# Multi-stage build for production deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build API
WORKDIR /app/apps/api
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built application
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/package*.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules

# Create workspace directory
RUN mkdir -p /tmp/workspace && chown expressjs:nodejs /tmp/workspace

USER expressjs

EXPOSE 10000

CMD ["node", "dist/index.js"]
