import StatusBadge from '../../components/common/StatusBadge';
import { LEARNERS, SESSIONS, INTERVENTIONS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const upcoming = SESSIONS.filter(s => s.sessionStatus === 'scheduled');
  const escalated = LEARNERS.filter(l => l.status === 'escalated');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Coach</p>
          <h1 className="page-title">Coach Overview</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>My Learners</h3><p>{LEARNERS.length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>{LEARNERS.filter(l => l.status === 'at-risk').length}</p></div>
        <div className="kpi-card kpi-red"><h3>Escalated</h3><p>{escalated.length}</p></div>
        <div className="kpi-card"><h3>Upcoming Sessions</h3><p>{upcoming.length}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Sessions</h2>
            <button className="primary-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/coach/coaching')}>All Sessions</button>
          </div>
          {upcoming.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions.</p> : (
            <div style={{ display: 'grid', gap: 10 }}>
              {upcoming.map(s => (
                <div key={s.id} className="session-row">
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{s.learnerName}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.date} · {s.duration} min</p>
                  </div>
                  <StatusBadge status={s.sessionStatus} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Learners</h2>
            <button className="primary-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/coach/learners')}>View All</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {LEARNERS.map(l => (
              <div key={l.id} className="learner-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.programme}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.attendance}%</span>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {INTERVENTIONS.filter(i => i.status !== 'resolved').length > 0 && (
        <div className="card">
          <h2 className="card-title">Interventions Requiring Action</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {INTERVENTIONS.filter(i => i.status !== 'resolved').map(i => (
              <div key={i.id} className="intervention-row">
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{i.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{i.description.slice(0, 80)}...</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Open for {i.daysOpen} days</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <StatusBadge status={i.riskLevel} />
                  <StatusBadge status={i.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
