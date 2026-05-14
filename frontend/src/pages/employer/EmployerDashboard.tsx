import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LEARNERS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

const ATTENDANCE_DATA = [
  { name: 'Jan', rate: 90 }, { name: 'Feb', rate: 87 }, { name: 'Mar', rate: 92 },
  { name: 'Apr', rate: 89 }, { name: 'May', rate: 91 },
];

export default function EmployerDashboard() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Learner Progress</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Report exported to CSV', 'success')}>
          Export Report
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Your Learners</h3><p>{LEARNERS.length}</p></div>
        <div className="kpi-card kpi-green"><h3>On Track</h3><p>{LEARNERS.filter(l => l.status === 'on-track').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>{LEARNERS.filter(l => l.status === 'at-risk').length}</p></div>
        <div className="kpi-card kpi-green"><h3>Avg Attendance</h3><p>{Math.round(LEARNERS.reduce((s, l) => s + l.attendance, 0) / LEARNERS.length)}%</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Attendance Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Bar dataKey="rate" fill="#45d0d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Learner Compliance Summary</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {LEARNERS.map(l => (
              <div key={l.id} className="learner-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.programme}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>{l.attendance}%</span>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Detailed Learner Data</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'programme', label: 'Programme' },
            { key: 'startDate', label: 'Start Date' },
            { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
          ]}
          data={LEARNERS}
          keyField="id"
          exportFilename="learner-progress"
        />
      </div>
    </div>
  );
}
