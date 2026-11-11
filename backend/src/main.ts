import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3006);
  await app.listen(port, '0.0.0.0');
  console.log(`API rodando na porta ${port}`);
}

void bootstrap();
