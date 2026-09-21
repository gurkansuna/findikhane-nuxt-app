# Fındıkhane - Nuxt sürümü
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S findikhane && adduser -S findikhane -G findikhane
COPY --from=builder --chown=findikhane:findikhane /app/.output ./.output
USER findikhane
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
