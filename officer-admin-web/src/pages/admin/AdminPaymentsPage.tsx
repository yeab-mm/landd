import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

type Payment = {
  id: string
  transaction: string
  user: string
  amount: number
  type: string
  status: string
  date: string
}

export default function AdminPaymentsPage() {
  const { token } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [payData, statsData] = await Promise.all([
        apiFetch<{ payments: Payment[] }>('/admin/payments', token),
        apiFetch<Record<string, number>>('/admin/payments/stats', token),
      ])
      setPayments(payData.payments || [])
      setStats(statsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PortalLayout
      title="Payments & Transactions"
      subtitle="Monitor financial transactions and revenue."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Total transactions" value={stats?.totalTransactions ?? '—'} />
        <StatCard label="Completed" value={stats?.completedTransactions ?? '—'} tone="success" />
        <StatCard label="Pending" value={stats?.pendingTransactions ?? '—'} tone="warning" />
        <StatCard
          label="Total revenue (ETB)"
          value={stats?.totalAmount != null ? stats.totalAmount.toLocaleString() : '—'}
        />
      </div>

      <Panel title="Transaction log" subtitle={`${payments.length} record(s)`}>
        {loading ? (
          <p className="muted">Loading payments…</p>
        ) : payments.length === 0 ? (
          <EmptyState title="No payments recorded" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount (ETB)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.transaction}</strong>
                    </td>
                    <td>{p.user}</td>
                    <td>{p.type}</td>
                    <td>{p.amount.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{new Date(p.date).toLocaleString()}</td>
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
