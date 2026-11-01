import { afterAll, describe, expect, it } from "vitest";
import { createApp, teardown } from "./helpers.ts";

const app = createApp();

afterAll(() => teardown(app, []));

describe("health", () => {
  it("answers the health check", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const res = await app.inject({ method: "GET", url: "/does-not-exist" });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "Not found" });
  });

  it("answers CORS preflight with 204 and the expected headers", async () => {
    const res = await app.inject({
      method: "OPTIONS",
      url: "/todos",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "GET",
      },
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.headers["access-control-allow-methods"]).toBe("GET, POST, PUT, DELETE, OPTIONS");
    expect(res.headers["access-control-allow-headers"]).toBe("Content-Type, Authorization");
  });
});
