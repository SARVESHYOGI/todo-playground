import { afterAll, describe, expect, it } from 'vitest'
import { api, authHeader, registerUser, teardown, uniqueEmail } from './helpers.ts'

const createdIds: number[] = []

afterAll(() => teardown(createdIds))

describe('auth', () => {
  it('registers a user and returns a token without the password hash', async () => {
    const email = uniqueEmail('auth')
    const res = await api
      .post('/users/register')
      .send({ email, password: 'password123', name: 'Auth User' })
      .expect(201)

    createdIds.push(res.body.user.id)
    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.user).toMatchObject({ email, name: 'Auth User' })
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects a duplicate email with 409', async () => {
    const user = await registerUser()
    createdIds.push(user.id)

    await api.post('/users/register').send({ email: user.email, password: 'password123' }).expect(409)
  })

  it('rejects an invalid email and a weak password with 400', async () => {
    const weak = await api
      .post('/users/register')
      .send({ email: uniqueEmail('weak'), password: 'short' })
      .expect(400)
    expect(weak.body.errors).toBeInstanceOf(Array)

    await api
      .post('/users/register')
      .send({ email: 'not-an-email', password: 'password123' })
      .expect(400)
  })

  it('logs in with valid credentials', async () => {
    const user = await registerUser()
    createdIds.push(user.id)

    const res = await api
      .post('/users/login')
      .send({ email: user.email, password: user.password })
      .expect(200)

    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects a wrong password and an unknown email with 401', async () => {
    const user = await registerUser()
    createdIds.push(user.id)

    await api.post('/users/login').send({ email: user.email, password: 'wrong-password' }).expect(401)
    await api.post('/users/login').send({ email: uniqueEmail('ghost'), password: 'password123' }).expect(401)
  })

  it('rejects requests without a token or with a malformed token', async () => {
    await api.get('/users/me').expect(401)
    await api.get('/users/me').set(authHeader('garbage.sig')).expect(401)
  })

  it('returns the current user from /users/me', async () => {
    const user = await registerUser()
    createdIds.push(user.id)

    const res = await api.get('/users/me').set(authHeader(user.token)).expect(200)
    expect(res.body).toMatchObject({ id: user.id, email: user.email })
    expect(res.body).not.toHaveProperty('passwordHash')
  })

  it('forbids reading or modifying another account with 403', async () => {
    const a = await registerUser()
    const b = await registerUser()
    createdIds.push(a.id, b.id)

    await api.get(`/users/${a.id}`).set(authHeader(a.token)).expect(200)
    await api.get(`/users/${a.id}`).set(authHeader(b.token)).expect(403)
    await api.put(`/users/${a.id}`).set(authHeader(b.token)).send({ name: 'hax' }).expect(403)
    await api.delete(`/users/${a.id}`).set(authHeader(b.token)).expect(403)
  })
})
