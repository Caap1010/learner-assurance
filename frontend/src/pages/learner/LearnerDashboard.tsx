import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from '../../components/common/StatusBadge';
import { LEARNERS, GOALS, REVIEWS, EVIDENCE, SESSIONS } from '../../data/mockData';

const MY_LEARNER = LEARNERS[0];
const MY_GOALS = GOALS.filter(g => g.learnerId === 'l1');
const MY_REVIEWS = REVIEWS.filter(r => r.learnerId === 'l1');
const MY_EVIDENCE = EVIDENCE.filter(e => e.learnerId === 'l1');
const MY_SESSIONS = SESSIONS.slice(0, 2);

export default function LearnerDashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Welcome back</p>
          <h1 className="page-title">{MY_LEARNER.name}</h1>
        </div>
        <StatusBadge status={MY_LEARNER.status} />
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>Attendance</h3><p>{MY_LEARNER.attendance}%</p></div>
        <div className="kpi-card"><h3>Active Goals</h3><p>{MY_GOALS.filter(g => g.status === 'in-progress').length}</p></div>
        <div className="kpi-card"><h3>Evidence Files</h3><p>{MY_EVIDENCE.length}</p></div>
        <div className="kpi-card"><h3>Last Review Score</h3><p>{MY_REVIEWS[0]?.score ?? '—'}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">My Performance Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MY_REVIEWS.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">My Goals</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {MY_GOALS.map(g => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{g.title}</span>
                  <StatusBadge status={g.status} />
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${g.progress}%` }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due {g.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Upcoming Sessions</h2>
          {MY_SESSIONS.filter(s => s.sessionStatus === 'scheduled').length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions.</p>
            : MY_SESSIONS.filter(s => s.sessionStatus === 'scheduled').map(s => (
              <div key={s.id} className="session-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{s.date} · {s.duration} min</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>with {MY_LEARNER.coach}</p>
                </div>
                <StatusBadge status={s.sessionStatus} />
              </div>
            ))}
        </div>

        <div className="card">
          <h2 className="card-title">Recent Evidence</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {MY_EVIDENCE.map(e => (
              <div key={e.id} className="evidence-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{e.title}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.linkedTo} · {e.uploadedAt}</p>
                </div>
                <span className="file-badge">{e.fileType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
