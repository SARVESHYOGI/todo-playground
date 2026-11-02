import { createApp } from "./app.factory";
import { env } from "./config/env";

async function main(): Promise<void> {
  const app = await createApp();

  function shutdown(signal: string): void {
    console.log(`${signal} received, shutting down`);
    app.close().then(
      () => process.exit(0),
      () => process.exit(1)
    );
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await app.listen(env.port, env.host);
    console.log(`server running http://localhost:${env.port}/`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void main();
