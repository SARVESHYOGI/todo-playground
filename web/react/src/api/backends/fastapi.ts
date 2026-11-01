import api from '../api'
import type { Todo, User } from '../../types/api'
import type { BackendAdapter } from './types'

const PREFIX = '/api/v1'

interface FastApiUser {
  id: string
  email: string
  username: string | null
  name: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

interface FastApiTodo {
  id: string
  title: string
  description: string | null
  completed: boolean
  owner_id: string
  created_at: string
}

interface FastApiToken {
  access_token: string
  token_type: string
}

interface FastApiTodoList {
  data: FastApiTodo[]
  count: number
}

const formConfig = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
}

export function toUser(raw: FastApiUser): User {
  return {
    id: raw.id,
    email: raw.email,
    username: raw.username ?? null,
    name: raw.name ?? null,
    createdAt: raw.created_at,
    // The FastAPI user schema does not expose an updated timestamp.
    updatedAt: null,
  }
}

export function toTodo(raw: FastApiTodo): Todo {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? null,
    completed: raw.completed,
    authorId: raw.owner_id,
    createdAt: raw.created_at,
    // The FastAPI todo schema does not expose an updated timestamp.
    updatedAt: null,
  }
}

async function requestToken(email: string, password: string): Promise<FastApiToken> {
  const body = new URLSearchParams({ username: email, password })
  const { data } = await api.post<FastApiToken>(
    `${PREFIX}/login/access-token`,
    body,
    formConfig,
  )
  return data
}

/** Adapter for the FastAPI backend (OAuth2 token login, `/api/v1` prefix). */
export const fastapiBackend: BackendAdapter = {
  auth: {
    register: async (input) => {
      const { data: created } = await api.post<FastApiUser>(
        `${PREFIX}/users/register`,
        {
          email: input.email,
          password: input.password,
          username: input.username ?? null,
          name: input.name ?? null,
        },
      )
      // FastAPI's register endpoint returns the user without a token, so we
      // sign in immediately to match the Express flow (auto-login).
      const token = await requestToken(input.email, input.password)
      return { user: toUser(created), token: token.access_token }
    },
    login: async (input) => {
      const token = await requestToken(input.email, input.password)
      const { data: me } = await api.get<FastApiUser>(`${PREFIX}/users/me`, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
      return { user: toUser(me), token: token.access_token }
    },
    me: async () => {
      const { data } = await api.get<FastApiUser>(`${PREFIX}/users/me`)
      return toUser(data)
    },
  },
  users: {
    get: async (id) => {
      const { data } = await api.get<FastApiUser>(`${PREFIX}/users/${id}`)
      return toUser(data)
    },
    update: async (id, input) => {
      const { data } = await api.patch<FastApiUser>(`${PREFIX}/users/${id}`, input)
      return toUser(data)
    },
    remove: async (id) => {
      await api.delete(`${PREFIX}/users/${id}`)
    },
  },
  todos: {
    list: async () => {
      const { data } = await api.get<FastApiTodoList>(`${PREFIX}/todos/`)
      return data.data.map(toTodo)
    },
    get: async (id) => {
      const { data } = await api.get<FastApiTodo>(`${PREFIX}/todos/${id}`)
      return toTodo(data)
    },
    create: async (input) => {
      const { data } = await api.post<FastApiTodo>(`${PREFIX}/todos/`, {
        title: input.title,
        description: input.description ?? null,
      })
      return toTodo(data)
    },
    update: async (id, input) => {
      const { data } = await api.patch<FastApiTodo>(`${PREFIX}/todos/${id}`, input)
      return toTodo(data)
    },
    remove: async (id) => {
      await api.delete(`${PREFIX}/todos/${id}`)
    },
  },
}
