import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { api, authHeader, makeApp, registerUser, teardown } from "./helpers";

let app: INestApplication;
const createdIds: number[] = [];

beforeAll(async () => {
  app = await makeApp();
});

afterAll(() => teardown(app, createdIds));

async function newUser() {
  const user = await registerUser(app);
  createdIds.push(user.id);
  return user;
}

describe("todos", () => {
  it("creates a todo owned by the caller", async () => {
    const user = await newUser();

    const res = await api(app)
      .post("/todos")
      .set(authHeader(user.token))
      .send({ title: "Write tests", description: "with vitest" })
      .expect(200);

    expect(res.body).toMatchObject({
      title: "Write tests",
      description: "with vitest",
      completed: false,
      authorId: user.id,
    });
  });

  it("lists, gets and updates a todo", async () => {
    const user = await newUser();
    const created = await api(app)
      .post("/todos")
      .set(authHeader(user.token))
      .send({ title: "Task" })
      .expect(200);
    const id = created.body.id;

    const list = await api(app).get("/todos").set(authHeader(user.token)).expect(200);
    expect(list.body.map((todo: { id: number }) => todo.id)).toContain(id);

    const got = await api(app).get(`/todos/${id}`).set(authHeader(user.token)).expect(200);
    expect(got.body.id).toBe(id);

    const updated = await api(app)
      .put(`/todos/${id}`)
      .set(authHeader(user.token))
      .send({ completed: true })
      .expect(200);
    expect(updated.body.completed).toBe(true);
  });

  it("deletes a todo", async () => {
    const user = await newUser();
    const created = await api(app)
      .post("/todos")
      .set(authHeader(user.token))
      .send({ title: "Temp" })
      .expect(200);

    await api(app).delete(`/todos/${created.body.id}`).set(authHeader(user.token)).expect(200);
    await api(app).get(`/todos/${created.body.id}`).set(authHeader(user.token)).expect(404);
  });

  it("validates input", async () => {
    const user = await newUser();

    const empty = await api(app).post("/todos").set(authHeader(user.token)).send({}).expect(400);
    expect(empty.body.errors).toContain('"title" is required');

    await api(app).post("/todos").set(authHeader(user.token)).send({ title: "" }).expect(400);
    await api(app).put("/todos/1").set(authHeader(user.token)).send({}).expect(400);
    await api(app).get("/todos/abc").set(authHeader(user.token)).expect(400);
    await api(app).get("/todos/999999").set(authHeader(user.token)).expect(404);
  });

  it("requires authentication", async () => {
    await api(app).get("/todos").expect(401);
    await api(app).post("/todos").send({ title: "x" }).expect(401);
    await api(app).delete("/todos/1").expect(401);
  });

  it("isolates todos between users", async () => {
    const owner = await newUser();
    const other = await newUser();

    const created = await api(app)
      .post("/todos")
      .set(authHeader(owner.token))
      .send({ title: "Owned" })
      .expect(200);
    const id = created.body.id;

    const otherList = await api(app).get("/todos").set(authHeader(other.token)).expect(200);
    expect(otherList.body.map((todo: { id: number }) => todo.id)).not.toContain(id);

    await api(app).get(`/todos/${id}`).set(authHeader(other.token)).expect(404);
    await api(app).put(`/todos/${id}`).set(authHeader(other.token)).send({ completed: true }).expect(404);
    await api(app).delete(`/todos/${id}`).set(authHeader(other.token)).expect(404);
  });
});
