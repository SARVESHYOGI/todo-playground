import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";

// The build emits CommonJS while vitest transforms to ESM, so this file cannot
// rely on either `__dirname` or `import.meta.url`. Resolve the contract from the
// package root instead: source when running tests, dist when running the build.
const candidates = [
  join(process.cwd(), "src/prisma/contract.json"),
  join(process.cwd(), "dist/prisma/contract.json"),
];
const contractPath = candidates.find((path) => existsSync(path));
if (!contractPath) {
  throw new Error(`contract.json not found in: ${candidates.join(", ")}`);
}

const contractJson = JSON.parse(readFileSync(contractPath, "utf8"));

export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
