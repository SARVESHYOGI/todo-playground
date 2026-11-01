import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import api from '../api'
import { fastapiBackend, toTodo, toUser } from './fastapi'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedApi = api as unknown as {
  get: Mock
  post: Mock
  put: Mock
  patch: Mock
  delete: Mock
}

/** What the FastAPI backend actually returns (snake_case). */
const fastApiUser = {
  id: '3f1a-uuid',
  email: 'ada@example.com',
  username: null,
  name: 'Ada',
  is_active: true,
  is_superuser: false,
  created_at: '2026-01-01T00:00:00.000Z',
}

const fastApiTodo = {
  id: 'b2c3-uuid',
  title: 'Buy milk',
  description: null,
  completed: false,
  owner_id: '3f1a-uuid',
  created_at: '2026-01-01T00:00:00.000Z',
}

/** What the app expects after mapping. */
const domainUser = {
  id: '3f1a-uuid',
  email: 'ada@example.com',
  username: null,
  name: 'Ada',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
}

const domainTodo = {
  id: 'b2c3-uuid',
  title: 'Buy milk',
  description: null,
  completed: false,
  authorId: '3f1a-uuid',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
}

const formHeaders = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toUser', () => {
  it('maps the snake_case payload and drops the missing updated_at', () => {
    expect(toUser(fastApiUser)).toEqual(domainUser)
  })
})

describe('toTodo', () => {
  it('maps owner_id/created_at and leaves updatedAt null', () => {
    expect(toTodo(fastApiTodo)).toEqual(domainTodo)
  })

  it('preserves a description when present', () => {
    expect(toTodo({ ...fastApiTodo, description: 'oat milk' }).description).toBe('oat milk')
  })
})

describe('fastapiBackend.auth', () => {
  it('registers, then logs in to obtain a token', async () => {
    mockedApi.post
      .mockResolvedValueOnce({ data: fastApiUser })
      .mockResolvedValueOnce({ data: { access_token: 'token-1', token_type: 'bearer' } })

    const result = await fastapiBackend.auth.register({
      email: 'ada@example.com',
      password: 'password123',
      name: 'Ada',
    })

    expect(result).toEqual({ token: 'token-1', user: domainUser })

    expect(mockedApi.post).toHaveBeenNthCalledWith(1, '/api/v1/users/register', {
      email: 'ada@example.com',
      password: 'password123',
      username: null,
      name: 'Ada',
    })

    const [path, body, config] = mockedApi.post.mock.calls[1]
    expect(path).toBe('/api/v1/login/access-token')
    expect(body).toBeInstanceOf(URLSearchParams)
    expect((body as URLSearchParams).get('username')).toBe('ada@example.com')
    expect((body as URLSearchParams).get('password')).toBe('password123')
    expect(config).toEqual(formHeaders)
  })

  it('logs in with form-encoded credentials and loads the user', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { access_token: 'token-2', token_type: 'bearer' },
    })
    mockedApi.get.mockResolvedValueOnce({ data: fastApiUser })

    const result = await fastapiBackend.auth.login({
      email: 'ada@example.com',
      password: 'password123',
    })

    expect(result).toEqual({ token: 'token-2', user: domainUser })
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/api/v1/login/access-token',
      expect.any(URLSearchParams),
      formHeaders,
    )
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/users/me', {
      headers: { Authorization: 'Bearer token-2' },
    })
  })

  it('loads the current user with GET /api/v1/users/me', async () => {
    mockedApi.get.mockResolvedValue({ data: fastApiUser })

    await expect(fastapiBackend.auth.me()).resolves.toEqual(domainUser)
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/users/me')
  })
})

describe('fastapiBackend.todos', () => {
  it('lists todos and unwraps the { data, count } envelope', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [fastApiTodo], count: 1 } })

    await expect(fastapiBackend.todos.list()).resolves.toEqual([domainTodo])
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/todos/')
  })

  it('gets one with GET /api/v1/todos/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: fastApiTodo })

    await expect(fastapiBackend.todos.get('b2c3-uuid')).resolves.toEqual(domainTodo)
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/todos/b2c3-uuid')
  })

  it('creates with POST /api/v1/todos/', async () => {
    mockedApi.post.mockResolvedValue({ data: fastApiTodo })

    await expect(fastapiBackend.todos.create({ title: 'Buy milk' })).resolves.toEqual(domainTodo)
    expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/todos/', {
      title: 'Buy milk',
      description: null,
    })
  })

  it('updates with PATCH /api/v1/todos/:id', async () => {
    const updated = { ...fastApiTodo, completed: true }
    mockedApi.patch.mockResolvedValue({ data: updated })

    await expect(fastapiBackend.todos.update('b2c3-uuid', { completed: true })).resolves.toEqual({
      ...domainTodo,
      completed: true,
    })
    expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/todos/b2c3-uuid', { completed: true })
  })

  it('removes with DELETE /api/v1/todos/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: { message: 'Todo deleted successfully' } })

    await expect(fastapiBackend.todos.remove('b2c3-uuid')).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/todos/b2c3-uuid')
  })
})

describe('fastapiBackend.users', () => {
  it('gets one with GET /api/v1/users/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: fastApiUser })

    await expect(fastapiBackend.users.get('3f1a-uuid')).resolves.toEqual(domainUser)
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/users/3f1a-uuid')
  })

  it('updates with PATCH /api/v1/users/:id', async () => {
    mockedApi.patch.mockResolvedValue({ data: fastApiUser })

    await expect(fastapiBackend.users.update('3f1a-uuid', { name: 'Ada L' })).resolves.toEqual(
      domainUser,
    )
    expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/users/3f1a-uuid', { name: 'Ada L' })
  })

  it('removes with DELETE /api/v1/users/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: { message: 'User deleted successfully' } })

    await expect(fastapiBackend.users.remove('3f1a-uuid')).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/users/3f1a-uuid')
  })
})
