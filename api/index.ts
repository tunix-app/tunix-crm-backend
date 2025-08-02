import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/filters/http-exception.filter';

let cachedServer: any;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req, res) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(req, res);
}