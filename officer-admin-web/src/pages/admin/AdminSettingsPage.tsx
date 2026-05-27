import { useState } from 'react'
import { Panel } from '../../components/ui'
import { PortalLayout, adminNav } from '../../components/PortalLayout'

export default function AdminSettingsPage() {
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true)
  const [verificationEnabled, setVerificationEnabled] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
  const [saved, setSaved] = useState(false)

  const onSave = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PortalLayout
      title="System Configuration"
      subtitle="Global modules, security policies, and maintenance tools (UC-27)."
      nav={adminNav}
    >
      {saved ? <p className="banner banner--success">Configuration saved locally (demo). Wire to backend when config API is available.</p> : null}

      <div className="grid-2">
        <Panel title="Feature modules">
          <label className="toggle">
            <input
              type="checkbox"
              checked={marketplaceEnabled}
              onChange={(e) => setMarketplaceEnabled(e.target.checked)}
            />
            <span>Marketplace module enabled</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={verificationEnabled}
              onChange={(e) => setVerificationEnabled(e.target.checked)}
            />
            <span>Ownership verification enabled</span>
          </label>
          <button type="button" className="btn btn--primary" onClick={onSave}>
            Save module settings
          </button>
        </Panel>

        <Panel title="Security policies">
          <label className="field">
            <span>Session timeout (minutes)</span>
            <input
              type="number"
              min={5}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Max login attempts before lockout</span>
            <input
              type="number"
              min={3}
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn--primary" onClick={onSave}>
            Save security settings
          </button>
        </Panel>
      </div>

      <Panel title="System maintenance">
        <div className="maintenance-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => window.alert('System cache flushed (demo).')}
          >
            Flush system cache
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => window.alert('Blockchain ledger backup completed (demo).')}
          >
            Backup blockchain ledger
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setMarketplaceEnabled(true)
              setVerificationEnabled(true)
              setSessionTimeout('30')
              setMaxLoginAttempts('5')
              window.alert('Restored previous settings (demo).')
            }}
          >
            Restore previous settings
          </button>
        </div>
      </Panel>
    </PortalLayout>
  )
}
