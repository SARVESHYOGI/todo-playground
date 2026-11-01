import { afterAll, describe, expect, it } from 'vitest'

/**
 * Drives the real FastAPI adapter (`src/api/backends/fastapi.ts`) against a
 * running `server/fastapi` instance.
 *
 * The suite skips itself when nothing answers the health check, so `npm test`
 * stays green without a server. To run it:
 *
 *   cd server/fastapi && uv run fastapi dev app/main.py
 *   cd web/react && npm test
 *
 * Point it at a different host/port with `FASTAPI_TEST_URL`.
 */

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const { authApi, todoApi } = await import('../route')
const { clearToken, getToken, setToken } = await import('../token')
const { getErrorMessage, isUnauthorized } = await import('../api')

const email = `adapter-${Date.now()}@example.com`
const password = 'password123'

const reachable = await fetch(`${baseUrl}/api/v1/utils/health-check`)
  .then((response) => response.ok)
  .catch(() => false)

if (!reachable) {
  console.warn(
    `[fastapi.integration] no server at ${baseUrl}; skipping. ` +
      'Start it with: uv run fastapi dev app/main.py',
  )
}

describe.runIf(reachable)('FastAPI adapter against a live server', () => {
  it('registers a user and returns a token', async () => {
    const result = await authApi.register({
      email,
      password,
      name: 'Adapter Test',
    })
    expect(result.token).toBeTruthy()
    expect(result.user.email).toBe(email)
    expect(typeof result.user.id).toBe('string')
    setToken(result.token)
  })

  it('surfaces a readable message for a duplicate registration', async () => {
    let message = ''
    try {
      await authApi.register({ email, password })
    } catch (error) {
      message = getErrorMessage(error)
    }
    expect(message).toMatch(/already exists/i)
  })

  it('loads the current user', async () => {
    const me = await authApi.me()
    expect(me.email).toBe(email)
  })

  it('logs in with the same credentials', async () => {
    const result = await authApi.login({ email, password })
    expect(result.token).toBeTruthy()
    setToken(result.token)
  })

  it('creates, lists, updates, and removes a todo', async () => {
    const created = await todoApi.create({ title: 'Adapter todo' })
    expect(created.title).toBe('Adapter todo')
    expect(created.completed).toBe(false)
    expect(typeof created.id).toBe('string')
    expect(created.authorId).toBeTruthy()

    const listed = await todoApi.list()
    expect(listed.map((todo) => todo.id)).toContain(created.id)

    const updated = await todoApi.update(created.id, { completed: true })
    expect(updated.completed).toBe(true)

    const fetched = await todoApi.get(created.id)
    expect(fetched.completed).toBe(true)

    await todoApi.remove(created.id)
    await expect(todoApi.get(created.id)).rejects.toThrow()
  })

  it('treats an invalid token as unauthorized and clears it', async () => {
    setToken('not-a-real-token')
    let error: unknown
    try {
      await authApi.me()
    } catch (caught) {
      error = caught
    }
    expect(isUnauthorized(error)).toBe(true)
    expect(getToken()).toBeNull()
  })

  afterAll(() => {
    clearToken()
  })
})
