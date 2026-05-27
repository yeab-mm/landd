import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, type RequestRow } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

function isOpenStatus(status: string) {
  const s = (status || '').toLowerCase()
  return !s.includes('approv') && !s.includes('reject')
}

export default function OfficerOverviewPage() {
  const { token, user } = useAuth()
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ requests: RequestRow[] }>('/requests', token)
      setRequests(data.requests || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const verification = requests.filter((r) => r.type === 'Ownership Verification')
  const transfers = requests.filter((r) => r.type === 'Ownership Transfer')
  const services = requests.filter(
    (r) =>
      r.type !== 'Ownership Verification' &&
      r.type !== 'Ownership Transfer' &&
      !r.type.toLowerCase().includes('registration'),
  )
  const pending = requests.filter((r) => isOpenStatus(r.status))
  const recent = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <PortalLayout
      title="Land Officer Portal"
      subtitle={`Welcome back, ${user?.fullName || 'Officer'}. Review verification, transfer, and service queues.`}
      nav={officerNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Open cases" value={pending.length} tone="warning" />
        <StatCard label="Verification queue" value={verification.filter((r) => isOpenStatus(r.status)).length} tone="info" />
        <StatCard label="Transfer queue" value={transfers.filter((r) => isOpenStatus(r.status)).length} />
        <StatCard label="Service applications" value={services.filter((r) => isOpenStatus(r.status)).length} tone="success" />
      </div>

      <div className="grid-2">
        <Panel title="Quick access" subtitle="RAD officer workflows (UC-18 to UC-23)">
          <div className="quick-links">
            <Link to="/officer/verification" className="quick-link">
              <strong>Verification Queue</strong>
              <span>Review ownership verification requests</span>
            </Link>
            <Link to="/officer/transfers" className="quick-link">
              <strong>Transfer Requests</strong>
              <span>Process ownership transfer applications</span>
            </Link>
            <Link to="/officer/services" className="quick-link">
              <strong>Service Applications</strong>
              <span>Subdivision, mutation, zoning, and more</span>
            </Link>
          </div>
        </Panel>

        <Panel title="Recent activity" subtitle="Latest submissions across all queues">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : recent.length === 0 ? (
            <EmptyState title="No requests yet" message="New citizen submissions will appear here." />
          ) : (
            <ul className="activity-list">
              {recent.map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>{r.referenceNumber}</strong>
                    <span>{r.type}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PortalLayout>
  )
}
