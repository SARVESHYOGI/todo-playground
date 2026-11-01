import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../api/route.ts'
import { getErrorMessage } from '../api/api.ts'
import { setToken } from '../api/token.ts'

type Mode = 'login' | 'register'

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function switchMode() {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const result =
        mode === 'login'
          ? await authApi.login({ email, password })
          : await authApi.register({ email, password, name: name || undefined })
      setToken(result.token)
      onAuthenticated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <section className="auth">
      <h1>{isRegister ? 'Create account' : 'Sign in'}</h1>
      <p className="muted">
        {isRegister ? 'Start tracking your todos.' : 'Welcome back.'}
      </p>

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
