import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTodoMutationOptions,
  deleteTodoMutationOptions,
  todosQueryOptions,
  updateTodoMutationOptions,
} from '../api/queryOptions'
import { queryKeys } from '../api/queryKeys'

export function useTodos() {
  return useQuery(todosQueryOptions())
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTodoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos }),
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    ...updateTodoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos }),
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    ...deleteTodoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos }),
  })
}
