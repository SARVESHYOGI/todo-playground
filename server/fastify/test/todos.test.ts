import { afterAll, describe, expect, it } from "vitest";
import { authHeader, createApp, registerUser, teardown } from "./helpers.ts";

const app = createApp();
const createdIds: number[] = [];

afterAll(() => teardown(app, createdIds));

async function newUser() {
  const user = await registerUser(app);
  createdIds.push(user.id);
  return user;
}

describe("todos", () => {
  it("creates a todo owned by the caller", async () => {
    const user = await newUser();

    const res = await app.inject({
      method: "POST",
      url: "/todos",
      headers: authHeader(user.token),
      payload: { title: "Write tests", description: "with vitest" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      title: "Write tests",
      description: "with vitest",
      completed: false,
      authorId: user.id,
    });
  });

  it("lists, gets and updates a todo", async () => {
    const user = await newUser();

    const created = await app.inject({
      method: "POST",
      url: "/todos",
      headers: authHeader(user.token),
      payload: { title: "Task" },
    });
    expect(created.statusCode).toBe(200);
    const id = created.json().id;

    const list = await app.inject({ method: "GET", url: "/todos", headers: authHeader(user.token) });
    expect(list.statusCode).toBe(200);
    expect(list.json().map((todo: { id: number }) => todo.id)).toContain(id);

    const got = await app.inject({
      method: "GET",
      url: `/todos/${id}`,
      headers: authHeader(user.token),
    });
    expect(got.statusCode).toBe(200);
    expect(got.json().id).toBe(id);

    const updated = await app.inject({
      method: "PUT",
      url: `/todos/${id}`,
      headers: authHeader(user.token),
      payload: { completed: true },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().completed).toBe(true);
  });

  it("deletes a todo", async () => {
    const user = await newUser();

    const created = await app.inject({
      method: "POST",
      url: "/todos",
      headers: authHeader(user.token),
      payload: { title: "Temp" },
    });
    const id = created.json().id;

    const deleted = await app.inject({
      method: "DELETE",
      url: `/todos/${id}`,
      headers: authHeader(user.token),
    });
    expect(deleted.statusCode).toBe(200);

    const after = await app.inject({
      method: "GET",
      url: `/todos/${id}`,
      headers: authHeader(user.token),
    });
    expect(after.statusCode).toBe(404);
  });

  it("validates input", async () => {
    const user = await newUser();
    const headers = authHeader(user.token);

    const empty = await app.inject({ method: "POST", url: "/todos", headers, payload: {} });
    expect(empty.statusCode).toBe(400);
    expect(empty.json().errors).toContain('"title" is required');

    const blank = await app.inject({ method: "POST", url: "/todos", headers, payload: { title: "" } });
    expect(blank.statusCode).toBe(400);

    const noFields = await app.inject({ method: "PUT", url: "/todos/1", headers, payload: {} });
    expect(noFields.statusCode).toBe(400);

    const badId = await app.inject({ method: "GET", url: "/todos/abc", headers });
    expect(badId.statusCode).toBe(400);

    const missing = await app.inject({ method: "GET", url: "/todos/999999", headers });
    expect(missing.statusCode).toBe(404);
  });

  it("requires authentication", async () => {
    const list = await app.inject({ method: "GET", url: "/todos" });
    expect(list.statusCode).toBe(401);

    const create = await app.inject({ method: "POST", url: "/todos", payload: { title: "x" } });
    expect(create.statusCode).toBe(401);

    const remove = await app.inject({ method: "DELETE", url: "/todos/1" });
    expect(remove.statusCode).toBe(401);
  });

  it("isolates todos between users", async () => {
    const owner = await newUser();
    const other = await newUser();

    const created = await app.inject({
      method: "POST",
      url: "/todos",
      headers: authHeader(owner.token),
      payload: { title: "Owned" },
    });
    expect(created.statusCode).toBe(200);
    const id = created.json().id;

    const otherList = await app.inject({
      method: "GET",
      url: "/todos",
      headers: authHeader(other.token),
    });
    expect(otherList.json().map((todo: { id: number }) => todo.id)).not.toContain(id);

    const otherHeaders = authHeader(other.token);

    const read = await app.inject({ method: "GET", url: `/todos/${id}`, headers: otherHeaders });
    expect(read.statusCode).toBe(404);

    const update = await app.inject({
      method: "PUT",
      url: `/todos/${id}`,
      headers: otherHeaders,
      payload: { completed: true },
    });
    expect(update.statusCode).toBe(404);

    const remove = await app.inject({ method: "DELETE", url: `/todos/${id}`, headers: otherHeaders });
    expect(remove.statusCode).toBe(404);
  });
});
