# Todo API — Fastify backend

Fastify 5 + Prisma ORM 8 backend for the todo app. It exposes the same API as
the Express sibling: bearer-token auth, per-user todo CRUD, JSON Schema
validation, and the same `{ error }` / `{ errors }` envelopes.

## Layout

```
src/
  app.ts                     # buildApp(): plugins, CORS, error handler, routes
  server.ts                  # listen + graceful shutdown
  config/env.ts              # dotenvx loading and env defaults
  plugins/
    auth.plugin.ts           # request.userId + reusable app.authenticate preHandler
    error-handler.plugin.ts  # validation messages, driver errors, 404 handler
  routes/
    todo.routes.ts
    user.routes.ts           # public register/login + authenticated me/:id
  schemas/                   # JSON Schema for bodies, params and responses
  services/                  # ORM queries (todo.service, user.service)
  utils/                     # passwords, tokens, trimming, validation messages
  prisma/                    # contract.prisma/json/d.ts and the db client
test/                        # vitest, driving the app with fastify.inject()
migrations/                  # Prisma ORM migrations (same schema as Express)
```

## Setup

Requires Node 24+ and PostgreSQL 15+.

```bash
cd server/fastify
cp .env.example .env          # then set DATABASE_URL and TOKEN_SECRET
npm install
npx prisma db migrate         # create the tables (or `prisma db update`)
```

The committed `.env` is dotenvx-encrypted and is decrypted with `.env.keys`
(gitignored). A plain `.env` works too; `@dotenvx/dotenvx` reads both.

## Run

```bash
npm run dev                   # node --watch, http://localhost:3001
npm start                     # one-off run
```

Port 3001 is the default so the Express sibling (3000) can run at the same
time. Override it with `PORT`.

## Test / typecheck

```bash
npm test                      # vitest + fastify.inject() against the real DB
npm run typecheck             # tsc --noEmit
```

The tests register throwaway users, exercise the API through `app.inject()`,
then delete the rows and close the pool, so they need a reachable
`DATABASE_URL` with the migrations applied.

## Endpoints

| Method | Path             | Auth | Notes                                         |
| ------ | ---------------- | ---- | --------------------------------------------- |
| GET    | `/health`        | no   | `{ "status": "ok" }`                          |
| POST   | `/users/register`| no   | 201 with `{ user, token }`; duplicate → 409   |
| POST   | `/users/login`   | no   | 200 with `{ user, token }`; bad login → 401   |
| GET    | `/users/me`      | yes  | public user record                            |
| GET    | `/users/:id`     | yes  | self only, otherwise 403                      |
| PUT    | `/users/:id`     | yes  | self only, otherwise 403                      |
| DELETE | `/users/:id`     | yes  | self only, otherwise 403                      |
| GET    | `/todos`         | yes  | the caller's todos                            |
| POST   | `/todos`         | yes  | `{ title, description? }`                     |
| GET    | `/todos/:id`     | yes  | 404 when the todo belongs to someone else     |
| PUT    | `/todos/:id`     | yes  | partial update                                |
| DELETE | `/todos/:id`     | yes  | returns the deleted todo                      |

Send the token as `Authorization: Bearer <token>`.

A Postman collection for manual exploration lives in
`postman/Fastify-Todo-Collection.json` (set the `token` variable from the
register/login response before calling the todo endpoints).