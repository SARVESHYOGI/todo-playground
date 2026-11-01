import { useState } from 'react'
import AuthScreen from './components/AuthScreen.tsx'
import TodosScreen from './components/TodosScreen.tsx'
import { clearToken, getToken } from './api/token.ts'
import './App.css'

function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))

  function handleLogout() {
    clearToken()
    setAuthed(false)
  }

  return (
    <main className="app">
      {authed ? (
        <TodosScreen onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthenticated={() => setAuthed(true)} />
      )}
    </main>
  )
}

export default App
