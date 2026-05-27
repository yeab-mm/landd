import { useEffect, useState } from 'react'
import { getRequiredDocs } from '../constants/documentRequirements'

type Props = {
  open: boolean
  applicant: string
  requestType: string
  referenceNumber: string
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
        <div className="modal__body">
          <p className="modal__intro">
            Mark each document as accepted or rejected. Save progress to move the case to{' '}
            <strong>Document Validation</strong>. Approve only when every required document is
            authentic.
          </p>
          <ul className="doc-list">
            {requiredDocs.map((label) => {
              const state = docs[label]
              return (
                <li key={label} className="doc-list__item">
                  <span>{label}</span>
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
          <label className="field">
            <span>Officer notes</span>
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
