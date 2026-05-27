import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiFetch,
  parseFormData,
  requestApplicant,
  type RequestRow,
} from '../../api/client'
import DocumentReviewModal from '../../components/DocumentReviewModal'
import { EmptyState, Panel, StatusBadge } from '../../components/ui'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

type QueueKind = 'transfer' | 'service'

const CONFIG: Record<
  QueueKind,
  { title: string; subtitle: string; path: string; filter: (r: RequestRow) => boolean }
> = {
  transfer: {
    title: 'Transfer Requests',
    subtitle: 'Review and process ownership transfer applications (UC-21, UC-22).',
    path: '/officer/transfers',
    filter: (r) => r.type === 'Ownership Transfer',
  },
  service: {
    title: 'Service Applications',
    subtitle: 'Process land service applications such as subdivision and mutation (UC-23).',
    path: '/officer/services',
    filter: (r) =>
      r.type !== 'Ownership Verification' &&
      r.type !== 'Ownership Transfer' &&
      !r.type.toLowerCase().includes('registration'),
  },
}

function isOpenStatus(status: string) {
  const s = (status || '').toLowerCase()
  return !s.includes('approv') && !s.includes('reject')
}

export default function OfficerRequestQueuePage({ kind }: { kind: QueueKind }) {
  const cfg = CONFIG[kind]
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
      setRequests((data.requests || []).filter(CONFIG[kind].filter))
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
    return fd.docAuthenticity as { docs?: Record<string, boolean>; notes?: string } | undefined
  }

  const quickStatus = async (r: RequestRow, status: string) => {
    const notes =
      status === 'Rejected'
        ? window.prompt('Enter rejection reason for the citizen:') || ''
        : ''
    if (status === 'Rejected' && !notes.trim()) return
    setSubmitting(true)
    setActionError('')
    try {
      await apiFetch(`/requests/${r.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ status, docValidation: { docs: {}, notes: notes || undefined } }),
      })
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PortalLayout title={cfg.title} subtitle={cfg.subtitle} nav={officerNav}>
      {error ? <p className="banner banner--error">{error}</p> : null}
      {actionError ? <p className="banner banner--error">{actionError}</p> : null}

      <Panel
        title={cfg.title}
        subtitle={`${filtered.length} application(s)`}
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
          <EmptyState title="Queue empty" message="No applications in this queue." />
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
                  <th>Actions</th>
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
                      {isOpenStatus(r.status) ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            disabled={submitting}
                            onClick={() => {
                              setActionError('')
                              setReviewTarget(r)
                            }}
                          >
                            Validate docs
                          </button>
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            disabled={submitting}
                            onClick={() => quickStatus(r, 'Under Review')}
                          >
                            On hold
                          </button>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            disabled={submitting}
                            onClick={() => quickStatus(r, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            disabled={submitting}
                            onClick={() => quickStatus(r, 'Rejected')}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="muted">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
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
          try {
            await submitUpdate(reviewTarget.id, 'Document Validation', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Save failed')
          } finally {
            setSubmitting(false)
          }
        }}
        onApprove={async (docs, notes) => {
          if (!reviewTarget) return
          setSubmitting(true)
          try {
            await submitUpdate(reviewTarget.id, 'Approved', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Approve failed')
          } finally {
            setSubmitting(false)
          }
        }}
        onReject={async (docs, notes) => {
          if (!reviewTarget) return
          if (!notes.trim()) {
            setActionError('Notes required for rejection.')
            return
          }
          setSubmitting(true)
          try {
            await submitUpdate(reviewTarget.id, 'Rejected', docs, notes)
            setReviewTarget(null)
            await load()
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Reject failed')
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </PortalLayout>
  )
}
