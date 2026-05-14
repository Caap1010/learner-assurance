import { useState } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { GOALS, LEARNERS } from '../../data/mockData';

export default function GoalsPage() {
  const { addToast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'list' | 'roadmap'>('roadmap');

  const overdue = GOALS.filter(g => g.status === 'overdue');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Development</p>
          <h1 className="page-title">Goals</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="tab-bar" style={{ margin: 0 }}>
            <button className={`tab-btn ${view === 'roadmap' ? 'tab-btn-active' : ''}`} onClick={() => setView('roadmap')}>Roadmap</button>
            <button className={`tab-btn ${view === 'list' ? 'tab-btn-active' : ''}`} onClick={() => setView('list')}>List</button>
          </div>
          <button className="primary-button" onClick={() => setAddOpen(true)}>+ Add Goal</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="alert-banner">
          ⚠ {overdue.length} goal{overdue.length > 1 ? 's are' : ' is'} overdue: {overdue.map(g => g.title).join(', ')}
        </div>
      )}

      {view === 'roadmap' ? (
        <div className="card">
          <h2 className="card-title">Goals Roadmap</h2>
          <div className="goals-roadmap">
            {GOALS.map(g => (
              <div key={g.id} className={`roadmap-item roadmap-${g.status}`}>
                <div className="roadmap-top">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.title}</span>
                  <StatusBadge status={g.status} />
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${g.progress}%` }} /></div>
                <div className="roadmap-meta">
                  <span>{g.progress}% complete</span>
                  <span>Due {g.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Title</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Progress</th>
                <th className="datatable-th">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {GOALS.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500 }}>{g.title}</td>
                  <td><StatusBadge status={g.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="progress-bar-bg" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${g.progress}%` }} /></div>
                      <span style={{ fontSize: '0.8rem', width: 36, textAlign: 'right' }}>{g.progress}%</span>
                    </div>
                  </td>
                  <td>{g.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <Modal
          title="Add Goal"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setAddOpen(false); addToast('Goal added', 'success'); }}>Save</button>
              <button className="secondary-button" onClick={() => setAddOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Goal title</span>
            <input type="text" className="form-input" placeholder="e.g. Complete unit 5 assessment" />
          </label>
          <label className="form-label"><span>Due date</span>
            <input type="date" className="form-input" />
          </label>
        </Modal>
      )}
    </div>
  );
}
