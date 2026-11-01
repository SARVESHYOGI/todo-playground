import { buildApp } from "./app.ts";
import { env } from "./config/env.ts";

const app = buildApp();

function shutdown(signal: string): void {
  app.log.info(`${signal} received, shutting down`);
  app.close().then(
    () => process.exit(0),
    () => process.exit(1)
  );
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

try {
  await app.listen({ port: env.port, host: env.host });
  app.log.info(`server running http://localhost:${env.port}/`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
