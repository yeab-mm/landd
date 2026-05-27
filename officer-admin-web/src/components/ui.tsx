import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warning' | 'success' | 'danger' | 'info'
}) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  let cls = 'badge badge--pending'
  if (s.includes('approv')) cls = 'badge badge--approved'
  else if (s.includes('reject')) cls = 'badge badge--rejected'
  else if (s.includes('valid')) cls = 'badge badge--validation'
  else if (s.includes('review')) cls = 'badge badge--review'
  else if (s.includes('hold')) cls = 'badge badge--hold'
  return <span className={cls}>{status}</span>
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
    </div>
  )
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="panel__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="panel__actions">{actions}</div> : null}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  )
}
