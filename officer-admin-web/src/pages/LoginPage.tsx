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
      <div className="login-card">
        <div className="login-card__hero">
          <span className="login-card__logo">DL</span>
          <h1>Staff Portal</h1>
          <p>
            Digital Land Citizen Portal — sign in as a land officer or system administrator to
            review applications and monitor the registry.
          </p>
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email, phone, or Fayda ID</span>
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="login-card__footnote">
          Citizen accounts cannot access this portal. Use an Officer or Admin account from your
          organization.
        </p>
      </div>
    </div>
  )
}
