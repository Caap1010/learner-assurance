import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { IntegrationConnector, IntegrationStatus } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

type IntegrationForm = {
  name: string;
  provider: string;
  endpoint: string;
  syncMode: 'realtime' | 'scheduled' | 'manual';
  owner: string;
  retryPolicy: string;
  notes: string;
};

const EMPTY_FORM: IntegrationForm = {
  name: '',
  provider: '',
  endpoint: '',
  syncMode: 'scheduled',
  owner: 'Platform Owner',
  retryPolicy: '3 attempts with 10m backoff',
  notes: '',
};

function statusToBadge(status: IntegrationStatus) {
  if (status === 'connected') return 'connected';
  if (status === 'syncing') return 'syncing';
  if (status === 'warning') return 'warning';
  if (status === 'failed') return 'failed';
  return 'disconnected';
}

export default function OwnerIntegrationsPage() {
  const { addToast } = useToast();
  const {
    integrationConnectors,
    integrationLogs,
    addIntegrationConnector,
    updateIntegrationConnector,
    syncIntegrationConnector,
    retryIntegrationConnector,
    updateIntegrationConnectorStatus,
  } = usePlatformData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IntegrationStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IntegrationForm>(EMPTY_FORM);

  const filteredConnectors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrationConnectors.filter((connector) => {
      if (statusFilter !== 'all' && connector.status !== statusFilter) return false;
      if (!q) return true;
      return `${connector.name} ${connector.provider} ${connector.endpoint} ${connector.owner} ${connector.notes}`.toLowerCase().includes(q);
    });
  }, [integrationConnectors, query, statusFilter]);

  const kpis = useMemo(() => {
    const connected = integrationConnectors.filter((connector) => connector.status === 'connected').length;
    const syncing = integrationConnectors.filter((connector) => connector.status === 'syncing').length;
    const warning = integrationConnectors.filter((connector) => connector.status === 'warning').length;
    const failed = integrationConnectors.filter((connector) => connector.status === 'failed' || connector.status === 'disconnected').length;
    return { connected, syncing, warning, failed };
  }, [integrationConnectors]);

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(connector: IntegrationConnector) {
    setEditingId(connector.id);
    setForm({
      name: connector.name,
      provider: connector.provider,
      endpoint: connector.endpoint,
      syncMode: connector.syncMode,
      owner: connector.owner,
      retryPolicy: connector.retryPolicy,
      notes: connector.notes,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function saveIntegration() {
    const name = form.name.trim();
    const provider = form.provider.trim();
    const endpoint = form.endpoint.trim();
    const owner = form.owner.trim();
    if (name.length < 3 || provider.length < 3 || endpoint.length < 3 || owner.length < 3) {
      addToast('Name, provider, endpoint, and owner must be at least 3 characters.', 'warning');
      return;
    }
    if (editingId) {
      updateIntegrationConnector(editingId, {
        name,
        provider,
        endpoint,
        syncMode: form.syncMode,
        owner,
        retryPolicy: form.retryPolicy.trim() || 'Manual retry only',
        notes: form.notes.trim(),
      });
      addToast('Integration configuration updated.', 'success');
    } else {
      addIntegrationConnector({
        name,
        provider,
        endpoint,
        syncMode: form.syncMode,
        owner,
        retryPolicy: form.retryPolicy.trim() || 'Manual retry only',
        notes: form.notes.trim(),
        status: 'disconnected',
      });
      addToast('Integration connector created.', 'success');
    }
    closeModal();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Integrations</h1>
        </div>
        <button className="primary-button" onClick={openCreateModal}>+ Add Integration</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>Connected</h3><p>{kpis.connected}</p></div>
        <div className="kpi-card"><h3>Syncing</h3><p>{kpis.syncing}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Warning</h3><p>{kpis.warning}</p></div>
        <div className="kpi-card kpi-red"><h3>Failed / Disconnected</h3><p>{kpis.failed}</p></div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Connected Systems</h2>
          <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | IntegrationStatus)} style={{ minWidth: 160 }}>
            <option value="all">All statuses</option>
            <option value="connected">Connected</option>
            <option value="syncing">Syncing</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </div>
        <input
          className="form-input"
          placeholder="Search connector, provider, owner, or endpoint"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Connector</th>
                <th className="datatable-th">Provider</th>
                <th className="datatable-th">Endpoint</th>
                <th className="datatable-th">Sync Mode</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Last Sync</th>
                <th className="datatable-th">Retry Policy</th>
                <th className="datatable-th">Owner</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConnectors.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.provider}</td>
                  <td>{row.endpoint}</td>
                  <td style={{ textTransform: 'capitalize' }}>{row.syncMode}</td>
                  <td><StatusBadge status={statusToBadge(row.status)} /></td>
                  <td>{row.lastSync}</td>
                  <td>{row.retryPolicy}</td>
                  <td>{row.owner}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => syncIntegrationConnector(row.id)}>Sync</button>
                      <button className="action-btn" onClick={() => retryIntegrationConnector(row.id)}>Retry</button>
                      <button className="action-btn" onClick={() => openEditModal(row)}>Configure</button>
                      <button className="action-btn" onClick={() => updateIntegrationConnectorStatus(row.id, row.status === 'connected' ? 'warning' : 'connected')}>Toggle Health</button>
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
          {filteredConnectors.map((connector) => (
            <div key={connector.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{connector.name}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Status: {connector.status} • Last sync: {new Date(connector.lastSync).toLocaleString()} • Retry: {connector.retryPolicy}
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
              {integrationLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.at).toLocaleString()}</td>
                  <td>{log.connectorName}</td>
                  <td>{log.event}</td>
                  <td style={{ textTransform: 'capitalize' }}>{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Configure Integration' : 'Add Integration'}
          onClose={closeModal}
          footer={(
            <>
              <button className="secondary-button" onClick={closeModal}>Cancel</button>
              <button className="primary-button" onClick={saveIntegration}>{editingId ? 'Save Integration' : 'Create Integration'}</button>
            </>
          )}
        >
          <label className="form-label">
            Name
            <input className="form-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Provider
              <input className="form-input" value={form.provider} onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))} />
            </label>
            <label className="form-label">
              Sync mode
              <select className="form-input" value={form.syncMode} onChange={(event) => setForm((prev) => ({ ...prev, syncMode: event.target.value as IntegrationForm['syncMode'] }))}>
                <option value="realtime">Realtime</option>
                <option value="scheduled">Scheduled</option>
                <option value="manual">Manual</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            Endpoint
            <input className="form-input" value={form.endpoint} onChange={(event) => setForm((prev) => ({ ...prev, endpoint: event.target.value }))} placeholder="api/path or webhook URL" />
          </label>
          <label className="form-label">
            Owner
            <input className="form-input" value={form.owner} onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))} />
          </label>
          <label className="form-label">
            Retry policy
            <input className="form-input" value={form.retryPolicy} onChange={(event) => setForm((prev) => ({ ...prev, retryPolicy: event.target.value }))} />
          </label>
          <label className="form-label">
            Notes
            <textarea className="form-input" rows={4} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Describe sync scope, credentials, and downstream impact." />
          </label>
        </Modal>
      )}
    </div>
  );
}
