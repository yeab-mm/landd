import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch, parseFormData, requestApplicant, type RequestRow } from '../../api/client'
import { PortalLayout, officerNav } from '../../components/PortalLayout'
import { StatusBadge } from '../../components/ui'
import { getRequiredDocs } from '../../constants/documentRequirements'
import { useAuth } from '../../context/AuthContext'
import { isAdminDocsApproved, isMarketplaceRequest } from '../../utils/requestWorkflow'

export default function OfficerRequestReviewPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [request, setRequest] = useState<RequestRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [docs, setDocs] = useState<Record<string, boolean | null>>({})
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    if (!token || !requestId) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ request: RequestRow }>(`/requests/${requestId}`, token)
      setRequest(data.request)
      const fd = parseFormData(data.request.formData)
      const adminDocs = (fd.adminReview as { docs?: Record<string, boolean> })?.docs || {}
      const officerDocs = (fd.docAuthenticity as { docs?: Record<string, boolean> })?.docs || {}
      const required = getRequiredDocs(data.request.type)
      const next: Record<string, boolean | null> = {}
      required.forEach((label) => {
        if (officerDocs[label] === true || adminDocs[label] === true) next[label] = true
        else if (officerDocs[label] === false || adminDocs[label] === false) next[label] = false
        else next[label] = null
      })
      setDocs(next)
      setNotes(
        (fd.docAuthenticity as { notes?: string })?.notes ||
          (fd.adminReview as { notes?: string })?.notes ||
          ''
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load case')
    } finally {
      setLoading(false)
    }
  }, [token, requestId])

  useEffect(() => {
    load()
  }, [load])

  const parsedData = useMemo(() => (request ? parseFormData(request.formData) : {}), [request])
  const required = useMemo(() => (request ? getRequiredDocs(request.type) : []), [request])
  const submissionDocs = (parsedData.documents as Record<string, string>) || {}
  const submissionImages = (parsedData.images as string[]) || []
  const adminReview = parsedData.adminReview as {
    decision?: string
    notes?: string
    reviewedAt?: string
  } | undefined
  const adminApproved = isAdminDocsApproved(parsedData)
  const isMarketplace = request ? isMarketplaceRequest(request) : false

  const authenticCount = required.filter((l) => docs[l] === true).length
  const allAuthentic = required.length > 0 && required.every((l) => docs[l] === true)
  const canApprove = adminApproved && allAuthentic

  const buildPayload = () => {
    const payloadDocs: Record<string, boolean> = {}
    Object.entries(docs).forEach(([k, v]) => {
      if (v !== null) payloadDocs[k] = v
    })
    return { docs: payloadDocs, notes: notes || undefined }
  }

  const handleApprove = async () => {
    if (!request || !token || !canApprove) return
    setSubmitting(true)
    setError('')
    try {
      const result = await apiFetch<{
        message?: string
        published?: boolean
      }>(`/requests/${request.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Approved',
          docValidation: buildPayload(),
        }),
      })
      setSuccess(
        result.published || isMarketplace
          ? 'Listing is live on the citizen marketplace. The owner has been notified.'
          : 'Request approved. Citizen has been notified and land records updated.'
      )
      setTimeout(() => navigate(-1), 2200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!request || !token) return
    if (!notes.trim()) {
      setError('Officer notes are required when rejecting.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await apiFetch(`/requests/${request.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Rejected',
          docValidation: buildPayload(),
        }),
      })
      setSuccess('Request rejected. Citizen has been notified.')
      setTimeout(() => navigate(-1), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rejection failed')
    } finally {
      setSubmitting(false)
    }
  }

  const setDocState = (label: string, value: boolean | null) => {
    if (value === true && !submissionDocs[label]) return
    setDocs((p) => ({ ...p, [label]: p[label] === value ? null : value }))
  }

  if (loading) {
    return (
      <PortalLayout title="Loading case…" subtitle="Officer review workspace" nav={officerNav}>
        <div className="page-loading">
          <div className="spinner" />
        </div>
      </PortalLayout>
    )
  }

  if (!request) {
    return (
      <PortalLayout title="Case not found" subtitle="" nav={officerNav}>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/officer')}>
          Back to dashboard
        </button>
      </PortalLayout>
    )
  }

  const backPath = isMarketplace
    ? '/officer/marketplace'
    : request.type === 'Ownership Verification'
      ? '/officer/verification'
      : request.type === 'Ownership Transfer'
        ? '/officer/transfers'
        : '/officer/services'

  return (
    <PortalLayout
      title={request.referenceNumber}
      subtitle={`${request.type} · ${requestApplicant(request)}`}
      nav={officerNav}
    >
      <div className="triage-grid animate-fade">
        <div className="triage-main">
          {error ? <div className="banner banner--error">{error}</div> : null}
          {success ? <div className="banner banner--success">{success}</div> : null}

          <div className={`admin-forward-banner ${adminApproved ? 'admin-forward-banner--ok' : 'admin-forward-banner--warn'}`}>
            <div>
              <strong>Admin document review</strong>
              <p className="muted">
                {adminApproved
                  ? 'Admin approved all required documents and forwarded this case to you.'
                  : 'Waiting for admin approval before you can finalize.'}
              </p>
              {adminReview?.notes ? (
                <p className="muted" style={{ marginTop: '0.5rem' }}>
                  Admin notes: {adminReview.notes}
                </p>
              ) : null}
            </div>
            <StatusBadge status={request.status} />
          </div>

          {isMarketplace ? (
            <div className="triage-card marketplace-highlight">
              <div className="panel__header">
                <h2>Marketplace listing preview</h2>
                <p className="panel__subtitle">Will go live for citizens after your approval</p>
              </div>
              <div className="panel__body info-grid">
                <div className="info-badge">
                  <span className="info-badge__label">Title</span>
                  <span className="info-badge__value">{(parsedData.title as string) || '—'}</span>
                </div>
                <div className="info-badge">
                  <span className="info-badge__label">Price</span>
                  <span className="info-badge__value text-success">
                    ETB {Number(parsedData.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="info-badge">
                  <span className="info-badge__label">Plot</span>
                  <span className="info-badge__value">{(parsedData.plotNumber as string) || '—'}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="triage-card">
            <div className="panel__header">
              <h2>Required documents</h2>
              <p className="panel__subtitle">
                Confirm admin validation · {authenticCount}/{required.length} marked authentic
              </p>
            </div>
            <div className="doc-progress">
              <div
                className="doc-progress__bar"
                style={{ width: `${required.length ? (authenticCount / required.length) * 100 : 0}%` }}
              />
            </div>
            <div className="panel__body panel__body--flush">
              {required.map((label) => {
                const uri = submissionDocs[label]
                const state = docs[label]
                const adminOk = (adminReview as { docs?: Record<string, boolean> })?.docs?.[label] === true
                return (
                  <div key={label} className={`file-row ${!uri ? 'file-row--missing' : ''}`}>
                    <div className="file-row__info">
                      <span className="file-row__title">{label}</span>
                      {adminOk ? (
                        <span className="doc-pill doc-pill--ok" style={{ alignSelf: 'flex-start' }}>
                          Admin ✓
                        </span>
                      ) : null}
                      {uri ? (
                        <a href={uri} target="_blank" rel="noreferrer" className="file-row__link">
                          Open document →
                        </a>
                      ) : (
                        <span className="file-row__missing">Missing upload</span>
                      )}
                    </div>
                    <div className="file-row__actions">
                      <button
                        type="button"
                        className={`action-chip ${state === true ? 'action-chip--active-success' : ''}`}
                        disabled={!uri || submitting}
                        onClick={() => setDocState(label, true)}
                      >
                        Authentic
                      </button>
                      <button
                        type="button"
                        className={`action-chip ${state === false ? 'action-chip--active-danger' : ''}`}
                        disabled={submitting}
                        onClick={() => setDocState(label, false)}
                      >
                        Reject doc
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {submissionImages.length > 0 ? (
            <div className="triage-card">
              <div className="panel__header">
                <h2>Property photos</h2>
              </div>
              <div className="panel__body media-grid">
                {submissionImages.map((uri, i) => (
                  <a key={i} href={uri} target="_blank" rel="noreferrer" className="interactive-image">
                    <img src={uri} alt={`Photo ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="triage-sidebar">
          <div className={`triage-card triage-card--decision ${canApprove ? 'pulse-decision' : ''}`}>
            <div className="panel__header">
              <h2>Officer decision</h2>
            </div>
            <div className="panel__body decision-body">
              <div className="field">
                <span>Officer notes</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Field notes or rejection reason…"
                />
              </div>

              <div className="decision-checklist">
                <div className={adminApproved ? 'check-ok' : 'check-warn'}>
                  {adminApproved ? '✓' : '!'} Admin approved documents
                </div>
                <div className={allAuthentic ? 'check-ok' : 'check-warn'}>
                  {allAuthentic ? '✓' : '!'} Officer confirms all authentic
                </div>
                {isMarketplace ? (
                  <div className="check-ok">✓ Publishes to citizen marketplace</div>
                ) : null}
              </div>

              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={submitting || !canApprove}
                onClick={handleApprove}
              >
                {isMarketplace ? 'Approve & publish listing' : 'Approve request'}
              </button>

              <button
                type="button"
                className="btn btn--danger-outline btn--block"
                disabled={submitting}
                onClick={handleReject}
              >
                Reject request
              </button>

              {!canApprove ? (
                <p className="muted decision-hint">
                  {!adminApproved
                    ? 'Admin must approve and forward this case first.'
                    : 'Mark every required document as Authentic to approve.'}
                </p>
              ) : null}
            </div>
          </div>

          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate(backPath)}>
            ← Back to queue
          </button>
        </aside>
      </div>
    </PortalLayout>
  )
}
