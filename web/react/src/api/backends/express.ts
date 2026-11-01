import api from '../api'
import type { AuthResponse, Todo, User } from '../../types/api'
import type { BackendAdapter } from './types'

/** Adapter for the Express backend (responses already match the domain types). */
export const expressBackend: BackendAdapter = {
  auth: {
    register: async (input) => {
      const { data } = await api.post<AuthResponse>('/users/register', input)
      return data
    },
    login: async (input) => {
      const { data } = await api.post<AuthResponse>('/users/login', input)
      return data
    },
    me: async () => {
      const { data } = await api.get<User>('/users/me')
      return data
    },
  },
  users: {
    get: async (id) => {
      const { data } = await api.get<User>(`/users/${id}`)
      return data
    },
    update: async (id, input) => {
      const { data } = await api.put<User>(`/users/${id}`, input)
      return data
    },
    remove: async (id) => {
      await api.delete(`/users/${id}`)
    },
  },
  todos: {
    list: async () => {
      const { data } = await api.get<Todo[]>('/todos')
      return data
    },
    get: async (id) => {
      const { data } = await api.get<Todo>(`/todos/${id}`)
      return data
    },
    create: async (input) => {
      const { data } = await api.post<Todo>('/todos', input)
      return data
    },
    update: async (id, input) => {
      const { data } = await api.put<Todo>(`/todos/${id}`, input)
      return data
    },
    remove: async (id) => {
      await api.delete(`/todos/${id}`)
    },
  },
}
