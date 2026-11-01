import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { authApi, todoApi } from './route'
import { queryKeys } from './queryKeys'
import type {
  CreateTodoInput,
  EntityId,
  LoginInput,
  RegisterInput,
  UpdateTodoInput,
} from '../types/api'

export const meQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
  })

export const todosQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.todos,
    queryFn: todoApi.list,
  })

export const loginMutationOptions = mutationOptions({
  mutationFn: (input: LoginInput) => authApi.login(input),
})

export const registerMutationOptions = mutationOptions({
  mutationFn: (input: RegisterInput) => authApi.register(input),
})

export const createTodoMutationOptions = mutationOptions({
  mutationFn: (input: CreateTodoInput) => todoApi.create(input),
})

export const updateTodoMutationOptions = mutationOptions({
  mutationFn: (input: { id: EntityId; data: UpdateTodoInput }) =>
    todoApi.update(input.id, input.data),
})

export const deleteTodoMutationOptions = mutationOptions({
  mutationFn: (id: EntityId) => todoApi.remove(id),
})
