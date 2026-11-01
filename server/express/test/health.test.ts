import { afterAll, describe, expect, it } from 'vitest'
import { api, teardown } from './helpers.ts'

afterAll(() => teardown([]))

describe('health', () => {
  it('returns 404 for an unknown route', async () => {
    const res = await api.get('/does-not-exist').expect(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })

  it('answers CORS preflight with 204 and the expected headers', async () => {
    const res = await api.options('/todos').expect(204)
    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toBe('GET, POST, PUT, DELETE, OPTIONS')
    expect(res.headers['access-control-allow-headers']).toBe('Content-Type, Authorization')
  })
})
