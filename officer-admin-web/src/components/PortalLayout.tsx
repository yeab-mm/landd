import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type NavItem = { to: string; label: string; end?: boolean }

export function PortalLayout({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string
  subtitle: string
  nav: NavItem[]
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">DL</span>
          <div>
            <strong>Digital Land Portal</strong>
            <small>{title}</small>
          </div>
        </div>
        <nav className="sidebar__nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <strong>{user?.fullName}</strong>
            <span>{user?.email || user?.role}</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="portal__main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        <main className="portal__content">{children}</main>
      </div>
    </div>
  )
}

export const officerNav: NavItem[] = [
  { to: '/officer', label: 'Overview', end: true },
  { to: '/officer/verification', label: 'Verification Queue' },
  { to: '/officer/transfers', label: 'Transfer Requests' },
  { to: '/officer/services', label: 'Service Applications' },
]

export const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/marketplace', label: 'Marketplace Monitor' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/reports', label: 'Reports & Audit' },
  { to: '/admin/settings', label: 'System Configuration' },
]
