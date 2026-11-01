import { useMutation, useQuery } from '@tanstack/react-query'
import { loginMutationOptions, meQueryOptions, registerMutationOptions } from '../api/queryOptions'

export function useMe() {
  return useQuery(meQueryOptions())
}

export function useLogin() {
  return useMutation(loginMutationOptions)
}

export function useRegister() {
  return useMutation(registerMutationOptions)
}
