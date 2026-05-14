import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import { useToast } from '../../context/ToastContext';
import { LEARNERS, COMPLIANCE_TREND, STATUS_DISTRIBUTION } from '../../data/mockData';

export default function InstituteDashboard() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Institute</p>
          <h1 className="page-title">Institute Dashboard</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Compliance report exported', 'success')}>Export Report</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Learners</h3><p>1,248</p></div>
        <div className="kpi-card kpi-green"><h3>Compliance Rate</h3><p>97.4%</p></div>
        <div className="kpi-card kpi-green"><h3>Completion Rate</h3><p>88%</p></div>
        <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>{LEARNERS.filter(l => l.status === 'at-risk' || l.status === 'escalated').length}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Compliance Trend (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLIANCE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Line type="monotone" dataKey="compliance" stroke="#45d0d4" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Learner Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STATUS_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {STATUS_DISTRIBUTION.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Registered Learners</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'programme', label: 'Programme' },
            { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
            { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
            { key: 'startDate', label: 'Start Date' },
            { key: 'employer', label: 'Employer' },
          ]}
          data={LEARNERS}
          keyField="id"
          exportFilename="institute-learners"
        />
      </div>
    </div>
  );
}
