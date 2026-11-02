# Todo API — NestJS backend

NestJS 11 (Express platform) + Prisma ORM 8 backend for the todo app. It exposes
the same API as the Express and Fastify siblings: bearer-token auth, per-user
todo CRUD, and the same `{ error }` / `{ errors }` envelopes.

## Layout

```
src/
  main.ts                     # listen + graceful shutdown
  app.factory.ts              # createApp(): builds the app without listening
  app.module.ts               # root module
  config/env.ts               # dotenvx loading and env defaults
  common/
    auth.guard.ts             # Bearer guard, sets request.userId
    current-user.decorator.ts # @CurrentUser()
    http-exception.filter.ts  # { error } / { errors }, driver errors, 404
    id-param.pipe.ts          # ":id" must be a positive integer
    schema-validation.pipe.ts # body validation
    validation.ts             # ported from the express sibling
    password.ts, token.ts
  health/
  todos/                      # module, controller, service, schema
  users/                      # module, controller, service, schema
  prisma/                     # contract.prisma/json/d.ts and the db client
test/                         # vitest + supertest
migrations/                   # Prisma ORM migrations (same schema as the siblings)
```

## Setup

Requires Node 24+ and PostgreSQL 15+.

```bash
cd server/nest
cp .env.example .env          # then set DATABASE_URL and TOKEN_SECRET
npm install
npx prisma db migrate         # create the tables (or `prisma db update`)
```

The committed `.env` is dotenvx-encrypted and is decrypted with `.env.keys`
(gitignored). A plain `.env` works too; `@dotenvx/dotenvx` reads both.

## Build and run

Unlike the Express and Fastify siblings, this app cannot run straight from
TypeScript: NestJS needs `experimentalDecorators` plus `emitDecoratorMetadata`,
which Node's type stripping (and the siblings' `erasableSyntaxOnly` config)
does not support. It is compiled with SWC to CommonJS instead.

```bash
npm run build                 # swc src -d dist --copy-files
npm start                     # node dist/main.js, http://localhost:3002
npm run dev                   # rebuild on change
```

Port 3002 is the default so the Express (3000) and Fastify (3001) siblings can
run at the same time. Override it with `PORT`.

## Test / typecheck

```bash
npm test                      # vitest + supertest against the real DB
npm run typecheck             # tsc --noEmit
```

Vitest transforms the sources with `unplugin-swc` so decorator metadata behaves
exactly as it does in the build. The tests register throwaway users, exercise the
API through supertest, then delete the rows and close the pool, so they need a
reachable `DATABASE_URL` with the migrations applied.

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

A Postman collection lives in `postman/Nest-Todo-Collection.json`.

## Differences from the express sibling

The contract is the express one, but three edge cases are deliberately not
bug-compatible:

- **Malformed JSON** answers 400 `{ "error": "Bad Request" }`; express answers 500
  because its error handler ignores `err.status`. (`fastify` answers 400 with the
  parser message.)
- **`/users/me` when the row is gone** answers 200 with an empty body; express
  answers 200 with `null`. `fastify` answers 404.
- **Validation order** for `PUT`/`DELETE /users/:id` runs the pipes before the
  ownership check, so a forbidden id combined with an invalid body answers 400
  instead of express's 403.
