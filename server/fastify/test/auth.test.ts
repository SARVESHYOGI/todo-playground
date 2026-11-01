import { afterAll, describe, expect, it } from "vitest";
import { authHeader, createApp, registerUser, teardown, uniqueEmail } from "./helpers.ts";

const app = createApp();
const createdIds: number[] = [];

afterAll(() => teardown(app, createdIds));

describe("auth", () => {
  it("registers a user and returns a token without the password hash", async () => {
    const email = uniqueEmail("auth");

    const res = await app.inject({
      method: "POST",
      url: "/users/register",
      payload: { email, password: "password123", name: "Auth User" },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    createdIds.push(body.user.id);
    expect(body.token).toBeTypeOf("string");
    expect(body.user).toMatchObject({ email, name: "Auth User" });
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it("rejects a duplicate email with 409", async () => {
    const user = await registerUser(app);
    createdIds.push(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/users/register",
      payload: { email: user.email, password: "password123" },
    });

    expect(res.statusCode).toBe(409);
  });

  it("rejects an invalid email and a weak password with 400", async () => {
    const weak = await app.inject({
      method: "POST",
      url: "/users/register",
      payload: { email: uniqueEmail("weak"), password: "short" },
    });
    expect(weak.statusCode).toBe(400);
    expect(weak.json().errors).toBeInstanceOf(Array);

    const badEmail = await app.inject({
      method: "POST",
      url: "/users/register",
      payload: { email: "not-an-email", password: "password123" },
    });
    expect(badEmail.statusCode).toBe(400);
  });

  it("logs in with valid credentials", async () => {
    const user = await registerUser(app);
    createdIds.push(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/users/login",
      payload: { email: user.email, password: user.password },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.token).toBeTypeOf("string");
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password and an unknown email with 401", async () => {
    const user = await registerUser(app);
    createdIds.push(user.id);

    const wrongPassword = await app.inject({
      method: "POST",
      url: "/users/login",
      payload: { email: user.email, password: "wrong-password" },
    });
    expect(wrongPassword.statusCode).toBe(401);

    const unknownEmail = await app.inject({
      method: "POST",
      url: "/users/login",
      payload: { email: uniqueEmail("ghost"), password: "password123" },
    });
    expect(unknownEmail.statusCode).toBe(401);
  });

  it("rejects requests without a token or with a malformed token", async () => {
    const missing = await app.inject({ method: "GET", url: "/users/me" });
    expect(missing.statusCode).toBe(401);

    const malformed = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: authHeader("garbage.sig"),
    });
    expect(malformed.statusCode).toBe(401);
  });

  it("returns the current user from /users/me", async () => {
    const user = await registerUser(app);
    createdIds.push(user.id);

    const res = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: authHeader(user.token),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id: user.id, email: user.email });
    expect(res.json()).not.toHaveProperty("passwordHash");
  });

  it("forbids reading or modifying another account with 403", async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);
    createdIds.push(a.id, b.id);

    const own = await app.inject({
      method: "GET",
      url: `/users/${a.id}`,
      headers: authHeader(a.token),
    });
    expect(own.statusCode).toBe(200);

    const bHeaders = authHeader(b.token);

    const read = await app.inject({ method: "GET", url: `/users/${a.id}`, headers: bHeaders });
    expect(read.statusCode).toBe(403);

    const update = await app.inject({
      method: "PUT",
      url: `/users/${a.id}`,
      headers: bHeaders,
      payload: { name: "hax" },
    });
    expect(update.statusCode).toBe(403);

    const remove = await app.inject({ method: "DELETE", url: `/users/${a.id}`, headers: bHeaders });
    expect(remove.statusCode).toBe(403);
  });
});
