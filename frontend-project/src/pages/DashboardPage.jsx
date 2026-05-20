import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import config from '../config.js'
import api from '../api/client.js'
import Icon from '../components/shared/Icons.jsx'

function StatCard({ stat }) {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(stat.apiPath)
      .then(({ data }) => setValue(data.value ?? data.count ?? data ?? '—'))
      .catch(() => setValue('—'))
      .finally(() => setLoading(false))
  }, [stat.apiPath])

  const colorMap = {
    primary: { bg: 'var(--primary-light)', color: 'var(--primary-text)' },
    green:   { bg: '#dcfce7', color: '#166534' },
    orange:  { bg: '#ffedd5', color: '#9a3412' },
    purple:  { bg: '#ede9fe', color: '#5b21b6' },
    red:     { bg: '#fee2e2', color: '#991b1b' },
    teal:    { bg: '#ccfbf1', color: '#115e59' },
  }
  const c = colorMap[stat.color] || colorMap.primary

  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
        <Icon name={stat.icon} size={18} />
      </div>
      <div className="stat-value">
        {loading ? (
          <div style={{ width: 60, height: 28, background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
        ) : value}
      </div>
      <div className="stat-label">{stat.label}</div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()

  const today = new Date().toLocaleDateString(config.locale || 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="animate-fade">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {greeting()},{' '}
          <span style={{ color: 'var(--primary)' }}>{user?.username}</span> 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {today} &nbsp;·&nbsp; {config.appSubtitle}
        </p>
      </div>

      {/* Stats */}
      {config.stats && config.stats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}>
          {config.stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="card card-body">
        <h2 className="card-title">Quick Access</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {config.navLinks
            .filter((l) => l.path !== '/dashboard')
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.background = 'var(--primary-muted)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg-card)'
                  }}
                >
                  <div style={{
                    width: 32, height: 32,
                    background: 'var(--primary-light)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-text)', flexShrink: 0,
                  }}>
                    <Icon name={link.icon} size={16} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* System info */}
      <div style={{ marginTop: 20 }}>
        <div className="card card-body" style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 32px' }}>
            {[
              ['System', config.appName],
              ['Database', config.dbName],
              ['User', user?.username],
              ['Role', 'Administrator'],
              ['Date', new Date().toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                <span style={{ fontWeight: 600, color: 'var(--primary-text)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
