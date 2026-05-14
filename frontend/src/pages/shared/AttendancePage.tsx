import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { ATTENDANCE, LEARNERS } from '../../data/mockData';

export default function AttendancePage() {
  const { addToast } = useToast();
  const [submitOpen, setSubmitOpen] = useState(false);

  function approve(id: string) {
    addToast(`Attendance record ${id} approved`, 'success');
  }
  function reject(id: string) {
    addToast(`Attendance record ${id} rejected`, 'warning');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Records</p>
          <h1 className="page-title">Attendance</h1>
        </div>
        <button className="primary-button" onClick={() => setSubmitOpen(true)}>+ Submit Attendance</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>Present</h3><p>{ATTENDANCE.filter(a => a.status === 'present').length}</p></div>
        <div className="kpi-card kpi-red"><h3>Absent</h3><p>{ATTENDANCE.filter(a => a.status === 'absent').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Late</h3><p>{ATTENDANCE.filter(a => a.status === 'late').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Pending Approval</h3><p>{ATTENDANCE.filter(a => a.approvalStatus === 'pending').length}</p></div>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'learnerName', label: 'Learner' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Attendance', render: row => <StatusBadge status={row.status} /> },
            { key: 'approvalStatus', label: 'Approval', render: row => <StatusBadge status={row.approvalStatus} /> },
            { key: 'notes', label: 'Notes', render: row => row.notes ?? '—' },
            { key: 'id', label: 'Actions', render: row => (
              row.approvalStatus === 'pending'
                ? <div style={{ display: 'flex', gap: 6 }}>
                    <button className="action-btn" onClick={() => approve(row.id)}>Approve</button>
                    <button className="action-btn action-btn-danger" onClick={() => reject(row.id)}>Reject</button>
                  </div>
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
            )},
          ]}
          data={ATTENDANCE}
          keyField="id"
          exportFilename="attendance"
        />
      </div>

      {submitOpen && (
        <Modal
          title="Submit Attendance"
          onClose={() => setSubmitOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setSubmitOpen(false); addToast('Attendance submitted', 'success'); }}>Submit</button>
              <button className="secondary-button" onClick={() => setSubmitOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label">
            <span>Learner</span>
            <select className="form-input">
              {LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Date</span>
            <input type="date" className="form-input" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="form-label">
            <span>Status</span>
            <select className="form-input">
              <option>present</option>
              <option>absent</option>
              <option>late</option>
            </select>
          </label>
          <label className="form-label">
            <span>Notes (optional)</span>
            <textarea className="form-input" rows={3} placeholder="Any relevant notes..." />
          </label>
        </Modal>
      )}
    </div>
  );
}
