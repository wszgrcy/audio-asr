FROM node:24.13.0-alpine3.22 AS builder
WORKDIR /app
COPY . .
RUN npm i pnpm -g
RUN pnpm i 
RUN npm run build:server:prod

FROM node:24.13.0-alpine3.22 AS runner
WORKDIR /app
COPY --from=builder /app/server/dist .
COPY docker/build/server/assets .
RUN chmod +x /app/main.sh
# RUN npm i drizzle-kit drizzle-orm pg
EXPOSE 3000
ENTRYPOINT [ "/app/main.sh" ]
