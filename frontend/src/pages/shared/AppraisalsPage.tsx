import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { APPRAISALS, LEARNERS } from '../../data/mockData';

export default function AppraisalsPage() {
  const { addToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">360 Appraisals</p>
          <h1 className="page-title">Appraisal Cycles</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={() => setFeedbackOpen(true)}>Submit Feedback</button>
          <button className="primary-button" onClick={() => setCreateOpen(true)}>+ New Cycle</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Cycles</h3><p>{APPRAISALS.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Completed</h3><p>{APPRAISALS.filter(a => a.status === 'completed').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>In Progress</h3><p>{APPRAISALS.filter(a => a.status === 'in-progress').length}</p></div>
        <div className="kpi-card kpi-red"><h3>Pending</h3><p>{APPRAISALS.filter(a => a.status === 'pending').length}</p></div>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'cycle', label: 'Cycle' },
            { key: 'learnerName', label: 'Learner' },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'contributors', label: 'Contributors', render: row => row.contributors.join(', ') },
            { key: 'overallScore', label: 'Score', render: row => row.status === 'completed' ? `${row.overallScore}/100` : '—' },
          ]}
          data={APPRAISALS}
          keyField="id"
          exportFilename="appraisals"
        />
      </div>

      {createOpen && (
        <Modal
          title="Create Appraisal Cycle"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setCreateOpen(false); addToast('Appraisal cycle created', 'success'); }}>Create</button>
              <button className="secondary-button" onClick={() => setCreateOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Cycle name</span>
            <input type="text" className="form-input" placeholder="e.g. Mid-Year 2026" />
          </label>
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Contributors (comma-separated)</span>
            <input type="text" className="form-input" placeholder="Coach, Manager, Peer" />
          </label>
        </Modal>
      )}

      {feedbackOpen && (
        <Modal
          title="Submit Contributor Feedback"
          onClose={() => setFeedbackOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setFeedbackOpen(false); addToast('Feedback submitted', 'success'); }}>Submit</button>
              <button className="secondary-button" onClick={() => setFeedbackOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Appraisal cycle</span>
            <select className="form-input">{APPRAISALS.map(a => <option key={a.id}>{a.cycle} — {a.learnerName}</option>)}</select>
          </label>
          {['Communication', 'Technical Skills', 'Teamwork', 'Initiative'].map(cat => (
            <label key={cat} className="form-label"><span>{cat} (1–10)</span>
              <input type="number" className="form-input" min={1} max={10} placeholder="7" />
            </label>
          ))}
          <label className="form-label"><span>Overall comments</span>
            <textarea className="form-input" rows={3} placeholder="Qualitative feedback..." />
          </label>
        </Modal>
      )}
    </div>
  );
}
