import { useState } from 'react'
import AuthScreen from './components/AuthScreen'
import TodosScreen from './components/TodosScreen'
import { clearToken, getToken } from './api/token'
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
