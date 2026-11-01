const BACKEND_NAMES = ['express', 'fastapi'] as const

export type BackendName = (typeof BACKEND_NAMES)[number]

function resolveBackendName(): BackendName {
  const raw = (import.meta.env.VITE_API_BACKEND ?? 'express').toLowerCase()
  return (BACKEND_NAMES as readonly string[]).includes(raw) ? (raw as BackendName) : 'express'
}

/** Backend selected via `VITE_API_BACKEND` (defaults to `express`). */
export const backendName: BackendName = resolveBackendName()

/**
 * Statuses that mean "the session is no longer valid".
 *
 * Express answers 401 for a bad token, while FastAPI answers 403.
 */
export const authErrorStatuses: readonly number[] =
  backendName === 'fastapi' ? [401, 403] : [401]
