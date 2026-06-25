import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const DogsContext = createContext()

const API = 'http://localhost:3002'
const WS_URL = 'ws://localhost:3003'

export function DogsProvider({ children }) {
  const { token } = useAuth()
  const [dogs, setDogs] = useState([])

  useEffect(() => {
    if (!token) return

    fetch(`${API}/dogs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setDogs)
      .catch(() => {})

    const ws = new WebSocket(WS_URL)

    ws.onmessage = (e) => {
      const { event, dog, dogId } = JSON.parse(e.data)
      setDogs((prev) => {
        if (event === 'created') return [dog, ...prev]
        if (event === 'updated') return prev.map((d) => (d._id === dog._id ? dog : d))
        if (event === 'deleted') return prev.filter((d) => d._id !== dogId)
        return prev
      })
    }

    return () => ws.close()
  }, [token])

  async function createDog(data) {
    const res = await fetch(`${API}/dogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erro ao criar registro')
  }

  async function updateDog(id, data) {
    const res = await fetch(`${API}/dogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Erro ao atualizar registro')
    }
  }

  async function deleteDog(id) {
    const res = await fetch(`${API}/dogs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Erro ao excluir registro')
    }
  }

  return (
    <DogsContext.Provider value={{ dogs, createDog, updateDog, deleteDog }}>
      {children}
    </DogsContext.Provider>
  )
}

export function useDogs() {
  return useContext(DogsContext)
}
