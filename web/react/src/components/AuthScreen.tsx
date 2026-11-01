import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLogin, useRegister } from '../hooks/useAuth'
import { getErrorMessage } from '../api/api'
import { setToken } from '../api/token'

type Mode = 'login' | 'register'

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const login = useLogin()
  const register = useRegister()
  const busy = login.isPending || register.isPending
  const isRegister = mode === 'register'

  function switchMode() {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      const result = isRegister
        ? await register.mutateAsync({ email, password, name: name || undefined })
        : await login.mutateAsync({ email, password })
      setToken(result.token)
      onAuthenticated()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="auth">
      <h1>{isRegister ? 'Create account' : 'Sign in'}</h1>
      <p className="muted">{isRegister ? 'Start tracking your todos.' : 'Welcome back.'}</p>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>

        {isRegister && (
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}>
          {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="muted">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" className="link" onClick={switchMode}>
          {isRegister ? 'Sign in' : 'Register'}
        </button>
      </p>
    </section>
  )
}
