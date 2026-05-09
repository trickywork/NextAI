FROM node:20-alpine AS frontend-build
WORKDIR /workspace

COPY package-lock.json package.json ./
RUN npm ci

COPY public public
COPY src src
RUN npm run build

FROM node:20-alpine
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=8080

COPY server/package-lock.json server/package.json ./
RUN npm ci --omit=dev

COPY server ./
COPY --from=frontend-build /workspace/build ../build

EXPOSE 8080

CMD ["node", "server.js"]
