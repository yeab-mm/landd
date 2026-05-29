import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  apiFetch,
  parseFormData,
  requestApplicant,
  type RequestRow,
} from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminRequestsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
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
      // Admins see all requests except those already approved/rejected (unless they want to audit)
      setRequests(data.requests || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return requests.filter((r) => {
      const applicant = requestApplicant(r).toLowerCase()
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        applicant.includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      )
    })
  }, [requests, search])

  const triageCount = requests.filter((r) => 
    ['submitted', 'pending', 'under review', 'document validation'].includes(r.status.toLowerCase())
  ).length
  
  const officerCount = requests.filter((r) => 
    r.status.toLowerCase().includes('officer')
  ).length

  return (
    <PortalLayout
      title="Service Requests Triage"
      subtitle="The gateway for all citizen submissions. Validate documents and forward to specialized officers."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Awaiting Triage" value={triageCount} tone="warning" />
        <StatCard label="With Officers" value={officerCount} tone="info" />
        <StatCard label="Total Requests" value={requests.length} />
        <StatCard label="Completed" value={requests.length - triageCount - officerCount} tone="success" />
      </div>

      <Panel
        title="Incoming Request Queue"
        subtitle="Perform initial document verification before forwarding"
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search reference, type or applicant…"
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
          <p className="muted">Loading requests…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Queue Empty" message="No service requests currently require attention." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Docs</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const status = r.status.toLowerCase()
                  const isActionable = ['submitted', 'pending', 'under review', 'document validation'].includes(status)
                  const fd = parseFormData(r.formData)
                  const adminReview = fd.adminReview as { decision?: string } | undefined
                  const docLabel =
                    adminReview?.decision === 'approved'
                      ? 'Approved'
                      : status.includes('officer')
                        ? 'Forwarded'
                        : 'Pending'

                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="text-small font-bold">{r.type}</span>
                      </td>
                      <td>
                        <strong>{r.referenceNumber}</strong>
                      </td>
                      <td>{requestApplicant(r)}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <span className={`doc-pill doc-pill--${adminReview?.decision === 'approved' ? 'ok' : 'wait'}`}>
                          {docLabel}
                        </span>
                      </td>
                      <td className="table-actions">
                        {isActionable ? (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => navigate(`/admin/requests/${r.id}`)}
                          >
                            Triage Request
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => navigate(`/admin/requests/${r.id}`)}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* DocumentReviewModal removed - using Triage Detail Page */}
    </PortalLayout>
  )
}
