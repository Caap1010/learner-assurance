import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from '../../components/common/StatusBadge';
import { LEARNERS, SESSIONS, GOALS } from '../../data/mockData';

const progressData = [
  { month: 'Jan', onTrack: 8, atRisk: 2 },
  { month: 'Feb', onTrack: 9, atRisk: 2 },
  { month: 'Mar', onTrack: 7, atRisk: 3 },
  { month: 'Apr', onTrack: 10, atRisk: 1 },
  { month: 'May', onTrack: 9, atRisk: 2 },
];

export default function MentorDashboard() {
  const myLearners = LEARNERS.slice(0, 4);
  const upcomingSessions = SESSIONS.filter(s => s.sessionStatus === 'scheduled');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Mentor</p>
          <h1 className="page-title">Mentor Dashboard</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>My Learners</h3><p>{myLearners.length}</p></div>
        <div className="kpi-card kpi-green"><h3>On Track</h3><p>{myLearners.filter(l => l.status === 'on-track').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>{myLearners.filter(l => l.status === 'at-risk').length}</p></div>
        <div className="kpi-card"><h3>Upcoming Sessions</h3><p>{upcomingSessions.length}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Learner Progress Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Bar dataKey="onTrack" fill="#10b981" radius={[4, 4, 0, 0]} name="On Track" />
              <Bar dataKey="atRisk" fill="#f59e0b" radius={[4, 4, 0, 0]} name="At Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">My Learners</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {myLearners.map(l => (
              <div key={l.id} className="session-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{l.programme}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Upcoming Sessions</h2>
          {upcomingSessions.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions.</p>
            : <div style={{ display: 'grid', gap: 10 }}>
                {upcomingSessions.map(s => (
                  <div key={s.id} className="session-row">
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{s.learnerName}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.date} · {s.duration} min</p>
                    </div>
                    <StatusBadge status={s.sessionStatus} />
                  </div>
                ))}
              </div>
          }
        </div>

        <div className="card">
          <h2 className="card-title">Active Goals</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {GOALS.filter(g => g.status !== 'completed').slice(0, 4).map(g => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{g.title}</span>
                  <StatusBadge status={g.status} />
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${g.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
