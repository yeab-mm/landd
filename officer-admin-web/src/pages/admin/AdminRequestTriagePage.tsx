import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch, parseFormData, requestApplicant, type RequestRow } from '../../api/client'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { StatusBadge } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getRequiredDocs } from '../../constants/documentRequirements'

function isDocsApproved(fd: Record<string, unknown>): boolean {
  const review = fd.adminReview as { decision?: string } | undefined
  return review?.decision === 'approved'
}

export default function AdminRequestTriagePage() {
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
      const existingDocs = (fd.docAuthenticity as { docs?: Record<string, boolean> })?.docs || {}
      const required = getRequiredDocs(data.request.type)
      const next: Record<string, boolean | null> = {}
      required.forEach((label) => {
        if (existingDocs[label] === true) next[label] = true
        else if (existingDocs[label] === false) next[label] = false
        else next[label] = null
      })
      setDocs(next)
      setNotes((fd.docAuthenticity as { notes?: string })?.notes || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load request details')
    } finally {
      setLoading(false)
    }
  }, [token, requestId])

  useEffect(() => {
    load()
  }, [load])

  const parsedData = useMemo(
    () => (request ? parseFormData(request.formData) : {}),
    [request]
  )
  const required = useMemo(
    () => (request ? getRequiredDocs(request.type) : []),
    [request]
  )
  const submissionDocs = (parsedData.documents as Record<string, string>) || {}
  const submissionImages = (parsedData.images as string[]) || []
  const docsApproved = isDocsApproved(parsedData)

  const authenticCount = required.filter((l) => docs[l] === true).length
  const allMarkedAuthentic = required.length > 0 && required.every((l) => docs[l] === true)
  const allFilesPresent = required.every((l) => Boolean(submissionDocs[l]))
  const canApproveDocs = allMarkedAuthentic && allFilesPresent && !docsApproved
  const canForward = docsApproved && allMarkedAuthentic

  const buildPayload = () => {
    const payloadDocs: Record<string, boolean> = {}
    Object.entries(docs).forEach(([k, v]) => {
      if (v !== null) payloadDocs[k] = v
    })
    return { docs: payloadDocs, notes: notes || undefined }
  }

  const handleApproveDocuments = async () => {
    if (!request || !token) return
    if (!canApproveDocs) {
      setError('Mark every required document as Authentic and ensure each file is uploaded.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await apiFetch(`/requests/${request.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Document Validation',
          docValidation: buildPayload(),
        }),
      })
      setSuccess('Documents approved. You can now forward to an officer.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve documents')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (status: string) => {
    if (!request || !token) return

    if (status === 'Rejected' && !notes.trim()) {
      setError('A reason for rejection is required in the notes.')
      return
    }

    if (status === 'Assigned to Officer') {
      if (!canForward) {
        setError('Approve all required documents before forwarding to an officer.')
        return
      }
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await apiFetch(`/requests/${request.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          docValidation: buildPayload(),
        }),
      })
      setSuccess(
        status === 'Assigned to Officer'
          ? 'Forwarded to officer queue.'
          : 'Request rejected.'
      )
      setTimeout(() => navigate('/admin/requests'), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update request')
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
      <PortalLayout title="Loading request…" subtitle="Fetching submission data" nav={adminNav}>
        <div className="page-loading">
          <div className="spinner" />
          <p className="muted">Loading triage workspace…</p>
        </div>
      </PortalLayout>
    )
  }

  if (!request) {
    return (
      <PortalLayout title="Request not found" subtitle="Invalid or removed request" nav={adminNav}>
        <div className="empty-state">
          <h3>Request not found</h3>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/admin/requests')}>
            Back to queue
          </button>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout
      title={request.referenceNumber}
      subtitle={`${request.type} · ${requestApplicant(request)}`}
      nav={adminNav}
    >
      <div className="triage-grid animate-fade">
        <div className="triage-main">
          {error ? <div className="banner banner--error">{error}</div> : null}
          {success ? <div className="banner banner--success">{success}</div> : null}

          <div className="workflow-steps">
            <div className={`workflow-step ${authenticCount > 0 ? 'workflow-step--done' : 'workflow-step--active'}`}>
              <span className="workflow-step__num">1</span>
              <div>
                <strong>Review required documents</strong>
                <p className="muted">Mark each upload as Authentic or Inauthentic</p>
              </div>
            </div>
            <div className={`workflow-step ${docsApproved ? 'workflow-step--done' : canApproveDocs ? 'workflow-step--active' : ''}`}>
              <span className="workflow-step__num">2</span>
              <div>
                <strong>Approve document package</strong>
                <p className="muted">Locks checklist for officer handoff</p>
              </div>
            </div>
            <div className={`workflow-step ${request.status.toLowerCase().includes('officer') ? 'workflow-step--done' : canForward ? 'workflow-step--active' : ''}`}>
              <span className="workflow-step__num">3</span>
              <div>
                <strong>Forward to officer</strong>
                <p className="muted">Officer completes final approval</p>
              </div>
            </div>
          </div>

          <div className="triage-card">
            <div className="panel__header">
              <h2>Required documents for approval</h2>
              <p className="panel__subtitle">
                {authenticCount} of {required.length} marked authentic
                {docsApproved ? ' · Admin approved' : ''}
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
                const missing = !uri
                return (
                  <div key={label} className={`file-row ${missing ? 'file-row--missing' : ''}`}>
                    <div className="file-row__info">
                      <span className="file-row__title">{label}</span>
                      {uri ? (
                        <a href={uri} target="_blank" rel="noreferrer" className="file-row__link">
                          View attachment →
                        </a>
                      ) : (
                        <span className="file-row__missing">Required — not uploaded</span>
                      )}
                    </div>
                    <div className="file-row__actions">
                      <button
                        type="button"
                        className={`action-chip ${state === true ? 'action-chip--active-success' : ''}`}
                        disabled={missing || submitting}
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
                        Inauthentic
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="triage-card">
            <div className="panel__header">
              <h2>Application details</h2>
              <p className="panel__subtitle">Data submitted by citizen</p>
            </div>
            <div className="panel__body info-grid">
              {[
                { label: 'Title', value: parsedData.title },
                { label: 'Plot #', value: parsedData.plotNumber },
                { label: 'Land use', value: parsedData.landUseType },
                { label: 'Transaction', value: parsedData.transactionType },
                { label: 'Area', value: parsedData.area ? `${parsedData.area} m²` : null },
                {
                  label: 'Price (ETB)',
                  value: parsedData.price ? Number(parsedData.price).toLocaleString() : null,
                },
              ]
                .filter((item) => item.value)
                .map((item, i) => (
                  <div key={i} className="info-badge">
                    <span className="info-badge__label">{item.label}</span>
                    <span className="info-badge__value">{item.value as string}</span>
                  </div>
                ))}
            </div>
            {parsedData.description ? (
              <div className="panel__footer-note">
                <span className="info-badge__label">Description</span>
                <p className="muted">{parsedData.description as string}</p>
              </div>
            ) : null}
          </div>

          {submissionImages.length > 0 ? (
            <div className="triage-card">
              <div className="panel__header">
                <h2>Property photos</h2>
                <p className="panel__subtitle">{submissionImages.length} images</p>
              </div>
              <div className="panel__body media-grid">
                {submissionImages.map((uri, i) => (
                  <a key={i} href={uri} target="_blank" rel="noreferrer" className="interactive-image">
                    <img src={uri} alt={`Property ${i + 1}`} />
                    <div className="interactive-image__overlay">
                      <span className="btn btn--outline btn--sm">Expand</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="triage-sidebar">
          <div className={`triage-card triage-card--decision ${canForward ? 'pulse-decision' : ''}`}>
            <div className="panel__header">
              <h2>Admin decision</h2>
              <StatusBadge status={request.status} />
            </div>
            <div className="panel__body decision-body">
              <div className="field">
                <span>Processor notes</span>
                <textarea
                  rows={4}
                  placeholder="Notes for officers or rejection reason…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="decision-checklist">
                <div className={allFilesPresent ? 'check-ok' : 'check-warn'}>
                  {allFilesPresent ? '✓' : '!'} All required files uploaded
                </div>
                <div className={allMarkedAuthentic ? 'check-ok' : 'check-warn'}>
                  {allMarkedAuthentic ? '✓' : '!'} All documents marked authentic
                </div>
                <div className={docsApproved ? 'check-ok' : 'check-warn'}>
                  {docsApproved ? '✓' : '!'} Document package approved
                </div>
              </div>

              <button
                type="button"
                className="btn btn--success btn--block"
                disabled={submitting || !canApproveDocs}
                onClick={handleApproveDocuments}
              >
                {docsApproved ? 'Documents approved' : 'Approve documents'}
              </button>

              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={submitting || !canForward}
                onClick={() => handleAction('Assigned to Officer')}
              >
                Forward to officer
              </button>

              <button
                type="button"
                className="btn btn--danger-outline btn--block"
                disabled={submitting}
                onClick={() => handleAction('Rejected')}
              >
                Reject application
              </button>

              {!canForward && !docsApproved ? (
                <p className="muted decision-hint">
                  Complete document review and tap Approve documents before forwarding.
                </p>
              ) : null}
            </div>
          </div>

          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/admin/requests')}>
            ← Back to queue
          </button>
        </aside>
      </div>
    </PortalLayout>
  )
}
