import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { api, makeApp, teardown } from "./helpers";

let app: INestApplication;

beforeAll(async () => {
  app = await makeApp();
});

afterAll(() => teardown(app, []));

describe("health", () => {
  it("answers the health check", async () => {
    const res = await api(app).get("/health").expect(200);

    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const res = await api(app).get("/does-not-exist").expect(404);

    expect(res.body).toEqual({ error: "Not found" });
  });

  it("answers CORS preflight with 204 and the expected headers", async () => {
    const res = await api(app)
      .options("/todos")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.headers["access-control-allow-methods"]).toBe("GET, POST, PUT, DELETE, OPTIONS");
    expect(res.headers["access-control-allow-headers"]).toBe("Content-Type, Authorization");
  });
});
