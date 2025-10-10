# Stage 1: Development
# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN yarn install --frozen-lockfile

# Compile source
COPY . .
RUN yarn build

# ─── RUN STAGE ───────────────────────────────────────────────────────────────
FROM node:22-slim
WORKDIR /app

# Only prod deps
COPY package*.json ./
RUN yarn install --frozen-lockfile --production

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Use the same port logic in main.ts
CMD ["node", "dist/src/main.js"]
