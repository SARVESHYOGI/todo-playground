import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "@dotenvx/dotenvx";

config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env"),
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
  port: process.env.PORT,
  tokenSecret,
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS ?? 604800),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
