import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiFetch,
  parseFormData,
  requestApplicant,
  type RequestRow,
} from '../../api/client'
import DocumentReviewModal from '../../components/DocumentReviewModal'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

function isOpenStatus(status: string) {
  const s = (status || '').toLowerCase()
  return !s.includes('approv') && !s.includes('reject')
}

export default function OfficerVerificationQueuePage() {
  const { token } = useAuth()
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [reviewTarget, setReviewTarget] = useState<RequestRow | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ requests: RequestRow[] }>('/requests', token)
      setRequests(
        (data.requests || []).filter((r) => r.type === 'Ownership Verification'),
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

  const pendingCount = requests.filter((r) => isOpenStatus(r.status)).length
  const validationCount = requests.filter((r) =>
    (r.status || '').toLowerCase().includes('valid'),
  ).length
  const approvedCount = requests.filter((r) =>
    (r.status || '').toLowerCase().includes('approv'),
  ).length

  const submitUpdate = async (
    requestId: string,
    status: string,
    docs: Record<string, boolean>,
    notes: string,
  ) => {
    await apiFetch(`/requests/${requestId}`, token, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        docValidation: { docs, notes: notes || undefined },
      }),
    })
  }

  const docAuth = (r: RequestRow) => {
    const fd = parseFormData(r.formData)
    const auth = fd.docAuthenticity as { docs?: Record<string, boolean>; notes?: string } | undefined
    return auth
  }

  return (
    <PortalLayout
      title="Verification Queue"
      subtitle="Review verification requests, validate Sened documents, and approve or reject (UC-18 to UC-20)."
      nav={officerNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}
      {actionError ? <p className="banner banner--error">{actionError}</p> : null}

      <div className="stat-grid stat-grid--4">
        <StatCard label="Open" value={pendingCount} tone="warning" />
        <StatCard label="In validation" value={validationCount} tone="info" />
        <StatCard label="Approved" value={approvedCount} tone="success" />
        <StatCard label="Total" value={requests.length} />
      </div>

      <Panel
        title="Pending verification requests"
        subtitle={`${filtered.length} request(s)`}
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search reference or applicant…"
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
          <p className="muted">Loading verification queue…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="All caught up" message="No verification requests in the queue." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Land</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const fd = parseFormData(r.formData)
                  const auth = docAuth(r)
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.referenceNumber}</strong>
                      </td>
                      <td>{requestApplicant(r)}</td>
                      <td>
                        {(fd.landUseType as string) || '—'} · {(fd.kebele as string) || '—'}
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="table-actions">
                        {isOpenStatus(r.status) ? (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => {
                              setActionError('')
                              setReviewTarget(r)
                            }}
                          >
                            Review documents
                          </button>
                        ) : (
                          <span className="muted">
                            {auth?.docs
                              ? `${Object.keys(auth.docs).length} doc(s) reviewed`
                              : 'Closed'}
                          </span>
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

      <DocumentReviewModal
        open={!!reviewTarget}
        applicant={reviewTarget ? requestApplicant(reviewTarget) : ''}
        requestType={reviewTarget?.type || ''}
        referenceNumber={reviewTarget?.referenceNumber || ''}
        initialDocs={reviewTarget ? docAuth(reviewTarget)?.docs : undefined}
        initialNotes={reviewTarget ? docAuth(reviewTarget)?.notes || '' : ''}
        submitting={submitting}
        onClose={() => !submitting && setReviewTarget(null)}
        onSaveValidation={async (docs, notes) => {
          if (!reviewTarget) return
          setSubmitting(true)
          setActionError('')
          try {
            await submitUpdate(reviewTarget.id, 'Document Validation', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not save validation')
          } finally {
            setSubmitting(false)
          }
        }}
        onApprove={async (docs, notes) => {
          if (!reviewTarget) return
          setSubmitting(true)
          setActionError('')
          try {
            await submitUpdate(reviewTarget.id, 'Approved', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Approval failed')
          } finally {
            setSubmitting(false)
          }
        }}
        onReject={async (docs, notes) => {
          if (!reviewTarget) return
          if (!notes.trim()) {
            setActionError('Officer notes are required when rejecting a request.')
            return
          }
          if (!window.confirm(`Reject ${requestApplicant(reviewTarget)}'s verification request?`)) return
          setSubmitting(true)
          setActionError('')
          try {
            await submitUpdate(reviewTarget.id, 'Rejected', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Rejection failed')
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </PortalLayout>
  )
}
