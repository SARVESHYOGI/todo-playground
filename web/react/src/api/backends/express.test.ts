import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import api from '../api'
import { expressBackend } from './express'

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

const user = {
  id: 7,
  email: 'ada@example.com',
  username: 'ada',
  name: 'Ada',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const todo = {
  id: 1,
  title: 'Buy milk',
  description: null,
  completed: false,
  authorId: 7,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('expressBackend.auth', () => {
  it('registers with POST /users/register', async () => {
    const payload = { user, token: 'token-1' }
    mockedApi.post.mockResolvedValue({ data: payload })

    const input = { email: 'ada@example.com', password: 'password123' }
    await expect(expressBackend.auth.register(input)).resolves.toEqual(payload)
    expect(mockedApi.post).toHaveBeenCalledWith('/users/register', input)
  })

  it('logs in with POST /users/login', async () => {
    const payload = { user, token: 'token-2' }
    mockedApi.post.mockResolvedValue({ data: payload })

    const input = { email: 'ada@example.com', password: 'password123' }
    await expect(expressBackend.auth.login(input)).resolves.toEqual(payload)
    expect(mockedApi.post).toHaveBeenCalledWith('/users/login', input)
  })

  it('loads the current user with GET /users/me', async () => {
    mockedApi.get.mockResolvedValue({ data: user })

    await expect(expressBackend.auth.me()).resolves.toEqual(user)
    expect(mockedApi.get).toHaveBeenCalledWith('/users/me')
  })
})

describe('expressBackend.todos', () => {
  it('lists with GET /todos', async () => {
    mockedApi.get.mockResolvedValue({ data: [todo] })

    await expect(expressBackend.todos.list()).resolves.toEqual([todo])
    expect(mockedApi.get).toHaveBeenCalledWith('/todos')
  })

  it('gets one with GET /todos/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: todo })

    await expect(expressBackend.todos.get(1)).resolves.toEqual(todo)
    expect(mockedApi.get).toHaveBeenCalledWith('/todos/1')
  })

  it('creates with POST /todos', async () => {
    mockedApi.post.mockResolvedValue({ data: todo })

    const input = { title: 'Buy milk' }
    await expect(expressBackend.todos.create(input)).resolves.toEqual(todo)
    expect(mockedApi.post).toHaveBeenCalledWith('/todos', input)
  })

  it('updates with PUT /todos/:id', async () => {
    const updated = { ...todo, completed: true }
    mockedApi.put.mockResolvedValue({ data: updated })

    await expect(expressBackend.todos.update(1, { completed: true })).resolves.toEqual(updated)
    expect(mockedApi.put).toHaveBeenCalledWith('/todos/1', { completed: true })
  })

  it('removes with DELETE /todos/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: todo })

    await expect(expressBackend.todos.remove(1)).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/todos/1')
  })
})

describe('expressBackend.users', () => {
  it('gets one with GET /users/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: user })

    await expect(expressBackend.users.get(7)).resolves.toEqual(user)
    expect(mockedApi.get).toHaveBeenCalledWith('/users/7')
  })

  it('updates with PUT /users/:id', async () => {
    mockedApi.put.mockResolvedValue({ data: user })

    await expect(expressBackend.users.update(7, { name: 'Ada L' })).resolves.toEqual(user)
    expect(mockedApi.put).toHaveBeenCalledWith('/users/7', { name: 'Ada L' })
  })

  it('removes with DELETE /users/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: user })

    await expect(expressBackend.users.remove(7)).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/users/7')
  })
})
