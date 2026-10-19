import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "@dotenvx/dotenvx";

config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env"),
  quiet: true,
});

export const env = {
  port: process.env.PORT,
};
