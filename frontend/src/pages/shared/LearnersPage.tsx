import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { LEARNERS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function LearnersPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">People</p>
          <h1 className="page-title">Learners</h1>
        </div>
        <button className="primary-button" onClick={() => setAddOpen(true)}>+ Add Learner</button>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: row => (
              <button className="link-btn" onClick={() => navigate(`/admin/learners/${row.id}`)}>{row.name}</button>
            )},
            { key: 'email', label: 'Email' },
            { key: 'programme', label: 'Programme' },
            { key: 'startDate', label: 'Start Date' },
            { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'coach', label: 'Coach' },
            { key: 'employer', label: 'Employer' },
          ]}
          data={LEARNERS}
          keyField="id"
          exportFilename="learners"
        />
      </div>

      {addOpen && (
        <Modal
          title="Add Learner"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setAddOpen(false); addToast('Learner added', 'success'); }}>Save</button>
              <button className="secondary-button" onClick={() => setAddOpen(false)}>Cancel</button>
            </>
          }
        >
          {['Full name', 'Email address', 'Programme', 'Employer', 'Start date'].map(f => (
            <label key={f} className="form-label">
              <span>{f}</span>
              <input type={f === 'Start date' ? 'date' : f === 'Email address' ? 'email' : 'text'} className="form-input" />
            </label>
          ))}
          <label className="form-label">
            <span>Assign coach</span>
            <select className="form-input">
              <option>Chris Coach</option>
              <option>Sarah Smith</option>
            </select>
          </label>
        </Modal>
      )}
    </div>
  );
}
