import { useMemo, useState } from 'react';
import { usePlatformData } from '../../context/PlatformDataContext';

export default function OwnerAuditLogPage() {
  const { auditEvents } = usePlatformData();
  const [actorFilter, setActorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [search, setSearch] = useState('');

  const actors = useMemo(
    () => Array.from(new Set(auditEvents.map((event) => event.actor))).sort((a, b) => a.localeCompare(b)),
    [auditEvents],
  );

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditEvents.filter((event) => {
      if (actorFilter !== 'all' && event.actor !== actorFilter) return false;
      if (severityFilter !== 'all' && event.severity !== severityFilter) return false;
      if (!q) return true;
      return `${event.actor} ${event.action} ${event.target} ${event.details ?? ''}`.toLowerCase().includes(q);
    });
  }, [actorFilter, auditEvents, search, severityFilter]);

  const timeline = useMemo(
    () => filteredEvents.slice(0, 12).map((event) => ({
      id: event.id,
      start: new Date(event.timestamp).toLocaleString(),
      action: event.action,
      actor: event.actor,
      approval: event.severity === 'critical' ? 'Critical event flagged for owner review' : event.severity === 'warning' ? 'Warning event logged and monitored' : 'Informational event captured',
      outcome: event.details ?? `Target impacted: ${event.target}`,
    })),
    [filteredEvents],
  );

  const kpis = useMemo(() => {
    const critical = auditEvents.filter((event) => event.severity === 'critical').length;
    const warning = auditEvents.filter((event) => event.severity === 'warning').length;
    const info = auditEvents.filter((event) => event.severity === 'info').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = auditEvents.filter((event) => event.timestamp.slice(0, 10) === today).length;
    return { critical, warning, info, todayEvents };
  }, [auditEvents]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Audit Log</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Events Today</h3><p>{kpis.todayEvents}</p></div>
        <div className="kpi-card"><h3>Info Events</h3><p>{kpis.info}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Warnings</h3><p>{kpis.warning}</p></div>
        <div className="kpi-card kpi-red"><h3>Critical Events</h3><p>{kpis.critical}</p></div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Platform Activity Trail</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-input" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)} style={{ minWidth: 160 }}>
              <option value="all">All actors</option>
              {actors.map((actor) => (
                <option key={actor} value={actor}>{actor}</option>
              ))}
            </select>
            <select className="form-input" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as 'all' | 'info' | 'warning' | 'critical')} style={{ minWidth: 150 }}>
              <option value="all">All severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search action, target, details" style={{ minWidth: 220 }} />
          </div>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Timestamp</th>
                <th className="datatable-th">Actor</th>
                <th className="datatable-th">Action</th>
                <th className="datatable-th">Target</th>
                <th className="datatable-th">Severity</th>
                <th className="datatable-th">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.timestamp).toLocaleString()}</td>
                  <td>{row.actor}</td>
                  <td>{row.action}</td>
                  <td>{row.target}</td>
                  <td style={{ textTransform: 'capitalize' }}>{row.severity}</td>
                  <td>{row.details ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>End-to-End Action Timeline</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {timeline.map((entry) => (
            <div key={entry.id} style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{entry.action}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{entry.start} • {entry.actor}</p>
              <p style={{ margin: '6px 0 0' }}><strong>Approval:</strong> {entry.approval}</p>
              <p style={{ margin: '4px 0 0' }}><strong>Outcome:</strong> {entry.outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
