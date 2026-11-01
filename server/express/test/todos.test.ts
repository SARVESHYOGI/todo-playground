import { afterAll, describe, expect, it } from 'vitest'
import { api, authHeader, registerUser, teardown } from './helpers.ts'

const createdIds: number[] = []

afterAll(() => teardown(createdIds))

async function newUser() {
  const user = await registerUser()
  createdIds.push(user.id)
  return user
}

describe('todos', () => {
  it('creates a todo owned by the caller', async () => {
    const user = await newUser()

    const res = await api
      .post('/todos')
      .set(authHeader(user.token))
      .send({ title: 'Write tests', description: 'with vitest' })
      .expect(200)

    expect(res.body).toMatchObject({
      title: 'Write tests',
      description: 'with vitest',
      completed: false,
      authorId: user.id,
    })
  })

  it('lists, gets and updates a todo', async () => {
    const user = await newUser()
    const created = await api.post('/todos').set(authHeader(user.token)).send({ title: 'Task' }).expect(200)
    const id = created.body.id

    const list = await api.get('/todos').set(authHeader(user.token)).expect(200)
    expect(list.body.map((todo: { id: number }) => todo.id)).toContain(id)

    const got = await api.get(`/todos/${id}`).set(authHeader(user.token)).expect(200)
    expect(got.body.id).toBe(id)

    const updated = await api
      .put(`/todos/${id}`)
      .set(authHeader(user.token))
      .send({ completed: true })
      .expect(200)
    expect(updated.body.completed).toBe(true)
  })

  it('deletes a todo', async () => {
    const user = await newUser()
    const created = await api.post('/todos').set(authHeader(user.token)).send({ title: 'Temp' }).expect(200)

    await api.delete(`/todos/${created.body.id}`).set(authHeader(user.token)).expect(200)
    await api.get(`/todos/${created.body.id}`).set(authHeader(user.token)).expect(404)
  })

  it('validates input', async () => {
    const user = await newUser()

    await api.post('/todos').set(authHeader(user.token)).send({}).expect(400)
    await api.post('/todos').set(authHeader(user.token)).send({ title: '' }).expect(400)
    await api.put('/todos/1').set(authHeader(user.token)).send({}).expect(400)
    await api.get('/todos/abc').set(authHeader(user.token)).expect(400)
    await api.get('/todos/999999').set(authHeader(user.token)).expect(404)
  })

  it('requires authentication', async () => {
    await api.get('/todos').expect(401)
    await api.post('/todos').send({ title: 'x' }).expect(401)
    await api.delete('/todos/1').expect(401)
  })

  it('isolates todos between users', async () => {
    const owner = await newUser()
    const other = await newUser()

    const created = await api
      .post('/todos')
      .set(authHeader(owner.token))
      .send({ title: 'Owned' })
      .expect(200)
    const id = created.body.id

    const otherList = await api.get('/todos').set(authHeader(other.token)).expect(200)
    expect(otherList.body.map((todo: { id: number }) => todo.id)).not.toContain(id)

    await api.get(`/todos/${id}`).set(authHeader(other.token)).expect(404)
    await api.put(`/todos/${id}`).set(authHeader(other.token)).send({ completed: true }).expect(404)
    await api.delete(`/todos/${id}`).set(authHeader(other.token)).expect(404)
  })
})
