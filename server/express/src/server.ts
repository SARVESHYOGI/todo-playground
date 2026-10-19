import app from "./app.ts";
import { env } from "./config/env.ts";

const server = app.listen(env.port, () => {
  console.log(`server running http://localhost:${env.port}/`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));