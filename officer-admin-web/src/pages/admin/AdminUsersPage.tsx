import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../api/client'
import { EmptyState, Panel, StatusBadge } from '../../components/ui'
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

  const filtered = useMemo(() => users, [users])

  const updateUser = async (id: string, body: Record<string, string>) => {
    await apiFetch(`/admin/users/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    await load()
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
      title="User Management"
      subtitle="Manage user accounts and assign roles (UC-24)."
      nav={adminNav}
    >
      {error ? <p className="banner banner--error">{error}</p> : null}

      <Panel
        title="All users"
        subtitle={`${filtered.length} account(s)`}
        actions={
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
              Add user
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="muted">Loading users…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Properties</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.fullName}</strong>
                      <div className="muted">{u.phone || '—'}</div>
                    </td>
                    <td>{u.email || '—'}</td>
                    <td>
                      {u.role !== 'Admin' ? (
                        <select
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
                        u.role
                      )}
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>{u.properties ?? 0}</td>
                    <td className="table-actions">
                      {u.role !== 'Admin' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() =>
                              updateUser(u.id, {
                                name: u.fullName,
                                role: u.role === 'Citizen' ? 'Officer' : 'Citizen',
                                status: u.status,
                              })
                            }
                          >
                            {u.role === 'Citizen' ? 'Promote' : 'Demote'}
                          </button>
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
                            Suspend
                          </button>
                        </>
                      ) : (
                        <span className="muted">Protected</span>
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
          <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
            <header className="modal__header">
              <h2>Add user</h2>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>
                Close
              </button>
            </header>
            <form className="modal__body" onSubmit={onAddUser}>
              <label className="field">
                <span>Full name</span>
                <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              </label>
              <label className="field">
                <span>Email</span>
                <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </label>
              <label className="field">
                <span>Fayda / Kebele ID</span>
                <input value={newUser.kebeleId} onChange={(e) => setNewUser({ ...newUser, kebeleId: e.target.value })} />
              </label>
              <label className="field">
                <span>Role</span>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Temporary password</span>
                <input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </label>
              <footer className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Create account
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </PortalLayout>
  )
}
