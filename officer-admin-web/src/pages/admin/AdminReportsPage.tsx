import { useCallback, useEffect, useState } from 'react'
import { apiFetch, downloadWithAuth } from '../../api/client'
import { Panel, StatCard } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminReportsPage() {
  const { token } = useAuth()
  const [userStats, setUserStats] = useState<Record<string, number> | null>(null)
  const [verificationStats, setVerificationStats] = useState<Record<string, number> | null>(null)
  const [paymentStats, setPaymentStats] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    try {
      const [users, verifications, payments] = await Promise.all([
        apiFetch<Record<string, number>>('/admin/users/stats/summary', token),
        apiFetch<Record<string, number>>('/admin/verifications/stats/summary', token),
        apiFetch<Record<string, number>>('/admin/payments/stats', token),
      ])
      setUserStats(users)
      setVerificationStats(verifications)
      setPaymentStats(payments)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data')
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const exportCsv = async (kind: 'users' | 'verifications') => {
    if (!token) return
    setExporting(kind)
    setError('')
    try {
      const path =
        kind === 'users' ? '/admin/users/export/csv' : '/admin/verifications/export/csv'
      const filename = kind === 'users' ? 'users.csv' : 'verifications.csv'
      await downloadWithAuth(path, token, filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <PortalLayout
      title="Reports & Analytics"
      subtitle="Operational summaries, verification statistics, and audit exports."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard label="Total users" value={userStats?.totalUsers ?? '—'} />
        <StatCard label="Verifications" value={verificationStats?.total ?? '—'} tone="info" />
        <StatCard label="Approved verifications" value={verificationStats?.approved ?? '—'} tone="success" />
        <StatCard label="Transactions" value={paymentStats?.totalTransactions ?? '—'} tone="warning" />
      </div>

      <div className="grid-2">
        <Panel title="User activity summary">
          <ul className="report-list">
            <li>
              <span>Active users</span>
              <strong>{userStats?.activeUsers ?? '—'}</strong>
            </li>
            <li>
              <span>Inactive / pending</span>
              <strong>
                {(userStats?.inactiveUsers ?? 0) + (userStats?.pendingUsers ?? 0) || '—'}
              </strong>
            </li>
            <li>
              <span>Officers</span>
              <strong>{userStats?.officers ?? '—'}</strong>
            </li>
            <li>
              <span>Citizens</span>
              <strong>{userStats?.citizens ?? '—'}</strong>
            </li>
          </ul>
          <button
            type="button"
            className="btn btn--primary"
            disabled={exporting === 'users'}
            onClick={() => exportCsv('users')}
          >
            {exporting === 'users' ? 'Exporting…' : 'Export users (CSV)'}
          </button>
        </Panel>

        <Panel title="Verification & transaction summary">
          <ul className="report-list">
            <li>
              <span>Pending verifications</span>
              <strong>{verificationStats?.pending ?? '—'}</strong>
            </li>
            <li>
              <span>Rejected verifications</span>
              <strong>{verificationStats?.rejected ?? '—'}</strong>
            </li>
            <li>
              <span>Completed payments</span>
              <strong>{paymentStats?.completedTransactions ?? '—'}</strong>
            </li>
            <li>
              <span>Total revenue (ETB)</span>
              <strong>
                {paymentStats?.totalAmount != null
                  ? paymentStats.totalAmount.toLocaleString()
                  : '—'}
              </strong>
            </li>
          </ul>
          <button
            type="button"
            className="btn btn--primary"
            disabled={exporting === 'verifications'}
            onClick={() => exportCsv('verifications')}
          >
            {exporting === 'verifications' ? 'Exporting…' : 'Export verifications (CSV)'}
          </button>
        </Panel>
      </div>

      <Panel title="Audit trail" subtitle="Critical actions are logged server-side per FREQ-20.">
        <p className="muted">
          Use CSV exports for compliance reporting. Scheduled email delivery and PDF export can be
          connected to the notification service in a future release.
        </p>
      </Panel>
    </PortalLayout>
  )
}
