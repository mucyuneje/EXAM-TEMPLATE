import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
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

// ── Main export — picks layout from config ───────────────────
export default function Layout({ children }) {
  const layout = config.layout || 'sidebar-left'
  if (layout === 'topnav') return <TopnavLayout>{children}</TopnavLayout>
  return <SidebarLayout>{children}</SidebarLayout>
}