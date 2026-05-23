import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useTheme } from '../../hooks/useTheme.jsx'
import config from '../../config.js'
import Icon from '../shared/Icons.jsx'
import toast from 'react-hot-toast'

// ── Nav items shared between sidebar and topnav ──────────────
function NavItems({ mode = 'sidebar', onNavigate }) {
  return (
    <>
      {config.navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            mode === 'topnav'
              ? `topnav-link${isActive ? ' active' : ''}`
              : `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <Icon name={link.icon} size={mode === 'topnav' ? 15 : 17} />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </>
  )
}

// ── Sidebar brand block ──────────────────────────────────────
function SidebarBrand() {
  return (
    <div className="sidebar-brand">
      <div style={{
        width: 32, height: 32,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <Icon name="building" size={17} style={{ color: '#fff' }} />
      </div>
      <div className="sidebar-brand-name">{config.appName}</div>
      <div className="sidebar-brand-sub">{config.dbName}</div>
    </div>
  )
}

// ── Theme toggle button ──────────────────────────────────────
function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  return (
    <button onClick={toggleMode} className="theme-toggle-btn" title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      {mode === 'light' ? (
        <><Icon name="moon" size={16} /><span>Dark Mode</span></>
      ) : (
        <><Icon name="sun" size={16} /><span>Light Mode</span></>
      )}
    </button>
  )
}

// ── Sidebar user + logout ────────────────────────────────────
function SidebarFooter({ user, onLogout }) {
  return (
    <div className="sidebar-footer">
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div className="sidebar-username">{user?.username}</div>
          <div className="sidebar-role">Administrator</div>
        </div>
      </div>
      <ThemeToggle />
      <button
        onClick={onLogout}
        className="sidebar-link"
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
      >
        <Icon name="logout" size={17} />
        <span>Logout</span>
      </button>
    </div>
  )
}

// ── Mobile hamburger button ──────────────────────────────────
function MobileMenuBtn({ onClick }) {
  return (
    <button
      className="mobile-menu-btn"
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#fff', display: 'flex', alignItems: 'center', padding: 6,
      }}
    >
      <Icon name="menu" size={22} />
    </button>
  )
}

// ── LAYOUT: sidebar-left or sidebar-right ────────────────────
function SidebarLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className={`layout-${config.layout}`} style={{ minHeight: '100vh' }}>
      {/* Mobile overlay */}
      <div
        className={`mobile-overlay${open ? ' show' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <SidebarBrand />
        <nav className="sidebar-nav">
          <NavItems mode="sidebar" onNavigate={() => setOpen(false)} />
        </nav>
        <SidebarFooter user={user} onLogout={handleLogout} />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div
          className="mobile-menu-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            background: 'var(--sidebar-bg)',
            position: 'sticky', top: 0, zIndex: 20,
          }}
        >
          <MobileMenuBtn onClick={() => setOpen(true)} />
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{config.appName}</span>
        </div>

        <main className="main-content animate-fade">
          {children}
        </main>
      </div>
    </div>
  )
}

// ── LAYOUT: topnav ────────────────────────────────────────────
function TopnavLayout({ children }) {
  const { user, logout } = useAuth()
  const { mode, toggleMode } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="layout-topnav" style={{ minHeight: '100vh' }}>

      {/* ── Top nav bar ── */}
      <header className="topnav no-print">

        {/* Hamburger — only visible on mobile via CSS */}
        <span className="topnav-hamburger">
          <MobileMenuBtn onClick={() => setOpen(true)} />
        </span>

        <span className="topnav-brand">{config.appName}</span>

        {/* Nav links — hidden on mobile via CSS */}
        <div className="topnav-links">
          <NavItems mode="topnav" onNavigate={() => {}} />
        </div>

        <div className="topnav-end">
          <span className="topnav-hamburger">
            <button
              onClick={toggleMode}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                color: '#fff', display: 'flex', alignItems: 'center',
              }}
              title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              <Icon name={mode === 'light' ? 'moon' : 'sun'} size={16} />
            </button>
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 10px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}>
            <div className="sidebar-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="topnav-username">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              color: '#fff', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <Icon name="logout" size={15} />
            <span className="topnav-username">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Mobile sidebar — only mounted when open ── */}
      {open && (
        <>
          <div
            className="mobile-overlay show"
            onClick={() => setOpen(false)}
          />
          <aside className="sidebar open">
            <SidebarBrand />
            <nav className="sidebar-nav">
              <NavItems mode="sidebar" onNavigate={() => setOpen(false)} />
            </nav>
            <SidebarFooter user={user} onLogout={handleLogout} />
          </aside>
        </>
      )}

      {/* ── Page content ── */}
      <main className="main-content animate-fade">
        {children}
      </main>

    </div>
  )
}

// ── Global search modal ──────────────────────────────────────
function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const allLinks = config.navLinks || []

  const results = query.trim()
    ? allLinks.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase()) ||
        l.path.toLowerCase().includes(query.toLowerCase())
      )
    : allLinks

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => { setOpen(false) }, [location.pathname])

  function go(idx) {
    const link = results[idx]
    if (link) { navigate(link.path); setOpen(false) }
  }

  if (!open) return null

  return (
    <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="search-modal">
        <div className="search-input-wrap">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
              if (e.key === 'Enter') { go(activeIdx) }
            }}
          />
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
              No pages found
            </div>
          ) : results.slice(0, 8).map((link, i) => (
            <div
              key={link.path}
              className={`search-item${i === activeIdx ? ' active' : ''}`}
              onClick={() => go(i)}
              onMouseEnter={() => setActive(i)}
            >
              <Icon name={link.icon} size={16} />
              <div>
                <div style={{ fontWeight: 600 }}>{link.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{link.path}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="search-hint">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}

// ── Main export — picks layout from config ───────────────────
export default function Layout({ children }) {
  const layout = config.layout || 'sidebar-left'
  if (layout === 'topnav') return <TopnavLayout><GlobalSearch />{children}</TopnavLayout>
  return <SidebarLayout><GlobalSearch />{children}</SidebarLayout>
}