import { useToast } from '../../context/ToastContext';

const CONNECTORS = [
  { id: 'ig1', name: 'HRIS Connector', provider: 'Workday', status: 'Connected', lastSync: '2026-05-09 07:10' },
  { id: 'ig2', name: 'LMS Connector', provider: 'Moodle', status: 'Connected', lastSync: '2026-05-09 06:55' },
  { id: 'ig3', name: 'Storage Connector', provider: 'SharePoint', status: 'Warning', lastSync: '2026-05-08 22:30' },
  { id: 'ig4', name: 'Messaging Connector', provider: 'Twilio', status: 'Disconnected', lastSync: '2026-05-07 17:12' },
];

const SYNC_LOGS = [
  { id: 'sl1', connector: 'Workday', event: 'Delta sync completed', result: 'success', at: '2026-05-09 07:10' },
  { id: 'sl2', connector: 'SharePoint', event: 'Token refresh failed', result: 'warning', at: '2026-05-08 22:30' },
  { id: 'sl3', connector: 'Twilio', event: 'Webhook signature mismatch', result: 'error', at: '2026-05-07 17:12' },
];

export default function OwnerIntegrationsPage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Integrations</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Integration wizard opened', 'info')}>+ Add Integration</button>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Connected Systems</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Connector</th>
                <th className="datatable-th">Provider</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Last Sync</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CONNECTORS.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.provider}</td>
                  <td>{row.status}</td>
                  <td>{row.lastSync}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => addToast(`${row.name} synced`, 'success')}>Sync</button>
                      <button className="action-btn" onClick={() => addToast(`${row.name} settings opened`, 'info')}>Configure</button>
                      <button className="action-btn" onClick={() => addToast(`Retry policy updated for ${row.name}`, 'info')}>Retry Policy</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Integration Health Monitor</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {CONNECTORS.map((connector) => (
            <div key={connector.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{connector.name}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Status: {connector.status} • Last sync: {connector.lastSync}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Sync & Retry Logs</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Timestamp</th>
                <th className="datatable-th">Connector</th>
                <th className="datatable-th">Event</th>
                <th className="datatable-th">Result</th>
              </tr>
            </thead>
            <tbody>
              {SYNC_LOGS.map((log) => (
                <tr key={log.id}>
                  <td>{log.at}</td>
                  <td>{log.connector}</td>
                  <td>{log.event}</td>
                  <td style={{ textTransform: 'capitalize' }}>{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
