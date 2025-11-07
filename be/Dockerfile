# 1. Stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json + package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build NestJS
RUN npm run build

# 2. Stage production
FROM node:20-alpine

WORKDIR /app

# Copy package.json + node_modules production từ builder
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy file build NestJS
COPY --from=builder /app/dist ./dist

# Copy .env (tùy chọn, nếu muốn secrets có sẵn trong image)
COPY .env .env

# Chạy ứng dụng
CMD ["node", "dist/main.js"]
