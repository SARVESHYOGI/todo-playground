import { backend } from './backends'

/**
 * The API surface used by the app. Which backend is actually hit is decided at
 * runtime by `VITE_API_BACKEND` (see `./backends`).
 */
export const authApi = backend.auth
export const userApi = backend.users
export const todoApi = backend.todos
