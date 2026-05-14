import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function OwnerSettingsPage() {
  const { addToast } = useToast();
  const [orgName, setOrgName] = useState('Learner Assurance');
  const [alertThreshold, setAlertThreshold] = useState('85');
  const [allowSelfService, setAllowSelfService] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'owner:compliance': true,
    'owner:risk': true,
    'admin:users': true,
    'admin:permissions': true,
    'coach:interventions': true,
    'mentor:feedback': true,
    'manager:attendance': true,
    'institute:evidence': true,
  });

  function saveSettings() {
    addToast('Owner settings saved.', 'success');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Platform Configuration</h2>
        <div style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
          <label className="form-label">
            <span>Organisation Name</span>
            <input className="form-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </label>

          <label className="form-label">
            <span>Risk Alert Threshold (%)</span>
            <input type="number" min={0} max={100} className="form-input" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} />
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={allowSelfService} onChange={(e) => setAllowSelfService(e.target.checked)} />
            <span>Allow self-service user invites</span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
            <span>Send weekly executive digest</span>
          </label>

          <div>
            <button className="primary-button" onClick={saveSettings}>Save Settings</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Notification Center Preferences</h2>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Configure alert streams per role and module to reduce noise and escalate only critical events.
        </p>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Role</th>
                <th className="datatable-th">Module</th>
                <th className="datatable-th">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(prefs).map((key) => {
                const [role, module] = key.split(':');
                return (
                  <tr key={key}>
                    <td style={{ textTransform: 'capitalize' }}>{role}</td>
                    <td style={{ textTransform: 'capitalize' }}>{module}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={(e) => setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="primary-button" onClick={() => addToast('Notification preferences saved.', 'success')}>Save Notification Preferences</button>
        </div>
      </div>
    </div>
  );
}
