import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import { useToast } from '../../context/ToastContext';
import { LEARNERS, INTERVENTIONS, ATTENDANCE } from '../../data/mockData';

const attendanceTrend = [
  { month: 'Nov', rate: 88 }, { month: 'Dec', rate: 86 },
  { month: 'Jan', rate: 90 }, { month: 'Feb', rate: 92 },
  { month: 'Mar', rate: 87 }, { month: 'Apr', rate: 91 },
];

export default function ManagerDashboard() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Manager</p>
          <h1 className="page-title">Manager Dashboard</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Team report exported', 'success')}>Export Report</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Team Learners</h3><p>{LEARNERS.length}</p></div>
        <div className="kpi-card kpi-green"><h3>On Track</h3><p>{LEARNERS.filter(l => l.status === 'on-track').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>{LEARNERS.filter(l => l.status === 'at-risk').length}</p></div>
        <div className="kpi-card kpi-red"><h3>Escalated</h3><p>{LEARNERS.filter(l => l.status === 'escalated').length}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Team Attendance Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Bar dataKey="rate" fill="#45d0d4" radius={[6, 6, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Open Interventions</h2>
          {INTERVENTIONS.filter(i => i.status !== 'resolved').length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No open interventions.</p>
            : <div style={{ display: 'grid', gap: 10 }}>
                {INTERVENTIONS.filter(i => i.status !== 'resolved').map(i => (
                  <div key={i.id} className="intervention-row">
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{i.learnerName}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Day {i.daysOpen} · {i.description.slice(0, 50)}…</p>
                    </div>
                    <StatusBadge status={i.riskLevel} />
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Team Learners</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'programme', label: 'Programme' },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
            { key: 'employer', label: 'Employer' },
          ]}
          data={LEARNERS}
          keyField="id"
          exportFilename="team-learners"
        />
      </div>

      <div className="card">
        <h2 className="card-title">Recent Attendance</h2>
        <DataTable
          columns={[
            { key: 'learnerName', label: 'Learner' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'approvalStatus', label: 'Approval', render: row => <StatusBadge status={row.approvalStatus} /> },
          ]}
          data={ATTENDANCE}
          keyField="id"
          exportFilename="attendance"
        />
      </div>
    </div>
  );
}
