FROM node:22-alpine AS base

WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Install dependencies (including dev for build; pruned below)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source
RUN npm prune --omit=dev

# Production image
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init curl

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.config.ts ./
COPY --from=base /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
