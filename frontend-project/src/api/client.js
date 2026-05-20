import axios from 'axios'
import config from '../config.js'

const api = axios.create({
  baseURL: config.apiBase || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((req) => {
  const token = localStorage.getItem('auth_token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

// Global 401 handler — kick to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
