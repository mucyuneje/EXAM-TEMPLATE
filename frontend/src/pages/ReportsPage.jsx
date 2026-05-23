import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import config from '../config.js'
import api from '../api/client.js'
import Icon from '../components/shared/Icons.jsx'
import toast from 'react-hot-toast'

// ── Resolve nested value ──────────────────────────────────────
function resolve(obj, path) {
  if (!obj || !path) return ''
  return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : ''), obj)
}

function formatVal(val) {
  if (val === null || val === undefined || val === '') return '—'
  if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val))) {
    return new Date(val).toLocaleDateString('en-GB')
  }
  if (typeof val === 'number') return val.toLocaleString()
  return String(val)
}

// ── Filter input for a single report ─────────────────────────
function FilterInput({ filterCfg, value, onChange, options }) {
  if (!filterCfg) return null

  if (filterCfg.type === 'date') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label className="form-label">{filterCfg.label}</label>
        <input
          className="form-input"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 180 }}
        />
      </div>
    )
  }

  if (filterCfg.type === 'month') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label className="form-label">{filterCfg.label}</label>
        <input
          className="form-input"
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 180 }}
        />
      </div>
    )
  }

  if (filterCfg.type === 'select-api') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label className="form-label">{filterCfg.label}</label>
        <select
          className="form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 220 }}
        >
          <option value="">All</option>
          {(options || []).map((opt) => (
            <option key={opt._id || opt.id} value={opt._id || opt.id}>
              {opt[filterCfg.labelKey] || opt.name || opt._id}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return null
}

// ════════════════════════════════════════════════════════════
// REPORTS PAGE
// ════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const { user } = useAuth()
  const reports = config.reports || []

  const [activeKey, setActiveKey]     = useState(reports[0]?.key || '')
  const [filterValue, setFilterValue] = useState('')
  const [filterOptions, setFilterOptions] = useState([])
  const [results, setResults]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [generated, setGenerated]     = useState(false)

  const [filterValues, setFilterValues] = useState({})
  const [sortKey, setSortKey]         = useState('')
  const [sortDir, setSortDir]         = useState('asc')

  const activeReport = reports.find((r) => r.key === activeKey)

  // When switching tabs, reset state and load select options if needed
  useEffect(() => {
    setResults([])
    setGenerated(false)
    setFilterValue('')
    setFilterValues({})
    setSortKey('')
    setSortDir('asc')

    const f = activeReport?.filter
    if (f?.type === 'date' || f?.type === 'month') {
      setFilterValue(new Date().toISOString().split('T')[0].slice(0, f.type === 'month' ? 7 : 10))
    }
    if (f?.type === 'select-api' && f.source) {
      api.get(f.source)
        .then(({ data }) => setFilterOptions(data.data || data || []))
        .catch(() => setFilterOptions([]))
    } else {
      setFilterOptions([])
    }

  }, [activeKey])

  async function handleGenerate() {
    if (!activeReport) return
    setLoading(true)
    try {
      const params = {}
      if (activeReport.filter && filterValue) {
        params[activeReport.filter.param] = filterValue
      }
      const { data } = await api.get(activeReport.apiPath, { params })
      setResults(data.data || data || [])
      setGenerated(true)
    } catch (err) {
      toast.error('Failed to generate report: ' + (err.response?.data?.message || err.message))
    } finally { setLoading(false) }
  }

  function handlePrint() {
    window.print()
  }

  // ── Client-side filtering & sorting ──────────────────────────
  const processedResults = useMemo(() => {
    let data = [...results]
    const filters = activeReport?.filters || []

    filters.forEach((f) => {
      const val = (filterValues[f.key] || '').trim()
      if (!val) return
      data = data.filter((row) => {
        const cellVal = resolve(row, f.key)
        return String(cellVal).toLowerCase().includes(val.toLowerCase())
      })
    })

    if (sortKey && data.length > 0) {
      data.sort((a, b) => {
        const aVal = resolve(a, sortKey)
        const bVal = resolve(b, sortKey)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      })
    }

    return data
  }, [results, filterValues, sortKey, sortDir])

  // Compute total from filtered results
  const totalKeys = ['amount', 'amountPaid', 'totalPrice', 'totalSpent', 'grossSalary']
  const total = processedResults.reduce((sum, row) => {
    for (const k of totalKeys) {
      if (row[k] !== undefined) return sum + Number(row[k])
    }
    return sum
  }, 0)

  // Get all result keys for table rendering if no columns defined
  const columns = activeReport?.columns || []

  // Map result rows to array of values in column order
  // We use Object.values(row) filtered to match column count
  // OR if the result has known keys, we pick them in column order
  function getRowCells(row) {
    // Get all non-object, non-id values from the row
    const cells = []
    const entries = Object.entries(row).filter(([k]) => !['_id', '__v', 'id', 'createdAt', 'updatedAt'].includes(k))
    for (const [, v] of entries) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
        // Flatten one level: show first string/number value of the object
        const sub = Object.values(v).find((x) => typeof x === 'string' || typeof x === 'number')
        cells.push(sub ?? '')
      } else {
        cells.push(v)
      }
    }
    return cells.slice(0, columns.length || 6)
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Generate and print system reports</p>
        </div>
      </div>

      {/* Report tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }} className="no-print">
        {reports.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveKey(r.key)}
            className={activeKey === r.key ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            <Icon name="chart" size={15} />
            {r.label}
          </button>
        ))}
      </div>

      {/* Filter + generate */}
      {activeReport && (
        <div className="card card-body no-print" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {activeReport.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
            <FilterInput
              filterCfg={activeReport.filter}
              value={filterValue}
              onChange={setFilterValue}
              options={filterOptions}
            />

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ alignSelf: 'flex-end' }}
            >
              {loading
                ? <><div className="spinner" /> Generating...</>
                : <><Icon name="chart" size={15} /> Generate</>
              }
            </button>

            {generated && processedResults.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={handlePrint}
                style={{ alignSelf: 'flex-end' }}
              >
                <Icon name="print" size={15} /> Print
              </button>
            )}
          </div>
        </div>
      )}

      {/* Report output */}
      {generated && (
        <div className="card" style={{ padding: '24px 28px' }}>

          {/* Print header */}
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{config.appName}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{config.appSubtitle}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{activeReport?.label}</p>
                {filterValue && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {activeReport?.filter?.label}: {filterValue}
                  </p>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Generated: {new Date().toLocaleString()}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  By: <strong>{user?.username}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Bill receiver section */}
          {activeReport?.isBill && processedResults[0] && (
            <div style={{
              background: 'var(--primary-muted)',
              border: '1px solid var(--primary-light)',
              borderRadius: 10, padding: '14px 16px',
              marginBottom: 20,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8,
            }}>
              {Object.entries(processedResults[0])
                .filter(([k]) => !['_id', '__v', 'id', 'createdAt', 'updatedAt'].includes(k))
                .map(([k, v]) => (
                  <div key={k} style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {k.replace(/([A-Z])/g, ' $1')}:{' '}
                    </span>
                    <strong>{v || '—'}</strong>
                  </div>
                ))}
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Received by: </span>
                <strong>{user?.username}</strong>
              </div>
            </div>
          )}

          {/* Filter toolbar */}
          {generated && (activeReport?.filters || []).length > 0 && (
            <div className="no-print" style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              marginBottom: 16, padding: 12, borderRadius: 8,
              background: 'var(--primary-muted)', border: '1px solid var(--primary-light)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', alignSelf: 'center' }}>
                <Icon name="filter" size={14} /> Filter:
              </span>
              {(activeReport?.filters || []).map((f) => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      className="form-select"
                      value={filterValues[f.key] || ''}
                      onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: 140, fontSize: 12, padding: '4px 8px' }}
                    >
                      <option value="">All</option>
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'date' ? (
                    <input
                      className="form-input"
                      type="date"
                      value={filterValues[f.key] || ''}
                      onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: 140, fontSize: 12, padding: '4px 8px' }}
                    />
                  ) : (
                    <input
                      className="form-input"
                      type="text"
                      placeholder={`Filter ${f.label}...`}
                      value={filterValues[f.key] || ''}
                      onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: 130, fontSize: 12, padding: '4px 8px' }}
                    />
                  )}
                </div>
              ))}
              <button
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-end', fontSize: 12, padding: '4px 12px' }}
                onClick={() => setFilterValues({})}
              >
                Clear
              </button>
              <span style={{ alignSelf: 'flex-end', fontSize: 11, color: 'var(--text-muted)' }}>
                Showing {processedResults.length} of {results.length} entries
              </span>
            </div>
          )}

          {/* Results table */}
          {processedResults.length === 0 ? (
            <div className="empty">
              <Icon name="alert" size={36} />
              <p>No records found for the selected filter</p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      {columns.map((col) => {
                        const resultKeys = processedResults.length > 0
                          ? Object.keys(processedResults[0]).filter((k) => !['_id', '__v', 'id', 'createdAt', 'updatedAt'].includes(k))
                          : []
                        const colKey = resultKeys[columns.indexOf(col)] || col
                        return (
                          <th
                            key={col}
                            onClick={() => {
                              if (sortKey === colKey) {
                                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                              } else {
                                setSortKey(colKey)
                                setSortDir('asc')
                              }
                            }}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                          >
                            {col}
                            {sortKey === colKey && (
                              <span style={{ marginLeft: 4, fontSize: 11 }}>
                                {sortDir === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {processedResults.map((row, i) => {
                      const cells = getRowCells(row)
                      return (
                        <tr key={i}>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                          {cells.map((val, j) => (
                            <td key={j}>{formatVal(val)}</td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                  {activeReport?.showTotal && total > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'right', fontWeight: 700 }}>
                          TOTAL
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-text)' }}>
                          {total.toLocaleString()} {config.currency}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Bill signature section */}
              {activeReport?.isBill && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 40, marginTop: 40, paddingTop: 24,
                  borderTop: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 40 }}>
                      Received by (Client)
                    </p>
                    <div style={{ borderBottom: '1px solid var(--text-primary)', width: 160 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Signature & Date</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Issued by
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-text)', marginBottom: 32 }}>
                      {user?.username}
                    </p>
                    <div style={{ borderBottom: '1px solid var(--text-primary)', width: 160 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Signature & Date</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
