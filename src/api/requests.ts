import { API_URL } from './config';

export type ServiceRequestType =
  | 'Ownership Verification'
  | 'Land Registration'
  | 'Registration Request'
  | 'Ownership Transfer'
  | 'Land Subdivision'
  | 'Land Mutation'
  | 'Zoning Change'
  | 'Land Service Application';

export async function submitServiceRequest(
  token: string,
  type: ServiceRequestType,
  body: Record<string, unknown>
): Promise<{ request: { id: string; referenceNumber: string; type: string; status: string } }> {
  const res = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Submission failed');
  }
  return data;
}

export function normalizeStatus(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  if (s === 'document validation') return 'Document Validation';
  if (s === 'under review' || s === 'pending' || s === 'submitted') return 'Under Review';
  return status || 'Under Review';
}

export function isPendingStatus(status: string): boolean {
  const s = normalizeStatus(status);
  return s === 'Under Review' || s === 'Document Validation' || s === 'Pending';
}
