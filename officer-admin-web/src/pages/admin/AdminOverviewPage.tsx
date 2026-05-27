import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, type DashboardStatsResponse } from '../../api/client'
import { Panel, StatCard } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminOverviewPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)
  const [userStats, setUserStats] = useState<Record<string, number> | null>(null)
  const [paymentStats, setPaymentStats] = useState<Record<string, number> | null>(null)
  const [marketStats, setMarketStats] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    try {
      const [dash, users, payments, market] = await Promise.all([
        apiFetch<DashboardStatsResponse>('/admin/stats', token),
        apiFetch<Record<string, number>>('/admin/users/stats/summary', token),
        apiFetch<Record<string, number>>('/admin/payments/stats', token),
        apiFetch<Record<string, number>>('/admin/marketplace/stats', token),
      ])
      setStats(dash)
      setUserStats(users)
      setPaymentStats(payments)
      setMarketStats(market)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PortalLayout
      title="Admin Control Panel"
      subtitle={`System oversight for ${user?.fullName || 'Administrator'} — users, marketplace, payments, and audit.`}
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Total users" value={stats?.stats.totalUsers ?? '—'} />
        <StatCard label="Registered lands" value={stats?.stats.totalLands ?? '—'} tone="success" />
        <StatCard label="Service requests" value={stats?.stats.totalRequests ?? '—'} tone="info" />
        <StatCard
          label="Completed payments"
          value={paymentStats?.completedTransactions ?? stats?.stats.completedPayments ?? '—'}
          tone="warning"
        />
      </div>

      <div className="stat-grid stat-grid--4">
        <StatCard label="Active users" value={userStats?.activeUsers ?? '—'} tone="success" />
        <StatCard label="Officers" value={userStats?.officers ?? '—'} />
        <StatCard label="Marketplace listings" value={marketStats?.totalListings ?? '—'} />
        <StatCard
          label="Revenue (ETB)"
          value={paymentStats?.totalAmount != null ? paymentStats.totalAmount.toLocaleString() : '—'}
        />
      </div>

      <div className="grid-2">
        <Panel title="Administrative modules" subtitle="RAD use cases UC-24 to UC-27">
          <div className="quick-links">
            <Link to="/admin/users" className="quick-link">
              <strong>Manage Users & Roles</strong>
              <span>Create, edit, and deactivate accounts</span>
            </Link>
            <Link to="/admin/marketplace" className="quick-link">
              <strong>Marketplace Monitor</strong>
              <span>Oversee listings and compliance</span>
            </Link>
            <Link to="/admin/payments" className="quick-link">
              <strong>Payments</strong>
              <span>Transaction logs and revenue</span>
            </Link>
            <Link to="/admin/reports" className="quick-link">
              <strong>Reports & Audit</strong>
              <span>Export operational reports</span>
            </Link>
            <Link to="/admin/settings" className="quick-link">
              <strong>System Configuration</strong>
              <span>Modules, security, and maintenance</span>
            </Link>
          </div>
        </Panel>

        <Panel title="Recent activity" subtitle="Latest citizen submissions">
          {!stats?.recentActivities?.length ? (
            <p className="muted">No recent activity.</p>
          ) : (
            <ul className="activity-list">
              {stats.recentActivities.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.description}</strong>
                    <span>{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="badge badge--review">{a.type}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PortalLayout>
  )
}
