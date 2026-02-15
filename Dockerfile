FROM node:22-alpine AS build
WORKDIR /build

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manager files trước để cache layer
COPY package.json pnpm-lock.yaml .npmrc* ./

COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts=false

ARG DATABASE_URL=postgresql://datnguyen:datnguyen@localhost:5432/htl-shop
ARG NUXT_PUBLIC_GOOGLE_ID=452558787466-iunc1j26aqanlu3shk933cfn4c44lrrq.apps.googleusercontent.com

RUN pnpm prisma:generate

# Build project
RUN pnpm run build


# ===============================
# Runtime Stage
# ===============================
FROM node:22-alpine
WORKDIR /app

COPY --from=build /build/.output ./output
COPY --from=build /build/prisma ./prisma

# Thiết lập biến môi trường
ENV PORT=3000
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/prisma/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node

EXPOSE 3000

CMD ["node", "./output/server/index.mjs"]
