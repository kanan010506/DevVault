import { useState } from 'react'
import type { MockMateSettings as SettingsType } from './types'
import { LANGUAGES } from './types'

interface Props {
  settings: SettingsType
  onSave: (settings: Partial<SettingsType>) => void
  onClose: () => void
}

function MockMateSettings({ settings, onSave, onClose }: Props) {
  const [failedInterval, setFailedInterval] = useState(settings.failed_interval)
  const [revisitingInterval, setRevisitingInterval] = useState(settings.revisiting_interval)
  const [masteredInterval, setMasteredInterval] = useState(settings.mastered_interval)
  const [preferredLanguage, setPreferredLanguage] = useState(settings.preferred_language)

  const handleSave = () => {
    onSave({
      failed_interval: failedInterval,
      revisiting_interval: revisitingInterval,
      mastered_interval: masteredInterval,
      preferred_language: preferredLanguage,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-header">
          <h2>⚙️ MockMate Settings</h2>
          <button className="mm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="mm-tab-content">
          <h3 className="mm-settings-section">Review Intervals</h3>
          <p className="mm-settings-desc">How many days until next review based on result:</p>

          <div className="mm-settings-row">
            <label className="mm-settings-label">
              🔴 Failed → review after
            </label>
            <div className="mm-settings-input-row">
              <input
                type="number"
                min={1}
                value={failedInterval}
                onChange={e => setFailedInterval(Number(e.target.value))}
                className="mm-input mm-input-small"
              />
              <span className="mm-settings-unit">days</span>
            </div>
          </div>

          <div className="mm-settings-row">
            <label className="mm-settings-label">
              🟡 Got it → review after
            </label>
            <div className="mm-settings-input-row">
              <input
                type="number"
                min={1}
                value={revisitingInterval}
                onChange={e => setRevisitingInterval(Number(e.target.value))}
                className="mm-input mm-input-small"
              />
              <span className="mm-settings-unit">days</span>
            </div>
          </div>

          <div className="mm-settings-row">
            <label className="mm-settings-label">
              🟢 Easy → review after
            </label>
            <div className="mm-settings-input-row">
              <input
                type="number"
                min={1}
                value={masteredInterval}
                onChange={e => setMasteredInterval(Number(e.target.value))}
                className="mm-input mm-input-small"
              />
              <span className="mm-settings-unit">days</span>
            </div>
          </div>

          <h3 className="mm-settings-section">Preferred Language</h3>
          <p className="mm-settings-desc">Auto-selected when logging a new problem:</p>

          <select
            value={preferredLanguage}
            onChange={e => setPreferredLanguage(e.target.value)}
            className="mm-select"
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="mm-modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}

export default MockMateSettings