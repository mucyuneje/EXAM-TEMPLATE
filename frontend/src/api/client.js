import axios from 'axios'
import config from '../config.js'

const apiBase = config.apiConfig?.baseURL || config.apiBase || 'http://localhost:5000'

const api = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
api.interceptors.request.use((req) => {
  const authType = config.apiConfig?.authType || 'jwt'
  if (authType === 'jwt') {
    const token = localStorage.getItem('auth_token')
    if (token) req.headers.Authorization = `Bearer ${token}`
  } else if (authType === 'basic') {
    const token = localStorage.getItem('auth_token')
    if (token) req.headers.Authorization = `Basic ${token}`
  }
  return req
})

// Global 401 handler — kick to login (skip auth routes)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const isAuthRoute = url.includes('/auth/')
    if (err.response?.status === 401 && config.apiConfig?.authType !== 'none' && !isAuthRoute) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
