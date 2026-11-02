import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { config } from "@dotenvx/dotenvx";

config({
  path: resolve(__dirname, "../../.env"),
  quiet: true,
});

const tokenSecret =
  process.env.TOKEN_SECRET ??
  (() => {
    console.warn(
      "[auth] TOKEN_SECRET is not set; using a random per-process secret. " +
        "Issued tokens are invalidated on restart. Set TOKEN_SECRET in .env for stable sessions."
    );
    return randomBytes(32).toString("hex");
  })();

export const env = {
  // 3002 by default so the express (3000) and fastify (3001) siblings can run
  // at the same time.
  port: Number(process.env.PORT ?? 3002),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  tokenSecret,
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS ?? 604800),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
