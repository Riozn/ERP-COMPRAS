FROM node:22-alpine AS deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/test ./test
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/backend/dist ./dist
COPY docker/postgres/init.sql /app/docker/postgres/init.sql
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
