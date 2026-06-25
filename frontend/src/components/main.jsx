import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AnimalProvider } from '../contexts/AnimalContext.jsx'
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx'
import { DogsProvider } from '../contexts/DogsContext.jsx'
import LoginForm from './LoginForm.jsx'

function Root() {
  const { token } = useAuth()
  if (!token) return <LoginForm />
  return (
    <AnimalProvider>
      <DogsProvider>
        <App />
      </DogsProvider>
    </AnimalProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
)
