import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import config from '../../config.js'
import Icon from '../shared/Icons.jsx'
import toast from 'react-hot-toast'

// ── Shared wrapper ───────────────────────────────────────────
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <Icon name="shield" size={22} />
        </div>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}

// ── Reusable field wrapper ───────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

// ── Password strength checker ────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const levels = ['', 'weak', 'fair', 'good', 'strong']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong!']

  if (!password) return null
  return (
    <div>
      <div className="pw-bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`pw-bar${i <= score ? ` ${levels[score]}` : ''}`} />
        ))}
      </div>
      <div className="pw-hint">
        {score < 4 && (
          <span>
            Needs:{' '}
            {!checks[0] && '8+ chars '}{!checks[1] && 'uppercase '}{!checks[2] && 'number '}{!checks[3] && 'symbol'}
          </span>
        )}
        {score === 4 && <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Strong password</span>}
      </div>
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────
function Spin() {
  return <div className="spinner" />
}

// ════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════
export function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      toast.error('Please fill all fields')
      return
    }
    const res = await login(form)
    if (res.ok) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <AuthShell
      title={`Sign in to ${config.appName}`}
      subtitle="Enter your credentials to continue"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Username">
          <input
            className="form-input"
            type="text"
            placeholder="Your username"
            value={form.username}
            onChange={set('username')}
            autoFocus
            autoComplete="username"
          />
        </Field>

        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              style={{ paddingRight: 40 }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              }}
            >
              <Icon name={showPw ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
        </Field>

        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <Link to="/recover" className="auth-link" style={{ fontSize: 12 }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '11px 0', fontSize: 14 }}>
          {loading ? <Spin /> : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </form>
    </AuthShell>
  )
}

// ════════════════════════════════════════════════════════════
// REGISTER PAGE
// ════════════════════════════════════════════════════════════
export function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: config.securityQuestions?.[0] || '',
    securityAnswer: '',
  })

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  function validate() {
    if (!form.username.trim()) return 'Username is required'
    if (form.username.trim().length < 3) return 'Username must be at least 3 characters'
    if (!form.password) return 'Password is required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(form.password)) return 'Password needs an uppercase letter'
    if (!/[0-9]/.test(form.password)) return 'Password needs a number'
    if (!/[^A-Za-z0-9]/.test(form.password)) return 'Password needs a special character (!@#...)'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    if (!form.securityAnswer.trim()) return 'Security answer is required'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }

    const res = await register({
      username: form.username.trim(),
      password: form.password,
      securityQuestion: form.securityQuestion,
      securityAnswer: form.securityAnswer.trim(),
    })
    if (res.ok) {
      toast.success('Account created!')
      navigate('/dashboard')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle={`Register to access ${config.appName}`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Username">
          <input
            className="form-input"
            type="text"
            placeholder="Choose a username (min 3 chars)"
            value={form.username}
            onChange={set('username')}
            autoFocus
          />
        </Field>

        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase, number, symbol"
              value={form.password}
              onChange={set('password')}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              }}
            >
              <Icon name={showPw ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </Field>

        <Field label="Confirm Password">
          <input
            className="form-input"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
          />
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <span className="form-error">Passwords do not match</span>
          )}
        </Field>

        {/* Divider */}
        <div>
          <hr className="divider" style={{ margin: '6px 0 10px' }} />
          <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Password Recovery Setup
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Security Question">
              <select
                className="form-select"
                value={form.securityQuestion}
                onChange={set('securityQuestion')}
              >
                {(config.securityQuestions || []).map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>

            <Field label="Your Answer">
              <input
                className="form-input"
                type="text"
                placeholder="Answer (case-insensitive)"
                value={form.securityAnswer}
                onChange={set('securityAnswer')}
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ justifyContent: 'center', padding: '11px 0', fontSize: 14, marginTop: 4 }}
        >
          {loading ? <Spin /> : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}

// ════════════════════════════════════════════════════════════
// RECOVER PASSWORD PAGE
// ════════════════════════════════════════════════════════════
export function RecoverPage() {
  const { getSecurityQuestion, recoverPassword, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState('')
  const [form, setForm] = useState({
    username: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
  })

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function handleStep1(e) {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('Enter your username'); return }
    try {
      const q = await getSecurityQuestion(form.username.trim())
      setQuestion(q)
      setStep(2)
    } catch {
      toast.error('Username not found')
    }
  }

  async function handleStep2(e) {
    e.preventDefault()
    if (!form.securityAnswer.trim()) { toast.error('Enter your security answer'); return }
    if (!form.newPassword)           { toast.error('Enter new password'); return }
    if (form.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return }

    const res = await recoverPassword({
      username: form.username.trim(),
      securityAnswer: form.securityAnswer.trim(),
      newPassword: form.newPassword,
    })
    if (res.ok) {
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <AuthShell
      title="Recover Password"
      subtitle="Reset your password using your security question"
    >
      {step === 1 ? (
        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Username">
            <input
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={set('username')}
              autoFocus
            />
          </Field>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '11px 0' }}>
            {loading ? <Spin /> : 'Continue →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13 }}>
            <Link to="/login" className="auth-link">← Back to login</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Question box */}
          <div style={{
            background: 'var(--primary-muted)',
            border: '1px solid var(--primary-light)',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-text)', marginBottom: 4 }}>
              Security Question
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{question}</p>
          </div>

          <Field label="Your Answer">
            <input
              className="form-input"
              type="text"
              placeholder="Your answer"
              value={form.securityAnswer}
              onChange={set('securityAnswer')}
              autoFocus
            />
          </Field>

          <Field label="New Password">
            <input
              className="form-input"
              type="password"
              placeholder="Min 8 chars, uppercase, number, symbol"
              value={form.newPassword}
              onChange={set('newPassword')}
            />
            <PasswordStrength password={form.newPassword} />
          </Field>

          <Field label="Confirm New Password">
            <input
              className="form-input"
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
          </Field>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '11px 0' }}>
            {loading ? <Spin /> : 'Reset Password'}
          </button>

          <button type="button" onClick={() => setStep(1)} className="btn btn-ghost" style={{ justifyContent: 'center' }}>
            ← Try different username
          </button>
        </form>
      )}
    </AuthShell>
  )
}
