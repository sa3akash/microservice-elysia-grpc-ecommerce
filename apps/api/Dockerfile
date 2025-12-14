FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages
COPY package.json bun.lock ./

COPY /apps/api/package.json ./apps/api/package.json
COPY /packages/common/package.json ./packages/common/package.json

RUN bun install

COPY /apps/api ./apps/api
COPY /packages/common ./packages/common
RUN cd packages/common && bun install && bun run build

ENV NODE_ENV=production

RUN cd apps/api && bun install && bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/apps/api/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000