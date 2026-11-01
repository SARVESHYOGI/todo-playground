export type EntityId = string | number

export interface User {
  id: EntityId
  email: string
  username: string | null
  name: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Todo {
  id: EntityId
  title: string
  description: string | null
  completed: boolean
  authorId: EntityId | null
  createdAt: string
  updatedAt: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  email: string
  password: string
  username?: string | null
  name?: string | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateUserInput {
  email?: string
  username?: string | null
  name?: string | null
}

export interface CreateTodoInput {
  title: string
  description?: string | null
}

export interface UpdateTodoInput {
  title?: string
  description?: string | null
  completed?: boolean
}

export interface ApiError {
  error?: string
  errors?: string[]
  detail?: string | { msg?: string }[]
}
