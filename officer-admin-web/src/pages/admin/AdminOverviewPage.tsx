import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, type DashboardStatsResponse } from '../../api/client'
import { EmptyState, Panel, StatCard } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminOverviewPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)
  const [paymentStats, setPaymentStats] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    try {
      const [dash, payments] = await Promise.all([
        apiFetch<DashboardStatsResponse>('/admin/stats', token),
        apiFetch<Record<string, number>>('/admin/payments/stats', token),
      ])
      setStats(dash)
      setPaymentStats(payments)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PortalLayout
      title="System Intelligence"
      subtitle="Comprehensive overview of land portal operations and user engagement."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="hero-card">
          <div className="hero-card__content">
            <h2>Welcome back, {user?.fullName || 'Administrator'}</h2>
            <p>The system is performing within optimal parameters. You have {stats?.stats.totalRequests ?? 0} active service requests to oversee today.</p>
            <div className="hero-card__actions">
                <Link to="/admin/requests" className="btn btn--primary">Process Requests</Link>
                <Link to="/admin/reports" className="btn btn--outline" style={{background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)'}}>Generate Audit</Link>
            </div>
          </div>
          <div className="hero-card__stats">
              <div className="hero-mini-stat">
                  <span>Uptime</span>
                  <strong>99.9%</strong>
              </div>
              <div className="hero-mini-stat">
                  <span>Active Sessions</span>
                  <strong>24</strong>
              </div>
          </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Platform Citizens" value={stats?.stats.totalUsers ?? 0} />
        <StatCard label="Secured Plots" value={stats?.stats.totalLands ?? 0} tone="success" />
        <StatCard label="Open Procedures" value={stats?.stats.totalRequests ?? 0} tone="info" />
        <StatCard
          label="Total Revenue"
          value={(paymentStats?.totalAmount ?? 0).toLocaleString() + ' ETB'}
          tone="warning"
        />
      </div>

      <div className="grid-2">
        <Panel title="Command Modules" subtitle="Quick access to administrative functions">
          <div className="quick-links">
            <Link to="/admin/requests" className="quick-link">
              <strong>Procedural Triage</strong>
              <span>Validate and route service submissions</span>
            </Link>
            <Link to="/admin/users" className="quick-link">
              <strong>Personnel Directory</strong>
              <span>Manage roles and access protocols</span>
            </Link>
            <Link to="/admin/marketplace" className="quick-link">
              <strong>Marketplace Oversight</strong>
              <span>Monitor public listings and compliance</span>
            </Link>
            <Link to="/admin/payments" className="quick-link">
                <strong>Financial Ledger</strong>
                <span>Audit transactional volume and revenue</span>
            </Link>
          </div>
        </Panel>

        <Panel title="Operational Pulse" subtitle="Live stream of platform events">
          {!stats?.recentActivities?.length ? (
            <EmptyState title="Quiet Pulse" message="No recent activity recorded in the last hour." />
          ) : (
            <ul className="pulse-list">
              {stats.recentActivities.map((a) => (
                <li key={a.id} className="pulse-item">
                  <div className="pulse-item__point"></div>
                  <div className="pulse-item__content">
                    <strong>{a.description}</strong>
                    <div className="pulse-item__meta">
                        <span>{a.type}</span>
                        <small>·</small>
                        <time>{new Date(a.timestamp).toLocaleTimeString()}</time>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PortalLayout>
  )
}
