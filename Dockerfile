FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages ./packages

RUN npm install
RUN npm run build

FROM gcr.io/distroless/nodejs24-debian12
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/packages/server/dist ./packages/server/dist
COPY --from=build /app/packages/ui/dist ./packages/ui/dist

EXPOSE 8080
CMD ["packages/server/dist/main.js"]
