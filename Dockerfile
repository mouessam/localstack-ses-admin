FROM node:24-alpine AS build
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies (cached unless package files change)
RUN npm install

# Copy source files
COPY packages ./packages

# Build
RUN npm run build

FROM gcr.io/distroless/nodejs24-debian12
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/packages/server/dist ./packages/server/dist
COPY --from=build /app/packages/ui/dist ./packages/ui/dist

EXPOSE 8080
CMD ["packages/server/dist/main.js"]
