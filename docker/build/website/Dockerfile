FROM node:24.13.0-alpine3.22 AS builder
WORKDIR /app
COPY . .
RUN npm i pnpm -g
RUN pnpm i 
RUN npm run build:website:prod

FROM nginx:1.29.5-alpine-slim AS runner
WORKDIR /app
COPY --from=builder /app/website/dist/website/browser /usr/share/nginx/html
COPY docker/build/website/nginx /etc/nginx
EXPOSE 80
