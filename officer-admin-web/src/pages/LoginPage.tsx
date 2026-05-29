import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { token, user, login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'officer') return <Navigate to="/officer" replace />
    return <Navigate to="/login" replace state={{ denied: true }} />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(identifier, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="ambient-light ambient-light--1"></div>
      <div className="ambient-light ambient-light--2"></div>
      
      <div className="login-card animate-fade">
        <div className="login-card__hero">
          <span className="login-card__logo">DL</span>
          <h1>FEDERAL COMMAND</h1>
          <p>
            Secure access for Federal Land Officers and System Administrators. Authenticate to manage the national land registry.
          </p>
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Authentication Identifier</span>
            <input
              type="text"
              placeholder="Email or Fayda ID"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Secure Password</span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn--primary" style={{width: '100%', padding: '1.2rem'}} disabled={loading}>
            {loading ? 'ESTABLISHING SECURE CONNECTION...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>
        <p className="login-card__footnote">
          Restricted access. Unauthorized attempts are logged.
        </p>
      </div>
    </div>
  )
}
