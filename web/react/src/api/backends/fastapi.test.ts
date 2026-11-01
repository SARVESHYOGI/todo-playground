import { describe, expect, it } from 'vitest'
import { toTodo, toUser } from './fastapi'

describe('toUser', () => {
  it('maps the FastAPI snake_case payload onto the domain User', () => {
    const result = toUser({
      id: '3f1a-uuid',
      email: 'ada@example.com',
      username: null,
      name: 'Ada',
      is_active: true,
      is_superuser: false,
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(result).toEqual({
      id: '3f1a-uuid',
      email: 'ada@example.com',
      username: null,
      name: 'Ada',
      createdAt: '2026-01-01T00:00:00.000Z',
      // FastAPI's user schema has no updated_at.
      updatedAt: null,
    })
  })
})

describe('toTodo', () => {
  it('maps owner_id/created_at and leaves updatedAt null', () => {
    const result = toTodo({
      id: 'b2c3-uuid',
      title: 'Buy milk',
      description: null,
      completed: true,
      owner_id: '3f1a-uuid',
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(result).toEqual({
      id: 'b2c3-uuid',
      title: 'Buy milk',
      description: null,
      completed: true,
      authorId: '3f1a-uuid',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
    })
  })

  it('preserves a description when present', () => {
    const result = toTodo({
      id: 'b2c3-uuid',
      title: 'Buy milk',
      description: 'oat milk',
      completed: false,
      owner_id: '3f1a-uuid',
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(result.description).toBe('oat milk')
  })
})
