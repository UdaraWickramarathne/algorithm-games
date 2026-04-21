FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY tsconfig.base.json .
COPY server/package.json ./server/
RUN npm install --prefix server

COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN npm run build --prefix server
RUN cp server/src/db/schema.sql server/dist/db/schema.sql

FROM node:22-alpine AS production
WORKDIR /app/server

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.js"]
