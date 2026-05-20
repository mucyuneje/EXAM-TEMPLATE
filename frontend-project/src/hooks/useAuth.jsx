import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client.js'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  function saveSession(token, userData) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = useCallback(async ({ username, password }) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { username, password })
      saveSession(data.token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' }
    } finally { setLoading(false) }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', payload)
      saveSession(data.token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Registration failed' }
    } finally { setLoading(false) }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  const getSecurityQuestion = useCallback(async (username) => {
    const { data } = await api.post('/api/auth/security-question', { username })
    return data.question
  }, [])

  const recoverPassword = useCallback(async (payload) => {
    setLoading(true)
    try {
      await api.post('/api/auth/recover', payload)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Recovery failed' }
    } finally { setLoading(false) }
  }, [])

  return (
    <Ctx.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      login, register, logout,
      getSecurityQuestion, recoverPassword,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
