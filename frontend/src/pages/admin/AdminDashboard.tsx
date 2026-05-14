import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LEARNERS, INTERVENTIONS, STATUS_DISTRIBUTION } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const openInterventions = INTERVENTIONS.filter(i => i.status !== 'resolved').length;
  const atRisk = LEARNERS.filter(l => l.status === 'at-risk' || l.status === 'escalated').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Administration</p>
          <h1 className="page-title">Admin Overview</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Learners</h3><p>{LEARNERS.length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Needs Attention</h3><p>{atRisk}</p></div>
        <div className="kpi-card kpi-red"><h3>Open Interventions</h3><p>{openInterventions}</p></div>
        <div className="kpi-card kpi-green"><h3>Avg Attendance</h3><p>{Math.round(LEARNERS.reduce((s, l) => s + l.attendance, 0) / LEARNERS.length)}%</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={STATUS_DISTRIBUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Bar dataKey="value" fill="#0f3b72" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Active Interventions</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {INTERVENTIONS.filter(i => i.status !== 'resolved').map(i => (
              <div key={i.id} className="intervention-row">
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{i.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{i.description.slice(0, 60)}...</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={i.riskLevel} />
                  <StatusBadge status={i.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Learners</h2>
          <button className="primary-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/admin/learners')}>View All</button>
        </div>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'programme', label: 'Programme' },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
            { key: 'coach', label: 'Coach' },
          ]}
          data={LEARNERS}
          keyField="id"
          exportFilename="learners-overview"
        />
      </div>
    </div>
  );
}
