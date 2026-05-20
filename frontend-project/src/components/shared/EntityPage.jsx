import { useState, useEffect } from 'react'
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

// ── Single form field ─────────────────────────────────────────
function FormField({ field, value, onChange, selectOptions }) {
  const { name, key, type, required, placeholder, options, labelKey, calc } = field

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
              {opt[labelKey] || opt.name || opt._id}
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
}

// ════════════════════════════════════════════════════════════
// MAIN ENTITY PAGE
// ════════════════════════════════════════════════════════════
export default function EntityPage({ pageConfig }) {
  const { label, apiPath, fields = [], tableColumns = [], ops = [] } = pageConfig

  const { records, loading, submitting, create, update, remove } = useEntity(apiPath)

  // Modal state
  const [modal, setModal] = useState(null)   // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null)

  // Form state
  const [form, setForm] = useState({})

  // Options fetched for select-api fields
  const [selectOptions, setSelectOptions] = useState({})

  // Fetch options for all select-api fields on mount
  useEffect(() => {
    const apiFields = fields.filter((f) => f.type === 'select-api' && f.source)
    apiFields.forEach(async (f) => {
      try {
        const { data } = await api.get(f.source)
        setSelectOptions((prev) => ({ ...prev, [f.key]: data.data || data || [] }))
      } catch (e) {
        console.warn('Failed to load options for', f.key, e.message)
      }
    })
  }, [apiPath])

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
    setEditing(record)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
    setForm({})
  }

  function handleFieldChange(key, value) {
    setForm((prev) => recalc({ ...prev, [key]: value }))
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

    // Build payload — exclude readonly fields (they're computed server-side or not needed)
    const payload = {}
    fields.forEach((f) => {
      if (f.type !== 'readonly') payload[f.key] = form[f.key]
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

  return (
    <div className="animate-fade">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{label}</h1>
          <p className="page-sub">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={15} />
          Add {label}
        </button>
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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  {tableColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {showActions && <th style={{ width: 100 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
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
