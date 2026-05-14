import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

const COMPLIANCE_ITEMS = [
  { id: 'cp1', area: 'Attendance SLA', owner: 'Institute Ops', due: '2026-05-15', status: 'on-track' },
  { id: 'cp2', area: 'Evidence Completeness', owner: 'Programme Team', due: '2026-05-12', status: 'at-risk' },
  { id: 'cp3', area: 'Quarterly Audit Sampling', owner: 'QA Office', due: '2026-05-10', status: 'escalated' },
  { id: 'cp4', area: 'Appraisal Closeout', owner: 'Partner Success', due: '2026-05-21', status: 'on-track' },
];

const GAP_DETECTOR = [
  { id: 'g1', cohort: 'YDP Cohort 2026-Q1', missingEvidence: 12, missingAppraisals: 4, severity: 'high' },
  { id: 'g2', cohort: 'Learnership 2026-A', missingEvidence: 4, missingAppraisals: 1, severity: 'medium' },
  { id: 'g3', cohort: 'Learnership 2025-B', missingEvidence: 2, missingAppraisals: 0, severity: 'low' },
];

const HEATMAP_ROWS = [
  { area: 'Attendance', institute: 92, employer: 95, mentor: 88 },
  { area: 'Evidence', institute: 85, employer: 90, mentor: 82 },
  { area: 'Interventions', institute: 80, employer: 84, mentor: 78 },
  { area: 'Appraisals', institute: 87, employer: 89, mentor: 86 },
];

function scoreColor(value: number) {
  if (value >= 90) return 'color-mix(in srgb, #10b981 26%, var(--surface))';
  if (value >= 82) return 'color-mix(in srgb, #f59e0b 26%, var(--surface))';
  return 'color-mix(in srgb, #dc2626 24%, var(--surface))';
}

export default function OwnerCompliancePage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Compliance</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>SLA Compliance</h3><p>97.4%</p></div>
        <div className="kpi-card"><h3>Open Audits</h3><p>6</p></div>
        <div className="kpi-card kpi-yellow"><h3>Pending Evidence Items</h3><p>39</p></div>
        <div className="kpi-card kpi-red"><h3>Escalations</h3><p>4</p></div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Compliance Worklist</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Control Area</th>
                <th className="datatable-th">Owner</th>
                <th className="datatable-th">Due Date</th>
                <th className="datatable-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_ITEMS.map((row) => (
                <tr key={row.id}>
                  <td>{row.area}</td>
                  <td>{row.owner}</td>
                  <td>{row.due}</td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Evidence Gap Detector</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {GAP_DETECTOR.map((gap) => (
            <div key={gap.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{gap.cohort}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Missing evidence: {gap.missingEvidence} • Missing appraisals: {gap.missingAppraisals} • Severity: {gap.severity}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button className="action-btn" onClick={() => addToast(`Opened evidence checklist for ${gap.cohort}`, 'info')}>Open Checklist</button>
                <button className="action-btn" onClick={() => addToast(`Remediation task pack created for ${gap.cohort}`, 'success')}>Create Remediation Tasks</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>SLA & Risk Heatmap</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Control Area</th>
                <th className="datatable-th">Institute</th>
                <th className="datatable-th">Employer</th>
                <th className="datatable-th">Mentor</th>
              </tr>
            </thead>
            <tbody>
              {HEATMAP_ROWS.map((row) => (
                <tr key={row.area}>
                  <td style={{ fontWeight: 600 }}>{row.area}</td>
                  <td style={{ background: scoreColor(row.institute) }}>{row.institute}%</td>
                  <td style={{ background: scoreColor(row.employer) }}>{row.employer}%</td>
                  <td style={{ background: scoreColor(row.mentor) }}>{row.mentor}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
