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

  const toggleVerification = async (id: string, current: boolean) => {
    try {
        // Technically this might be a custom endpoint or update land
        // I'll assume we update the listing status
        await apiFetch(`/admin/marketplace/listings/${id}/verify`, token, {
            method: 'POST',
            body: JSON.stringify({ verified: !current }),
        })
        await load()
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed')
    }
  }

  const removeListing = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove listing "${title}"?`)) return
    try {
        await apiFetch(`/admin/marketplace/listings/${id}`, token, { method: 'DELETE' })
        await load()
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Removal failed')
    }
  }

  return (
    <PortalLayout
      title="Marketplace Watch"
      subtitle="Ensuring integrity and compliance in public land listings."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Live Listings" value={stats?.activeListings ?? 0} tone="success" />
        <StatCard label="Pending Approval" value={stats?.pendingListings ?? 0} tone="warning" />
        <StatCard label="Gross Volume (est)" value="N/A" />
        <StatCard label="Flags/Reports" value="0" tone="danger" />
      </div>

      <Panel title="Active Listings Catalog" subtitle="Global view of all land currently on the market"
        actions={
            <button className="btn btn--outline btn--sm" onClick={load} disabled={loading}>
                Refresh Feed
            </button>
        }
      >
        {loading ? (
          <p className="muted">Scanning marketplace database...</p>
        ) : listings.length === 0 ? (
          <EmptyState title="Marketplace is quiet" message="No land plots are currently listed for sale." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Legal Owner / Seller</th>
                  <th>Regional Location</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div>
                        <strong>{l.title}</strong>
                        <div className="muted">{l.area} · {l.type}</div>
                      </div>
                    </td>
                    <td>
                        <div>{l.seller}</div>
                        <small className="muted">Joined {new Date(l.postedDate).toLocaleDateString()}</small>
                    </td>
                    <td>{l.location}</td>
                    <td>
                      <StatusBadge status={l.verified ? 'Verified' : 'Unverified'} />
                    </td>
                    <td className="table-actions">
                        <button 
                            className={`btn btn--sm ${l.verified ? 'btn--outline' : 'btn--primary'}`}
                            onClick={() => toggleVerification(l.id, l.verified)}
                        >
                            {l.verified ? 'Revoke' : 'Certify'}
                        </button>
                        <button 
                            className="btn btn--danger btn--sm"
                            onClick={() => removeListing(l.id, l.title)}
                        >
                            Takedown
                        </button>
                    </td>
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
