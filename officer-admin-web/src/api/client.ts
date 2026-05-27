import { API_BASE } from '../config'

export async function apiFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  }
  return data as T
}

export async function downloadWithAuth(path: string, token: string, filename: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Download failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type DashboardStatsResponse = {
  stats: {
    totalUsers: number
    totalLands: number
    totalRequests: number
    totalPayments: number
    completedPayments: number
  }
  recentActivities: { id: string; description: string; timestamp: string; type: string }[]
}

export type RequestRow = {
  id: string
  referenceNumber: string
  type: string
  status: string
  formData: unknown
  createdAt: string
  user?: { fullName?: string; email?: string }
  ownerName?: string
}

export function parseFormData(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return raw as Record<string, unknown>
}

export function requestApplicant(r: RequestRow): string {
  const fd = parseFormData(r.formData)
  return (
    (fd.fullName as string) ||
    (fd.ownerName as string) ||
    r.ownerName ||
    r.user?.fullName ||
    'Unknown'
  )
}
