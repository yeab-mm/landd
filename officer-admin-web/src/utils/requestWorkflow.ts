import { parseFormData, type RequestRow } from '../api/client'

export function parseFd(r: RequestRow) {
  return parseFormData(r.formData)
}

export function isAdminDocsApproved(fd: Record<string, unknown>): boolean {
  const review = fd.adminReview as { decision?: string } | undefined
  return review?.decision === 'approved'
}

/** Request was forwarded by admin for officer final approval */
export function isForwardedToOfficer(r: RequestRow): boolean {
  const fd = parseFd(r)
  const status = (r.status || '').toLowerCase()
  return (
    status.includes('assigned to officer') ||
    Boolean(fd.forwardedByAdminId) ||
    (status.includes('document validation') && isAdminDocsApproved(fd))
  )
}

export function isOpenForOfficer(r: RequestRow): boolean {
  const s = (r.status || '').toLowerCase()
  return isForwardedToOfficer(r) && !s.includes('approv') && !s.includes('reject')
}

export function isMarketplaceRequest(r: RequestRow) {
  return r.type === 'Marketplace Listing'
}
