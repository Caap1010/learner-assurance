import { useToast } from '../../context/ToastContext';

const PROGRAMMES = [
  { id: 'p1', name: 'Business Administration NQF4', track: 'Learnership', duration: '12 months', milestones: 8, evidenceItems: 15, version: 'v4.2', migrationRule: 'Auto-migrate if < 40% complete' },
  { id: 'p2', name: 'Digital Sales Readiness', track: 'YDP', duration: '9 months', milestones: 6, evidenceItems: 12, version: 'v3.8', migrationRule: 'Manual approval only' },
  { id: 'p3', name: 'Warehouse Operations', track: 'Learnership', duration: '12 months', milestones: 9, evidenceItems: 16, version: 'v2.5', migrationRule: 'Auto-migrate with evidence remap' },
];

export default function OwnerProgrammesPage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Programmes</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Programme template creator opened', 'info')}>+ New Template</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Templates</h3><p>{PROGRAMMES.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Active Learnership Tracks</h3><p>5</p></div>
        <div className="kpi-card"><h3>Active YDP Tracks</h3><p>4</p></div>
        <div className="kpi-card kpi-yellow"><h3>Templates Due Review</h3><p>2</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Catalog Versioning & Migration Rules</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {PROGRAMMES.map((programme) => (
            <div key={programme.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{programme.name} • {programme.version}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{programme.migrationRule}</p>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="action-btn" onClick={() => addToast(`Published new version for ${programme.name}`, 'success')}>Publish New Version</button>
                <button className="action-btn" onClick={() => addToast(`Previewed learner migration for ${programme.name}`, 'info')}>Preview Migration Impact</button>
                <button className="action-btn" onClick={() => addToast(`Migration rules edited for ${programme.name}`, 'info')}>Edit Migration Rules</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Programme Templates</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Programme</th>
                <th className="datatable-th">Track</th>
                <th className="datatable-th">Duration</th>
                <th className="datatable-th">Version</th>
                <th className="datatable-th">Milestones</th>
                <th className="datatable-th">Evidence Checklist</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMMES.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.track}</td>
                  <td>{row.duration}</td>
                  <td>{row.version}</td>
                  <td>{row.milestones}</td>
                  <td>{row.evidenceItems}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => addToast(`Editing ${row.name}`, 'info')}>Edit</button>
                      <button className="action-btn" onClick={() => addToast(`Duplicated ${row.name}`, 'success')}>Clone</button>
                      <button className="action-btn" onClick={() => addToast(`${row.name} exported`, 'success')}>Export</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
