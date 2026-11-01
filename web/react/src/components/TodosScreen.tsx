import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMe } from '../hooks/useAuth.ts'
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '../hooks/useTodos.ts'
import { getErrorMessage, isUnauthorized } from '../api/api.ts'

export default function TodosScreen({ onLogout }: { onLogout: () => void }) {
  const [title, setTitle] = useState('')

  const me = useMe()
  const todos = useTodos()
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  useEffect(() => {
    if (isUnauthorized(todos.error)) onLogout()
  }, [todos.error, onLogout])

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    createTodo.mutate({ title: trimmed }, { onSuccess: () => setTitle('') })
  }

  const list = todos.data ?? []
  const actionError = createTodo.error ?? updateTodo.error ?? deleteTodo.error

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

      {actionError && (
        <p className="error" role="alert">
          {getErrorMessage(actionError)}
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
                  disabled={updateTodo.isPending}
                  onChange={() => updateTodo.mutate({ id: todo.id, data: { completed: !todo.completed } })}
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
