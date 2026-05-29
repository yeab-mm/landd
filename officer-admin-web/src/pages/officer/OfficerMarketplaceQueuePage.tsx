import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseFormData, requestApplicant, type RequestRow } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'
import { isForwardedToOfficer, isMarketplaceRequest, isOpenForOfficer } from '../../utils/requestWorkflow'

export default function OfficerMarketplaceQueuePage() {
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
        (data.requests || []).filter(
          (r) => isMarketplaceRequest(r) && isForwardedToOfficer(r),
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace queue')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return requests
    return requests.filter((r) => {
      const fd = parseFormData(r.formData)
      const title = String(fd.title || '').toLowerCase()
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        requestApplicant(r).toLowerCase().includes(q) ||
        title.includes(q)
      )
    })
  }, [requests, search])

  const pending = requests.filter(isOpenForOfficer).length
  const approved = requests.filter((r) => (r.status || '').toLowerCase().includes('approv')).length

  return (
    <PortalLayout
      title="Marketplace approvals"
      subtitle="Final review for listings forwarded by admin — publish to citizen marketplace on approve."
      nav={officerNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Awaiting officer" value={pending} tone="warning" />
        <StatCard label="Published" value={approved} tone="success" />
        <StatCard label="In queue" value={requests.length} tone="info" />
      </div>

      <Panel
        title="Listing approval queue"
        subtitle="Admin-cleared marketplace submissions"
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search reference, title, applicant…"
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
          <p className="muted">Loading listings…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No listings in queue"
            message="When admin forwards a marketplace listing, it will appear here for your final approval."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Listing</th>
                  <th>Applicant</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const fd = parseFormData(r.formData)
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.referenceNumber}</strong>
                        <div className="muted">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div>{(fd.title as string) || 'Untitled listing'}</div>
                        <div className="muted font-mono">{(fd.plotNumber as string) || '—'}</div>
                      </td>
                      <td>{requestApplicant(r)}</td>
                      <td className="text-success">
                        ETB {Number(fd.price || 0).toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="table-actions">
                        <Link to={`/officer/requests/${r.id}`} className="btn btn--primary btn--sm">
                          {isOpenForOfficer(r) ? 'Review & approve' : 'View case'}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PortalLayout>
  )
}
