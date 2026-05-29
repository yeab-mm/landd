import { useEffect, useState } from 'react'
import { getRequiredDocs } from '../constants/documentRequirements'

type Props = {
  open: boolean
  applicant: string
  requestType: string
  referenceNumber: string
  formData: any
  initialDocs?: Record<string, boolean>
  initialNotes?: string
  submitting?: boolean
  onClose: () => void
  onSaveValidation: (docs: Record<string, boolean>, notes: string) => void
  onApprove: (docs: Record<string, boolean>, notes: string) => void
  onReject: (docs: Record<string, boolean>, notes: string) => void
}

export default function DocumentReviewModal({
  open,
  applicant,
  requestType,
  referenceNumber,
  formData,
  initialDocs = {},
  initialNotes = '',
  submitting = false,
  onClose,
  onSaveValidation,
  onApprove,
  onReject,
}: Props) {
  const requiredDocs = getRequiredDocs(requestType)
  const [docs, setDocs] = useState<Record<string, boolean | null>>({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    const next: Record<string, boolean | null> = {}
    requiredDocs.forEach((label) => {
      if (initialDocs[label] === true) next[label] = true
      else if (initialDocs[label] === false) next[label] = false
      else next[label] = null
    })
    setDocs(next)
    setNotes(initialNotes)
  }, [open, requestType, initialDocs, initialNotes, requiredDocs])

  const parsedData = typeof formData === 'string' ? JSON.parse(formData) : formData
  const submissionDocs = parsedData?.documents || {}
  const submissionImages = parsedData?.images || []

  if (!open) return null

  const buildPayload = (): Record<string, boolean> => {
    const out: Record<string, boolean> = {}
    requiredDocs.forEach((label) => {
      if (docs[label] === true) out[label] = true
      else if (docs[label] === false) out[label] = false
    })
    return out
  }

  const allAuthentic = requiredDocs.every((label) => docs[label] === true)
  const anyMarked = requiredDocs.some((label) => docs[label] !== null)

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => !submitting && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="doc-review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id="doc-review-title">Validate supporting documents</h2>
            <p>
              {applicant} · {requestType} · {referenceNumber}
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} disabled={submitting}>
            Close
          </button>
        </header>
        <div className="modal__body text-white">
          <p className="modal__intro opacity-70 mb-6">
            Review the form details and validate supporting documents.
          </p>

          <div className="review-grid">
            <div className="review-section">
              <h3 className="review-subtitle">Form Information</h3>
              <div className="review-details">
                {parsedData?.title && (
                  <div className="detail-row">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{parsedData.title}</span>
                  </div>
                )}
                {parsedData?.plotNumber && (
                  <div className="detail-row">
                    <span className="detail-label">Plot Number:</span>
                    <span className="detail-value font-mono">{parsedData.plotNumber}</span>
                  </div>
                )}
                {parsedData?.price && (
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value text-success font-bold">ETB {Number(parsedData.price).toLocaleString()}</span>
                  </div>
                )}
                {parsedData?.area && (
                  <div className="detail-row">
                    <span className="detail-label">Area:</span>
                    <span className="detail-value">{parsedData.area} m²</span>
                  </div>
                )}
                {parsedData?.landUseType && (
                  <div className="detail-row">
                    <span className="detail-label">Land Use:</span>
                    <span className="detail-value">{parsedData.landUseType}</span>
                  </div>
                )}
                {parsedData?.transactionType && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction:</span>
                    <span className="detail-value">{parsedData.transactionType}</span>
                  </div>
                )}
                {parsedData?.description && (
                  <div className="detail-row detail-row--column">
                    <span className="detail-label">Description:</span>
                    <p className="detail-text">{parsedData.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="review-section">
              <h3 className="review-subtitle">Supporting Documents</h3>
              <ul className="doc-list">
                {requiredDocs.map((label) => {
                  const state = docs[label]
                  const docUri = submissionDocs[label]
                  return (
                    <li key={label} className="doc-list__item">
                      <div className="doc-info">
                        <span className="doc-name">{label}</span>
                        {docUri ? (
                          <a href={docUri} target="_blank" rel="noreferrer" className="doc-view-link">
                            View Document
                          </a>
                        ) : (
                          <span className="doc-missing">(Not Uploaded)</span>
                        )}
                      </div>
                      <div className="doc-list__actions">
                        <button
                          type="button"
                          className={state === true ? 'btn btn--success btn--sm active' : 'btn btn--outline btn--sm'}
                          disabled={submitting}
                          onClick={() =>
                            setDocs((prev) => ({
                              ...prev,
                              [label]: prev[label] === true ? null : true,
                            }))
                          }
                        >
                          Authentic
                        </button>
                        <button
                          type="button"
                          className={state === false ? 'btn btn--danger btn--sm active' : 'btn btn--outline btn--sm'}
                          disabled={submitting}
                          onClick={() =>
                            setDocs((prev) => ({
                              ...prev,
                              [label]: prev[label] === false ? null : false,
                            }))
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {submissionImages.length > 0 && (
                <div className="image-preview-section">
                  <h4 className="review-subtitle">Property Photos</h4>
                  <div className="image-grid">
                    {submissionImages.map((uri: string, i: number) => (
                      <a key={i} href={uri} target="_blank" rel="noreferrer" className="image-thumb">
                        <img src={uri} alt={`Property ${i + 1}`} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="field">
            <span>Reviewer Notes</span>
            <textarea
              rows={3}
              value={notes}
              disabled={submitting}
              placeholder="Validation notes (required when rejecting)"
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <footer className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={submitting || !anyMarked}
            onClick={() => onSaveValidation(buildPayload(), notes.trim())}
          >
            Save validation
          </button>
          <button
            type="button"
            className="btn btn--danger"
            disabled={submitting}
            onClick={() => onReject(buildPayload(), notes.trim())}
          >
            Reject request
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={submitting || !allAuthentic}
            onClick={() => onApprove(buildPayload(), notes.trim())}
          >
            Approve
          </button>
        </footer>
      </div>
    </div>
  )
}
