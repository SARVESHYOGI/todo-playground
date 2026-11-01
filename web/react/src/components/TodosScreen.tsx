import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, todoApi } from '../api/route.ts'
import { getErrorMessage, isUnauthorized } from '../api/api.ts'
import type { Todo } from '../types/api/index.ts'

export default function TodosScreen({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const me = useQuery({ queryKey: ['me'], queryFn: authApi.me })
  const todos = useQuery({ queryKey: ['todos'], queryFn: todoApi.list })

  useEffect(() => {
    if (isUnauthorized(todos.error)) onLogout()
  }, [todos.error, onLogout])

  function invalidateTodos() {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  const createTodo = useMutation({
    mutationFn: (input: { title: string }) => todoApi.create(input),
    onSuccess: () => {
      setTitle('')
      invalidateTodos()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const toggleTodo = useMutation({
    mutationFn: (todo: Todo) => todoApi.update(todo.id, { completed: !todo.completed }),
    onSuccess: invalidateTodos,
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteTodo = useMutation({
    mutationFn: (id: number) => todoApi.remove(id),
    onSuccess: invalidateTodos,
    onError: (err) => setError(getErrorMessage(err)),
  })

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setError(null)
    createTodo.mutate({ title: trimmed })
  }

  const list = todos.data ?? []

  return (
    <section className="todos">
      <header className="todos-header">
        <div>
          <h1>Todos</h1>
          <p className="muted">{me.data ? `Signed in as ${me.data.email}` : 'Your tasks'}</p>
        </div>
        <button type="button" className="link" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <form className="add" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What needs doing?"
          aria-label="New todo title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit" disabled={createTodo.isPending || !title.trim()}>
          {createTodo.isPending ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {todos.isLoading ? (
        <p className="muted">Loading...</p>
      ) : todos.isError ? (
        <p className="error" role="alert">
          {getErrorMessage(todos.error)}
        </p>
      ) : list.length === 0 ? (
        <p className="muted">No todos yet. Add your first one above.</p>
      ) : (
        <ul className="todo-list">
          {list.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'todo done' : 'todo'}>
              <label className="todo-main">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  disabled={toggleTodo.isPending}
                  onChange={() => toggleTodo.mutate(todo)}
                />
                <span className="todo-title">{todo.title}</span>
              </label>
              <button
                type="button"
                className="link danger"
                disabled={deleteTodo.isPending}
                aria-label={`Delete ${todo.title}`}
                onClick={() => deleteTodo.mutate(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
