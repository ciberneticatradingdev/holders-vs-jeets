FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
RUN mkdir -p /app/data
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund --omit=dev
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
