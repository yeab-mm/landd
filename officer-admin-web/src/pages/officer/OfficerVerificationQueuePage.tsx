import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  apiFetch,
  parseFormData,
  requestApplicant,
  type RequestRow,
} from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'
import { isForwardedToOfficer, isOpenForOfficer } from '../../utils/requestWorkflow'

export default function OfficerVerificationQueuePage() {
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
          (r) => r.type === 'Ownership Verification' && isForwardedToOfficer(r),
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load verification queue')
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
      const applicant = requestApplicant(r).toLowerCase()
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        applicant.includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    })
  }, [requests, search])

  const pendingCount = requests.filter(isOpenForOfficer).length
  const approvedCount = requests.filter((r) =>
    (r.status || '').toLowerCase().includes('approv'),
  ).length

  return (
    <PortalLayout
      title="Field verification"
      subtitle="Ownership claims forwarded by admin — review documents and approve or reject."
      nav={officerNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Awaiting decision" value={pendingCount} tone="warning" />
        <StatCard label="Approved" value={approvedCount} tone="success" />
        <StatCard label="Forwarded cases" value={requests.length} tone="info" />
      </div>

      <Panel
        title="Verification queue"
        subtitle="Admin-cleared ownership verification"
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search claim ID or applicant…"
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
          <p className="muted">Loading queue…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Queue clear"
            message="No verification cases forwarded by admin right now."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Applicant</th>
                  <th>Land</th>
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
                        <div>{requestApplicant(r)}</div>
                        <small className="muted">{r.user?.email || ''}</small>
                      </td>
                      <td>
                        <div>{(fd.landUseType as string) || 'Residential'}</div>
                        <div className="muted">
                          {(fd.kebele as string) || '—'} · {(fd.plotNumber as string) || '—'}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="table-actions">
                        <Link to={`/officer/requests/${r.id}`} className="btn btn--primary btn--sm">
                          {isOpenForOfficer(r) ? 'Review case' : 'View audit'}
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
