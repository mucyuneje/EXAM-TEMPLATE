import { useState, useEffect, memo } from 'react'
import { useEntity } from '../../hooks/useEntity.js'
import api from '../../api/client.js'
import Icon from './Icons.jsx'
import toast from 'react-hot-toast'

// ── Resolve nested value e.g. 'itemId.name' ───────────────────
function resolve(obj, path) {
  if (!obj || !path) return ''
  return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : ''), obj)
}

// ── Format cell value by type ─────────────────────────────────
function formatCell(value, format) {
  if (value === null || value === undefined || value === '') return '—'
  if (format === 'date') {
    const d = new Date(value)
    return isNaN(d) ? value : d.toLocaleDateString('en-GB')
  }
  if (format === 'number') {
    return Number(value).toLocaleString()
  }
  return String(value)
}

// ── Spinner ───────────────────────────────────────────────────
function Spin({ dark }) {
  return <div className={dark ? 'spinner spinner-dark' : 'spinner'} />
}

// ── Modal wrapper ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ── Single form field (memoized) ─────────────────────────────
const FormField = memo(function FormField({ field, value, onChange, selectOptions }) {
  const { name, key, type, required, placeholder, options, labelKey, calc } = field

  // Auto-generated fields (backend handles) — hide from form
  if (type === 'auto') { return null }

  // For readonly: show calculated value
  if (type === 'readonly') {
    return (
      <div className="form-group">
        <label className="form-label">{name}</label>
        <input
          className="form-input readonly"
          type="text"
          readOnly
          value={value !== '' && value !== undefined ? Number(value).toLocaleString() : ''}
          placeholder="Auto-calculated"
        />
      </div>
    )
  }

  if (type === 'select-static') {
    return (
      <div className="form-group">
        <label className="form-label">{name}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
        <select className="form-select" value={value || ''} onChange={(e) => onChange(e.target.value)} required={required}>
          <option value="">Select {name}</option>
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'select-api') {
    const opts = selectOptions[key] || []
    return (
      <div className="form-group">
        <label className="form-label">{name}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
        <select className="form-select" value={value || ''} onChange={(e) => onChange(e.target.value)} required={required}>
          <option value="">Select {name}</option>
          {opts.map((opt) => (
            <option key={opt._id || opt.id} value={opt._id || opt.id}>
              {field.optionLabel ? field.optionLabel(opt) : (opt[labelKey] || opt.name || opt._id)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="form-group">
        <label className="form-label">{name}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
        <textarea
          className="form-textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      </div>
    )
  }

  const inputType = type === 'number' ? 'number'
    : type === 'date'  ? 'date'
    : type === 'month' ? 'month'
    : type === 'email' ? 'email'
    : type === 'tel'   ? 'tel'
    : 'text'

  return (
    <div className="form-group">
      <label className="form-label">{name}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      <input
        className="form-input"
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        required={required}
        step={type === 'number' ? 'any' : undefined}
      />
    </div>
  )
})

// ════════════════════════════════════════════════════════════
// MAIN ENTITY PAGE
// ════════════════════════════════════════════════════════════
export default function EntityPage({ pageConfig }) {
  const { label, apiPath, fields = [], tableColumns = [], ops = [] } = pageConfig

  const { records, loading, submitting, create, update, remove, page, totalPages, total, goToPage } = useEntity(apiPath)

  // Modal state
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)

  // Form state
  const [form, setForm] = useState({})
  const [initialValues, setInitialValues] = useState({})

  // Options fetched for select-api fields (source URL → data)
  const [selectOptions, setSelectOptions] = useState({})
  const apiFields = fields.filter((f) => f.type === 'select-api' && f.source)
  useEffect(() => {
    apiFields.forEach((f) => {
      const cachedKey = `_selopt_${f.source}`
      const cached = window[cachedKey]
      if (cached && Date.now() - cached.ts < 30000) {
        setSelectOptions((prev) => ({ ...prev, [f.key]: cached.data }))
        return
      }
      api.get(f.source).then(({ data }) => {
        const items = data.data || data || []
        window[cachedKey] = { data: items, ts: Date.now() }
        setSelectOptions((prev) => ({ ...prev, [f.key]: items }))
      }).catch(() => {})
    })
  }, [apiPath])

  // Auto-fill: when user changes a watched field, auto-fill target from selected option
  function applyAutoFill(key, currentForm) {
    const autoField = fields.find(f => f.autoFill && f.autoFill.watch === key)
    if (!autoField) return currentForm
    const { watch, from } = autoField.autoFill
    const watchedValue = currentForm[watch]
    if (!watchedValue || watchedValue === initialValues[watch]) return currentForm
    const opts = selectOptions[watch] || []
    const selected = opts.find(o => (o._id || o.id) === watchedValue)
    if (selected) {
      const val = resolve(selected, from)
      if (val !== undefined && val !== null) {
        return { ...currentForm, [autoField.key]: val }
      }
    }
    return currentForm
  }

  // Auto-calculate readonly fields whenever form changes
  function recalc(currentForm) {
    const updated = { ...currentForm }
    fields.forEach((f) => {
      if (f.type === 'readonly' && typeof f.calc === 'function') {
        updated[f.key] = f.calc(updated)
      }
    })
    return updated
  }

  function openCreate() {
    const defaults = {}
    fields.forEach((f) => { defaults[f.key] = '' })
    setForm(recalc(defaults))
    setInitialValues({})
    setEditing(null)
    setModal('create')
  }

  function openEdit(record) {
    const vals = {}
    fields.forEach((f) => {
      // For select-api fields, the stored value might be a populated object
      const raw = record[f.key]
      if (f.type === 'select-api' && raw && typeof raw === 'object') {
        vals[f.key] = raw._id || raw.id || ''
      } else {
        // Format date fields back to YYYY-MM-DD for input
        if ((f.type === 'date' || f.type === 'month') && raw) {
          vals[f.key] = new Date(raw).toISOString().split('T')[0].slice(0, f.type === 'month' ? 7 : 10)
        } else {
          vals[f.key] = raw ?? ''
        }
      }
    })
    setForm(recalc(vals))
    setInitialValues({ ...vals })
    setEditing(record)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
    setForm({})
  }

  function handleFieldChange(key, value) {
    setForm((prev) => {
      const afterRecalc = recalc({ ...prev, [key]: value })
      return applyAutoFill(key, afterRecalc)
    })
  }

  // Validate required fields
  function validate() {
    for (const f of fields) {
      if (f.required && f.type !== 'readonly') {
        const val = form[f.key]
        if (val === '' || val === null || val === undefined) {
          return `${f.name} is required`
        }
      }
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }

    // Build payload — exclude readonly and auto fields (server-side generated)
    const payload = {}
    fields.forEach((f) => {
      if (f.type !== 'readonly' && f.type !== 'auto') payload[f.key] = form[f.key]
    })

    let res
    if (modal === 'edit') {
      res = await update(editing._id || editing.id, payload)
    } else {
      res = await create(payload)
    }

    if (res.ok) {
      toast.success(modal === 'edit' ? `${label} updated` : `${label} added`)
      closeModal()
    } else {
      toast.error(res.message || 'Something went wrong')
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return
    const res = await remove(record._id || record.id)
    if (res.ok) {
      toast.success(`${label} deleted`)
    } else {
      toast.error(res.message || 'Delete failed')
    }
  }

  const canEdit   = ops.includes('update')
  const canDelete = ops.includes('delete')
  const showActions = canEdit || canDelete

  // ── Client-side filter + sort state ──────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Filtered + sorted records
  const displayed = (() => {
    let data = [...records]

    // Filter
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      const searchable = tableColumns.map((c) => c.key)
      data = data.filter((r) =>
        searchable.some((k) => {
          const v = resolve(r, k)
          return String(v ?? '').toLowerCase().includes(q)
        })
      )
    }

    // Sort
    if (sortKey) {
      data.sort((a, b) => {
        const aVal = resolve(a, sortKey)
        const bVal = resolve(b, sortKey)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        return sortDir === 'asc'
          ? String(aVal ?? '').localeCompare(String(bVal ?? ''))
          : String(bVal ?? '').localeCompare(String(aVal ?? ''))
      })
    }

    return data
  })()

  // CSV export
  function exportCSV() {
    const headers = tableColumns.map(c => c.label).join(',')
    const rows = displayed.map(r =>
      tableColumns.map(c => {
        const val = resolve(r, c.key)
        return `"${String(val ?? '').replace(/"/g, '""')}"`
      }).join(',')
    )
    const blob = new Blob([`${headers}\n${rows.join('\n')}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${label}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade">
      {/* Breadcrumbs */}
      <div className="breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <Icon name="chevron-right" size={12} />
        <span>{label}</span>
      </div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{label}</h1>
          <p className="page-sub">{total || records.length} record{(total || records.length) !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {records.length > 0 && (
            <button className="btn btn-secondary" onClick={exportCSV} title="Export CSV">
              <Icon name="download" size={15} />
              Export
            </button>
          )}
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={15} />
            Add {label}
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0' }}>
            <Spin dark /> <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="empty">
            <Icon name="clipboard" size={40} />
            <p>No {label} records yet</p>
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              <Icon name="plus" size={15} /> Add first {label}
            </button>
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="filter-bar">
              <div className="search-wrapper">
                <Icon name="search" size={14} className="search-icon" />
                <input
                  className="form-input"
                  type="text"
                  placeholder={`Search ${label}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery && (
                <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>
                  Clear
                </button>
              )}
              <span className="filter-count">
                {displayed.length} of {records.length}
              </span>
            </div>

            <div className="table-wrap" style={{ borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        {col.label}
                        {sortKey === col.key && (
                          <span style={{ marginLeft: 4, fontSize: 11 }}>
                            {sortDir === 'asc' ? ' ▲' : ' ▼'}
                          </span>
                        )}
                      </th>
                    ))}
                    {showActions && <th style={{ width: 100 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + (showActions ? 2 : 1)} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        No {label} match your search
                      </td>
                    </tr>
                  ) : displayed.map((rec, idx) => (
                    <tr key={rec._id || rec.id || idx}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                      {tableColumns.map((col) => (
                        <td key={col.key}>
                          {formatCell(resolve(rec, col.key), col.format)}
                        </td>
                      ))}
                      {showActions && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {canEdit && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openEdit(rec)}
                                title="Edit"
                                style={{ color: 'var(--primary)' }}
                              >
                                <Icon name="edit" size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleDelete(rec)}
                                title="Delete"
                                style={{ color: '#ef4444' }}
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="pagination-info">
              Page {page} of {totalPages} ({total} records)
            </div>
            <div className="pagination-btns">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal
          title={modal === 'edit' ? `Edit ${label}` : `Add ${label}`}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: fields.length > 4 ? 'repeat(2, 1fr)' : '1fr',
              gap: '14px 20px',
              marginBottom: 20,
            }}>
              {fields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={form[field.key]}
                  onChange={(val) => handleFieldChange(field.key, val)}
                  selectOptions={selectOptions}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
              >
                {submitting ? <Spin /> : (modal === 'edit' ? 'Update' : 'Save')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
