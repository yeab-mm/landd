import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { EmptyState, Panel, StatCard, StatusBadge } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'
import { useAuth } from '../../context/AuthContext'

type AdminUser = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  status: string
  properties?: number
  joinedDate?: string
}

const ROLES = ['Citizen', 'Officer', 'Admin']

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    kebeleId: '',
    role: 'Citizen',
    password: 'ChangeMe@123',
  })

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const q = new URLSearchParams()
      if (search) q.set('search', search)
      if (roleFilter !== 'all') q.set('role', roleFilter)
      const data = await apiFetch<{ users: AdminUser[] }>(
        `/admin/users?${q.toString()}`,
        token,
      )
      setUsers(data.users || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [token, search, roleFilter])

  useEffect(() => {
    const t = window.setTimeout(load, 300)
    return () => window.clearTimeout(t)
  }, [load])

  const updateUser = async (id: string, body: Record<string, string>) => {
    try {
        await apiFetch(`/admin/users/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
        await load()
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const resetPassword = async (id: string, name: string) => {
    const newPass = window.prompt(`Set new password for ${name}:`, 'ChangeMe@123')
    if (newPass === null) return
    try {
        await apiFetch(`/admin/users/${id}/reset-password`, token, {
            method: 'POST',
            body: JSON.stringify({ newPassword: newPass }),
        })
        alert('Password reset successfully.')
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Reset failed')
    }
  }

  const onAddUser = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/admin/users', token, {
        method: 'POST',
        body: JSON.stringify(newUser),
      })
      setShowAdd(false)
      setNewUser({
        name: '',
        email: '',
        phone: '',
        kebeleId: '',
        role: 'Citizen',
        password: 'ChangeMe@123',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  return (
    <PortalLayout
      title="User Accounts"
      subtitle="Administrative control over all portal participants."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <div className="stat-grid stat-grid--3">
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Active Officers" value={users.filter(u => u.role === 'Officer').length} tone="info" />
          <StatCard label="Admins" value={users.filter(u => u.role === 'Admin').length} tone="warning" />
      </div>

      <Panel
        title="Directory"
        subtitle="Manage roles, connectivity, and access status"
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Filter by name/ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search"
            />
            <select className="select-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
              + Add New
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="muted">Refreshing user list...</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" message="Try adjusting your filters or search terms." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Contact Info</th>
                  <th>Core Role</th>
                  <th>System Status</th>
                  <th>Auth</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex-col">
                        <strong>{u.fullName}</strong>
                        <small className="muted">User ID: {u.id.substring(0,8)}</small>
                      </div>
                    </td>
                    <td>
                      <div>{u.email || 'No email provided'}</div>
                      <div className="muted">{u.phone || 'No phone'}</div>
                    </td>
                    <td>
                      {u.role !== 'Admin' ? (
                        <select
                          className="select-minimal"
                          value={u.role}
                          onChange={(e) =>
                            updateUser(u.id, { name: u.fullName, role: e.target.value, status: u.status })
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge--warning">Administrator</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => resetPassword(u.id, u.fullName)}>
                        Reset Pass
                      </button>
                    </td>
                    <td className="table-actions">
                      {u.role !== 'Admin' && (
                        <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => {
                              if (!window.confirm(`Suspend ${u.fullName}?`)) return
                              updateUser(u.id, {
                                name: u.fullName,
                                role: u.role,
                                status: 'Suspended',
                              })
                            }}
                          >
                            Block
                          </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {showAdd ? (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal__header">
              <h2>Register New Personnel</h2>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>
                ✕
              </button>
            </header>
            <form className="modal__body" onSubmit={onAddUser}>
              <div className="grid-2">
                <label className="field">
                    <span>Legal Full Name</span>
                    <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                </label>
                <label className="field">
                    <span>Email Address</span>
                    <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </label>
              </div>
              <div className="grid-2">
                <label className="field">
                    <span>Phone Number</span>
                    <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                </label>
                <label className="field">
                    <span>Internal ID / Fayda</span>
                    <input value={newUser.kebeleId} onChange={(e) => setNewUser({ ...newUser, kebeleId: e.target.value })} />
                </label>
              </div>
              <div className="grid-2">
                <label className="field">
                    <span>Assigned Department Role</span>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>
                        {r}
                        </option>
                    ))}
                    </select>
                </label>
                <label className="field">
                    <span>Initial Password</span>
                    <input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </label>
              </div>
              <footer className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Provision Account
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </PortalLayout>
  )
}
