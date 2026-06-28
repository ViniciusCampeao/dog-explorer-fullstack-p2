import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001'

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const user = token ? decodeToken(token) : null

  async function login(username, password) {
    const res = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Credenciais inválidas')
    const data = await res.json()
    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  async function logout() {
    if (token) {
      await fetch(`${AUTH_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
