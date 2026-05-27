import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

type Listing = {
  id: string
  title: string
  status: string
  type: string
  area: string
  location: string
  seller: string
  verified: boolean
  postedDate: string
}

export default function AdminMarketplacePage() {
  const { token } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [listData, statsData] = await Promise.all([
        apiFetch<{ listings: Listing[] }>('/admin/marketplace/listings', token),
        apiFetch<Record<string, number>>('/admin/marketplace/stats', token),
      ])
      setListings(listData.listings || [])
      setStats(statsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PortalLayout
      title="Marketplace Monitor"
      subtitle="Oversee listings, spot suspicious activity, and ensure compliance (UC-25)."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid stat-grid--3">
        <StatCard label="Total listings" value={stats?.totalListings ?? '—'} />
        <StatCard label="Active (verified)" value={stats?.activeListings ?? '—'} tone="success" />
        <StatCard label="Pending review" value={stats?.pendingListings ?? '—'} tone="warning" />
      </div>

      <Panel title="Land listings" subtitle={`${listings.length} listing(s)`}>
        {loading ? (
          <p className="muted">Loading listings…</p>
        ) : listings.length === 0 ? (
          <EmptyState title="No marketplace listings" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Seller</th>
                  <th>Location</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.title}</strong>
                      <div className="muted">{l.type}</div>
                    </td>
                    <td>{l.seller}</td>
                    <td>{l.location}</td>
                    <td>{l.area}</td>
                    <td>
                      <StatusBadge status={l.verified ? 'Verified' : 'Pending'} />
                    </td>
                    <td>{new Date(l.postedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PortalLayout>
  )
}
