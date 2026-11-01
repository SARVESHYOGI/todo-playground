import { backendName } from '../backendConfig'
import { expressBackend } from './express'
import { fastapiBackend } from './fastapi'
import type { BackendAdapter } from './types'

const backends: Record<string, BackendAdapter> = {
  express: expressBackend,
  fastapi: fastapiBackend,
}

/** The adapter for the backend selected by `VITE_API_BACKEND`. */
export const backend: BackendAdapter = backends[backendName] ?? expressBackend
