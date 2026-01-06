FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manager files trước để cache layer
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install dependencies (production + dev để build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build project
RUN pnpm run build


# ===============================
# Runtime Stage
# ===============================
FROM node:22-alpine
WORKDIR /app

# Copy chỉ output sau khi build
COPY --from=build /app/.output ./

# Thiết lập biến môi trường
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "./server/index.mjs"]
