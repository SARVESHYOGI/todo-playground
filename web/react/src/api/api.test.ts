import { describe, expect, it } from 'vitest'
import { getErrorMessage, isUnauthorized } from './api'

/** Builds the minimal shape axios treats as an `AxiosError`. */
function axiosError(status: number, data: unknown): unknown {
  return {
    isAxiosError: true,
    message: 'Request failed',
    response: { status, data },
  }
}

describe('getErrorMessage', () => {
  it('reads the Express { error } shape', () => {
    const error = axiosError(409, { error: 'Email is already registered' })
    expect(getErrorMessage(error)).toBe('Email is already registered')
  })

  it('joins the Express { errors } array', () => {
    const error = axiosError(400, { errors: ['bad email', 'short password'] })
    expect(getErrorMessage(error)).toBe('bad email, short password')
  })

  it('reads the FastAPI string detail', () => {
    const error = axiosError(409, { detail: 'User already exists' })
    expect(getErrorMessage(error)).toBe('User already exists')
  })

  it('joins the FastAPI validation detail array', () => {
    const error = axiosError(422, {
      detail: [{ msg: 'field required' }, { msg: 'invalid email' }],
    })
    expect(getErrorMessage(error)).toBe('field required, invalid email')
  })

  it('falls back to the axios message', () => {
    expect(getErrorMessage(axiosError(500, {}))).toBe('Request failed')
  })

  it('handles non-axios errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage('nope')).toBe('Unknown error')
  })
})

describe('isUnauthorized', () => {
  it('is true for 401', () => {
    expect(isUnauthorized(axiosError(401, {}))).toBe(true)
  })

  it('is false for other statuses', () => {
    expect(isUnauthorized(axiosError(500, {}))).toBe(false)
  })

  it('is false for non-axios errors', () => {
    expect(isUnauthorized(new Error('boom'))).toBe(false)
  })
})
