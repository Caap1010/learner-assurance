const EVENTS = [
  { id: 'lg1', when: '2026-05-09 09:40', actor: 'Platform Owner', action: 'Updated permission template', target: 'Manager Role' },
  { id: 'lg2', when: '2026-05-09 09:14', actor: 'Alex Admin', action: 'Invited user', target: 'mentor@learnerassurance.com' },
  { id: 'lg3', when: '2026-05-09 08:58', actor: 'Mark Manager', action: 'Approved attendance batch', target: 'Learnership 2026-A' },
  { id: 'lg4', when: '2026-05-09 08:23', actor: 'Maya Mentor', action: 'Opened intervention', target: 'Jordan Learner' },
  { id: 'lg5', when: '2026-05-08 17:05', actor: 'Institute Admin', action: 'Uploaded evidence pack', target: 'YDP Cohort 2026-Q1' },
];

const TIMELINE = [
  {
    id: 't1',
    start: '2026-05-08 16:42',
    action: 'Role change requested',
    actor: 'Alex Admin',
    approval: 'Approved by Platform Owner at 2026-05-08 17:05',
    outcome: 'Coach promoted to Manager, access policy refreshed',
  },
  {
    id: 't2',
    start: '2026-05-09 07:20',
    action: 'Temporary grant requested',
    actor: 'Programme Ops',
    approval: 'Rejected by Platform Owner at 2026-05-09 07:40',
    outcome: 'Grant denied, alternative support ticket created',
  },
  {
    id: 't3',
    start: '2026-05-09 08:11',
    action: 'Evidence gap escalation',
    actor: 'QA Office',
    approval: 'Escalation approved by Partner Success at 2026-05-09 08:22',
    outcome: 'Remediation task pack assigned to institute team',
  },
];

export default function OwnerAuditLogPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Audit Log</h1>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Platform Activity Trail</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Timestamp</th>
                <th className="datatable-th">Actor</th>
                <th className="datatable-th">Action</th>
                <th className="datatable-th">Target</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((row) => (
                <tr key={row.id}>
                  <td>{row.when}</td>
                  <td>{row.actor}</td>
                  <td>{row.action}</td>
                  <td>{row.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>End-to-End Action Timeline</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {TIMELINE.map((entry) => (
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
