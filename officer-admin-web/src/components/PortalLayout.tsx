import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type NavItem = { to: string; label: string; icon: string; end?: boolean }

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
      <div className="ambient-light ambient-light--1"></div>
      <div className="ambient-light ambient-light--2"></div>
      
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">LP</span>
          <div>
            <strong>LAND PORTAL</strong>
            <small>FEDERAL AUTHORITY</small>
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
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={logout} style={{marginTop: '1.5rem', width: '100%', borderColor: 'rgba(0, 245, 160, 0.2)', color: 'var(--primary)'}}>
            TERMINATE SESSION
          </button>
        </div>
      </aside>
      <div className="portal__main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>
        </header>
        <main className="portal__content animate-fade">
            {children}
        </main>
      </div>
    </div>
  )
}

export const officerNav: NavItem[] = [
  { to: '/officer', label: 'Monitor', icon: '📊', end: true },
  { to: '/officer/marketplace', label: 'Marketplace', icon: '🏷️' },
  { to: '/officer/verification', label: 'Field Verification', icon: '🔍' },
  { to: '/officer/transfers', label: 'Ownership Transfers', icon: '🔄' },
  { to: '/officer/services', label: 'Land Services', icon: '📋' },
]

export const adminNav: NavItem[] = [
  { to: '/admin', label: 'Command Center', icon: '🏰', end: true },
  { to: '/admin/requests', label: 'Service Triage', icon: '📥' },
  { to: '/admin/users', label: 'Personnel & Roles', icon: '👥' },
  { to: '/admin/marketplace', label: 'Marketplace', icon: '🏘️' },
  { to: '/admin/payments', label: 'Financials', icon: '💳' },
  { to: '/admin/reports', label: 'Audit & Reports', icon: '📜' },
  { to: '/admin/settings', label: 'System Config', icon: '⚙️' },
]
