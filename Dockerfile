# Define build environment
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm & dependencies
RUN corepack enable && corepack
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build application
COPY . .
RUN pnpm run build

# Define server environment
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built Nitro server output from builder stage
COPY --from=builder /app/.output ./.output

# Run server on the specified application port
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]