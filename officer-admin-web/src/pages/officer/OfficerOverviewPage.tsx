import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, type RequestRow } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'
import {
  isForwardedToOfficer,
  isMarketplaceRequest,
  isOpenForOfficer,
} from '../../utils/requestWorkflow'

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
      setRequests((data.requests || []).filter(isForwardedToOfficer))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const marketplace = requests.filter(isMarketplaceRequest)
  const verification = requests.filter((r) => r.type === 'Ownership Verification')
  const transfers = requests.filter((r) => r.type === 'Ownership Transfer')
  const services = requests.filter(
    (r) =>
      r.type !== 'Ownership Verification' &&
      r.type !== 'Ownership Transfer' &&
      !isMarketplaceRequest(r),
  )
  const pending = requests.filter(isOpenForOfficer)
  const recent = [...pending]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <PortalLayout
      title="Land officer portal"
      subtitle={`Welcome, ${user?.fullName || 'Officer'}. Review admin-forwarded cases, validate documents, and publish marketplace listings.`}
      nav={officerNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="hero-card officer-hero">
        <div className="hero-card__content">
          <h2>Final approval desk</h2>
          <p>
            Admin has validated documents on these cases. Your approval notifies the citizen and,
            for marketplace listings, publishes the property to the public marketplace.
          </p>
        </div>
        <div className="officer-hero__badge">
          <span className="officer-hero__value">{pending.length}</span>
          <span className="officer-hero__label">Cases awaiting you</span>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Marketplace" value={marketplace.filter(isOpenForOfficer).length} tone="success" />
        <StatCard label="Verification" value={verification.filter(isOpenForOfficer).length} tone="info" />
        <StatCard label="Transfers" value={transfers.filter(isOpenForOfficer).length} tone="warning" />
        <StatCard label="Services" value={services.filter(isOpenForOfficer).length} />
      </div>

      <div className="grid-2">
        <Panel title="Queues" subtitle="Open a department to review forwarded cases">
          <div className="quick-links">
            <Link to="/officer/marketplace" className="quick-link quick-link--highlight">
              <strong>Marketplace approvals</strong>
              <span>Publish listings to the citizen marketplace</span>
            </Link>
            <Link to="/officer/verification" className="quick-link">
              <strong>Field verification</strong>
              <span>Ownership verification forwarded by admin</span>
            </Link>
            <Link to="/officer/transfers" className="quick-link">
              <strong>Transfer requests</strong>
              <span>Final sign-off on ownership transfers</span>
            </Link>
            <Link to="/officer/services" className="quick-link">
              <strong>Land services</strong>
              <span>Subdivision, mutation, zoning, and more</span>
            </Link>
          </div>
        </Panel>

        <Panel title="Priority inbox" subtitle="Latest admin-forwarded cases">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : recent.length === 0 ? (
            <EmptyState title="All clear" message="No pending cases in your inbox." />
          ) : (
            <ul className="activity-list">
              {recent.map((r) => (
                <li key={r.id}>
                  <div>
                    <Link to={`/officer/requests/${r.id}`}>
                      <strong>{r.referenceNumber}</strong>
                    </Link>
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
