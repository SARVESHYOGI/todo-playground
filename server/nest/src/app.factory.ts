import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/http-exception.filter";
import { env } from "./config/env";

/**
 * Builds and initialises the app without listening, so tests can drive it
 * through supertest and `main.ts` owns the actual socket.
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    logger: env.nodeEnv === "test" ? false : ["error", "warn", "log"],
  });

  app.enableCors({
    origin: env.corsOrigin,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}
