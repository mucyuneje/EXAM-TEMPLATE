import { useState, useEffect, useCallback } from 'react'
import api from '../api/client.js'

export function useEntity(apiPath, pageSize = 25) {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [submitting, setSubmit]   = useState(false)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotal]    = useState(1)
  const [total, setTotalRecords]  = useState(0)

  const fetchAll = useCallback(async (p = page) => {
    if (!apiPath) return
    setLoading(true)
    try {
      const { data } = await api.get(apiPath, {
        params: { page: p, limit: pageSize }
      })
      const items = data.data || data || []
      setRecords(items)
      setTotal(data.totalPages || data.total ? Math.ceil((data.total || items.length) / pageSize) : 1)
      setTotalRecords(data.total || data.count || items.length)
    } catch (err) {
      console.error('Fetch error:', err.message)
    } finally { setLoading(false) }
  }, [apiPath, page, pageSize])

  useEffect(() => { fetchAll() }, [fetchAll])

  function goToPage(p) {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  const create = useCallback(async (payload) => {
    setSubmit(true)
    try {
      const { data } = await api.post(apiPath, payload)
      const newRecord = data.data || data
      setRecords((prev) => [newRecord, ...prev])
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Create failed' }
    } finally { setSubmit(false) }
  }, [apiPath])

  const update = useCallback(async (id, payload) => {
    setSubmit(true)
    try {
      const { data } = await api.put(`${apiPath}/${id}`, payload)
      const updated = data.data || data
      setRecords((prev) => prev.map((r) => (r._id === id || r.id === id) ? updated : r))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Update failed' }
    } finally { setSubmit(false) }
  }, [apiPath])

  const remove = useCallback(async (id) => {
    setSubmit(true)
    try {
      await api.delete(`${apiPath}/${id}`)
      setRecords((prev) => prev.filter((r) => r._id !== id && r.id !== id))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Delete failed' }
    } finally { setSubmit(false) }
  }, [apiPath])

  return { records, loading, submitting, fetchAll, create, update, remove, page, totalPages, total, goToPage, setPage }
}
