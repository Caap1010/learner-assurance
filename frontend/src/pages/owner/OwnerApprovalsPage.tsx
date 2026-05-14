import { useToast } from '../../context/ToastContext';

const QUEUE = [
  { id: 'a1', item: 'Role upgrade: coach -> manager', requester: 'Alex Admin', submitted: '2026-05-08 10:44', priority: 'High' },
  { id: 'a2', item: 'Permission change: Export executive report', requester: 'Naledi Khoza', submitted: '2026-05-08 14:22', priority: 'Medium' },
  { id: 'a3', item: 'Cohort transfer request (YDP 2026-Q1)', requester: 'Ayesha Patel', submitted: '2026-05-09 08:11', priority: 'High' },
  { id: 'a4', item: 'User invite approval: institute supervisor', requester: 'Mark Manager', submitted: '2026-05-09 09:29', priority: 'Low' },
];

export default function OwnerApprovalsPage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Approvals</h1>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Pending Approval Queue</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Request</th>
                <th className="datatable-th">Requester</th>
                <th className="datatable-th">Submitted</th>
                <th className="datatable-th">Priority</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {QUEUE.map((row) => (
                <tr key={row.id}>
                  <td>{row.item}</td>
                  <td>{row.requester}</td>
                  <td>{row.submitted}</td>
                  <td>{row.priority}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => addToast('Approval granted', 'success')}>Approve</button>
                      <button className="action-btn action-btn-danger" onClick={() => addToast('Request rejected', 'error')}>Reject</button>
                      <button className="action-btn" onClick={() => addToast('Marked for review', 'warning')}>Need Review</button>
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
