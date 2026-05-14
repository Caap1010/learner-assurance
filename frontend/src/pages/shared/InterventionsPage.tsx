import { useState } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { INTERVENTIONS, LEARNERS } from '../../data/mockData';

export default function InterventionsPage() {
  const { addToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState<string | null>(null);
  const selected = INTERVENTIONS.find(i => i.id === planOpen);

  const STAGES = ['Opened', 'Contacted', 'Plan Agreed', 'In Review', 'Resolved'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Risk Management</p>
          <h1 className="page-title">Interventions</h1>
        </div>
        <button className="primary-button" onClick={() => setCreateOpen(true)}>+ New Intervention</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-red"><h3>Open</h3><p>{INTERVENTIONS.filter(i => i.status === 'open').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>In Progress</h3><p>{INTERVENTIONS.filter(i => i.status === 'in-progress').length}</p></div>
        <div className="kpi-card kpi-green"><h3>Resolved</h3><p>{INTERVENTIONS.filter(i => i.status === 'resolved').length}</p></div>
        <div className="kpi-card kpi-red"><h3>High Risk</h3><p>{INTERVENTIONS.filter(i => i.riskLevel === 'high').length}</p></div>
      </div>

      {/* Pipeline view */}
      <div className="card">
        <h2 className="card-title">Escalation Pipeline</h2>
        <div className="pipeline">
          {STAGES.map((stage, i) => (
            <div key={stage} className="pipeline-stage">
              <div className="pipeline-label">{stage}</div>
              <div className="pipeline-count">{i === 0 ? INTERVENTIONS.filter(i => i.status === 'open').length
                : i === 2 ? INTERVENTIONS.filter(i => i.status === 'in-progress').length
                : i === 4 ? INTERVENTIONS.filter(i => i.status === 'resolved').length : 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">All Interventions</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          {INTERVENTIONS.map(i => (
            <div key={i.id} className="intervention-card">
              <div className="intervention-card-top">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{i.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{i.description}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned to {i.assignedTo} · Open {i.daysOpen} days</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <StatusBadge status={i.riskLevel} />
                  <StatusBadge status={i.status} />
                  <button className="action-btn" onClick={() => setPlanOpen(i.id)}>Action Plan</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {createOpen && (
        <Modal
          title="New Intervention"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setCreateOpen(false); addToast('Intervention opened', 'success'); }}>Open</button>
              <button className="secondary-button" onClick={() => setCreateOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Risk level</span>
            <select className="form-input"><option>low</option><option>medium</option><option>high</option></select>
          </label>
          <label className="form-label"><span>Description</span>
            <textarea className="form-input" rows={3} placeholder="Describe the concern..." />
          </label>
          <label className="form-label"><span>Assigned to</span>
            <input type="text" className="form-input" placeholder="Coach name" />
          </label>
        </Modal>
      )}

      {planOpen && selected && (
        <Modal
          title={`Action Plan — ${selected.learnerName}`}
          onClose={() => setPlanOpen(null)}
          footer={
            <button className="primary-button" onClick={() => { setPlanOpen(null); addToast('Action plan saved', 'success'); }}>Save Plan</button>
          }
        >
          <p><strong>Risk Level:</strong> <StatusBadge status={selected.riskLevel} /></p>
          <p><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
          <p><strong>Open for:</strong> {selected.daysOpen} days</p>
          <label className="form-label" style={{ marginTop: 16 }}><span>Milestone 1</span>
            <input type="text" className="form-input" defaultValue="Initial contact with learner" />
          </label>
          <label className="form-label"><span>Milestone 2</span>
            <input type="text" className="form-input" defaultValue="Employer notification" />
          </label>
          <label className="form-label"><span>Target resolution date</span>
            <input type="date" className="form-input" />
          </label>
        </Modal>
      )}
    </div>
  );
}
