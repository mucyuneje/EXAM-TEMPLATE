import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth.jsx'
import config from './config.js'

import { LoginPage, RegisterPage, RecoverPage } from './components/auth/AuthPages.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import Layout from './components/layout/Layout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import EntityPage from './components/shared/EntityPage.jsx'

// ── Map a nav path to a page config key ──────────────────────
// e.g. '/rooms' → 'rooms'
function getPageConfig(path) {
  const slug = path.replace(/^\//, '')           // remove leading slash
  return config.pages?.[slug] || null
}

// ── Wrap any page in Layout + ProtectedRoute ──────────────────
function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 13.5,
              borderRadius: 10,
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recover"  element={<RecoverPage />} />

          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={
            <Protected><DashboardPage /></Protected>
          } />

          {/* ── Reports ── */}
          <Route path="/reports" element={
            <Protected><ReportsPage /></Protected>
          } />

          {/* ── Dynamic entity pages — built from config.navLinks ── */}
          {(config.navLinks || [])
            .filter((link) => link.path !== '/dashboard' && link.path !== '/reports')
            .map((link) => {
              const pageConfig = getPageConfig(link.path)
              return (
                <Route
                  key={link.path}
                  path={link.path}
                  element={
                    <Protected>
                      {pageConfig ? (
                        <EntityPage pageConfig={pageConfig} />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: 15 }}>
                            Page <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{link.path}</code> is not configured in <code>config.pages</code>
                          </p>
                        </div>
                      )}
                    </Protected>
                  }
                />
              )
            })}

          {/* ── Catch all ── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}
