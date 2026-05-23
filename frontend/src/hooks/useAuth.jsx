import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client.js'
import config from '../config.js'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const ac = config.apiConfig || {}

  function saveSession(token, userData) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = useCallback(async ({ username, password }) => {
    setLoading(true)
    try {
      const endpoint = ac.loginEndpoint || '/api/auth/login'
      const { data } = await api.post(endpoint, { username, password })
      saveSession(data.token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' }
    } finally { setLoading(false) }
  }, [ac.loginEndpoint])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const endpoint = ac.registerEndpoint || '/api/auth/register'
      const { data } = await api.post(endpoint, payload)
      saveSession(data.token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Registration failed' }
    } finally { setLoading(false) }
  }, [ac.registerEndpoint])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  const getSecurityQuestion = useCallback(async (username) => {
    const endpoint = ac.securityQuestionEndpoint || '/api/auth/security-question'
    const { data } = await api.post(endpoint, { username })
    return data.question
  }, [ac.securityQuestionEndpoint])

  const recoverPassword = useCallback(async (payload) => {
    setLoading(true)
    try {
      const endpoint = ac.recoverEndpoint || '/api/auth/recover'
      await api.post(endpoint, payload)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Recovery failed' }
    } finally { setLoading(false) }
  }, [ac.recoverEndpoint])

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
