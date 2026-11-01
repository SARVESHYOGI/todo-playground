# React + TypeScript + Vite

## Backend adapter

The API layer can talk to either backend. Select one with `VITE_API_BACKEND`
(in a local `.env` or the shell):

| Value | Backend | Default base URL |
|---|---|---|
| `express` (default) | `server/express` | `http://localhost:8000` |
| `fastapi` | `server/fastapi` | `http://localhost:8000` |

Override the base URL with `VITE_API_URL`:

```
VITE_API_BACKEND=fastapi
VITE_API_URL=http://localhost:8000
```

Both backends are consumed through the same domain types (`src/types/api`) and
`authApi` / `userApi` / `todoApi` (`src/api/route.ts`). The adapters in
`src/api/backends/` translate each backend's contract — e.g. FastAPI's
`/api/v1` prefix, form-encoded OAuth2 login, `owner_id`/`created_at` fields,
`{ data, count }` list envelope, `PATCH` for updates, and 403 (not 401) for an
invalid token.

If both servers run at once, give them different ports and set `VITE_API_URL`
to the selected one.

## Testing

`npm test` runs [Vitest](https://vitest.dev). Offline unit tests cover the
FastAPI response mappers, the Express adapter (with a mocked axios client),
and the error helpers, so they run without a backend.

The suite in `src/api/backends/fastapi.integration.test.ts` drives the real
FastAPI adapter against a live backend and skips itself automatically when none
is reachable, so `npm test` stays green without a server:

```bash
# terminal 1
cd server/fastapi && uv run fastapi dev app/main.py
# terminal 2
cd web/react && npm test
```

Set `FASTAPI_TEST_URL` to target a non-default host/port.

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
