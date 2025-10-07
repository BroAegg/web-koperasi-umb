# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/dist ./dist

RUN npm ci --only=production
RUN npm run prisma:generate

EXPOSE 3001

CMD ["npm", "run", "start:prod"]