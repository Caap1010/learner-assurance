import { useToast } from '../../context/ToastContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PARTNERS = [
  { id: 'pt1', name: 'Acme Manufacturing', type: 'Employer', cohorts: 4, sla: '98.2%', manager: 'Naledi Khoza', threshold: '95%', trend: [{ month: 'Jan', value: 96 }, { month: 'Feb', value: 97 }, { month: 'Mar', value: 98 }, { month: 'Apr', value: 98 }] },
  { id: 'pt2', name: 'North Skills Institute', type: 'Institute', cohorts: 3, sla: '96.8%', manager: 'Thabo Mokoena', threshold: '95%', trend: [{ month: 'Jan', value: 95 }, { month: 'Feb', value: 96 }, { month: 'Mar', value: 97 }, { month: 'Apr', value: 97 }] },
  { id: 'pt3', name: 'Future Finance Group', type: 'Employer', cohorts: 2, sla: '94.1%', manager: 'Ayesha Patel', threshold: '95%', trend: [{ month: 'Jan', value: 95 }, { month: 'Feb', value: 94 }, { month: 'Mar', value: 93 }, { month: 'Apr', value: 94 }] },
  { id: 'pt4', name: 'Metro Academy', type: 'Institute', cohorts: 5, sla: '97.5%', manager: 'Sipho Dlamini', threshold: '95%', trend: [{ month: 'Jan', value: 96 }, { month: 'Feb', value: 97 }, { month: 'Mar', value: 98 }, { month: 'Apr', value: 97 }] },
];

export default function OwnerPartnersPage() {
  const { addToast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Partners</h1>
        </div>
        <button className="primary-button" onClick={() => addToast('Partner onboarding opened', 'info')}>+ Add Partner</button>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Employer & Institute Network</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Partner</th>
                <th className="datatable-th">Type</th>
                <th className="datatable-th">Active Cohorts</th>
                <th className="datatable-th">SLA</th>
                <th className="datatable-th">KPI Threshold</th>
                <th className="datatable-th">Account Manager</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PARTNERS.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.cohorts}</td>
                  <td>{row.sla}</td>
                  <td>{row.threshold}</td>
                  <td>{row.manager}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => addToast(`Opened ${row.name} scorecard`, 'info')}>Scorecard</button>
                      <button className="action-btn" onClick={() => addToast(`Opened ${row.name} contracts`, 'info')}>Contracts</button>
                      <button className="action-btn" onClick={() => addToast(`Updated contractual thresholds for ${row.name}`, 'success')}>Thresholds</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: 20 }}>
        {PARTNERS.map((partner) => (
          <div key={partner.id} className="card">
            <h2 className="card-title">{partner.name} SLA Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={partner.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[90, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
                <Line type="monotone" dataKey="value" stroke="#0f3b72" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
