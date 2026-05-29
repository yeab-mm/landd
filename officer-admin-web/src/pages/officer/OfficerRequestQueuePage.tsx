import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  apiFetch,
  requestApplicant,
  type RequestRow,
} from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'
import { isForwardedToOfficer, isMarketplaceRequest, isOpenForOfficer } from '../../utils/requestWorkflow'

type QueueKind = 'transfer' | 'service'

const CONFIG: Record<
  QueueKind,
  { title: string; subtitle: string; filter: (r: RequestRow) => boolean }
> = {
  transfer: {
    title: 'Ownership transfers',
    subtitle: 'Transfer applications forwarded by admin for final officer approval.',
    filter: (r) => r.type === 'Ownership Transfer',
  },
  service: {
    title: 'Land services',
    subtitle: 'Subdivision, mutation, zoning, and other services cleared by admin.',
    filter: (r) =>
      r.type !== 'Ownership Verification' &&
      r.type !== 'Ownership Transfer' &&
      !isMarketplaceRequest(r) &&
      !r.type.toLowerCase().includes('registration'),
  },
}

export default function OfficerRequestQueuePage({ kind }: { kind: QueueKind }) {
  const cfg = CONFIG[kind]
  const { token } = useAuth()
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ requests: RequestRow[] }>('/requests', token)
      setRequests(
        (data.requests || []).filter((r) => cfg.filter(r) && isForwardedToOfficer(r)),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [token, kind])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return requests
    return requests.filter((r) => {
      const applicant = requestApplicant(r).toLowerCase()
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        applicant.includes(q)
      )
    })
  }, [requests, search])

  const pending = requests.filter(isOpenForOfficer).length

  return (
    <PortalLayout title={cfg.title} subtitle={cfg.subtitle} nav={officerNav}>
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Awaiting officer" value={pending} tone="warning" />
        <StatCard label="In queue" value={requests.length} tone="info" />
      </div>

      <Panel
        title={cfg.title}
        subtitle={`${filtered.length} admin-forwarded application(s)`}
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search"
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Queue empty"
            message="Cases appear here after admin approves documents and forwards to you."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Applicant</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.referenceNumber}</strong>
                    </td>
                    <td>{r.type}</td>
                    <td>{requestApplicant(r)}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="table-actions">
                      <Link to={`/officer/requests/${r.id}`} className="btn btn--primary btn--sm">
                        {isOpenForOfficer(r) ? 'Review & decide' : 'View case'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PortalLayout>
  )
}
