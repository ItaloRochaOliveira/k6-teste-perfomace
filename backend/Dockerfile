# Etapa 1: instalar dependências, gerar o Prisma Client e buildar (NestJS)
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* tsconfig.json tsconfig.build.json nest-cli.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY src ./src
RUN npm run build

# Etapa 2: runtime (mantém node_modules para o prisma CLI rodar o migrate deploy)
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/dist ./dist

EXPOSE 3006

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
