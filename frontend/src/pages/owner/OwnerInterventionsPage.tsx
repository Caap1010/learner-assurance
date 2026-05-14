import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

const CASES = [
  { id: 'iv1', learner: 'Jordan Learner', cohort: 'YDP Cohort 2026-Q1', risk: 'high', status: 'open', owner: 'Maya Mentor' },
  { id: 'iv2', learner: 'Themba Nkosi', cohort: 'Learnership 2026-A', risk: 'medium', status: 'in-progress', owner: 'Mark Manager' },
  { id: 'iv3', learner: 'Lebo Maseko', cohort: 'YDP Cohort 2026-Q1', risk: 'low', status: 'resolved', owner: 'Chris Coach' },
];

export default function OwnerInterventionsPage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Interventions</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('New intervention case form opened', 'info')}>+ New Case</button>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Platform Risk Cases</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Learner</th>
                <th className="datatable-th">Cohort</th>
                <th className="datatable-th">Risk</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Assigned Owner</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((row) => (
                <tr key={row.id}>
                  <td>{row.learner}</td>
                  <td>{row.cohort}</td>
                  <td><StatusBadge status={row.risk} /></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.owner}</td>
                  <td>
                    <button className="action-btn" onClick={() => addToast(`Opened intervention ${row.id}`, 'info')}>Open</button>
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
