import StatusBadge from '../../components/common/StatusBadge';
import { LEARNERS, REVIEWS, GOALS, EVIDENCE, SESSIONS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function LearnerProfile() {
  const navigate = useNavigate();
  const learner = LEARNERS[0];
  const reviews = REVIEWS.filter(r => r.learnerId === learner.id);
  const goals = GOALS.filter(g => g.learnerId === learner.id);
  const evidence = EVIDENCE.filter(e => e.learnerId === learner.id);
  const sessions = SESSIONS.filter(s => s.learnerId === learner.id);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="profile-hero card">
        <div className="profile-avatar">{learner.name[0]}</div>
        <div className="profile-info">
          <h1 style={{ margin: 0 }}>{learner.name}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{learner.email}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{learner.programme}</p>
        </div>
        <StatusBadge status={learner.status} />
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>Attendance</h3><p>{learner.attendance}%</p></div>
        <div className="kpi-card"><h3>Coach</h3><p style={{ fontSize: '1.2rem' }}>{learner.coach}</p></div>
        <div className="kpi-card"><h3>Employer</h3><p style={{ fontSize: '1.1rem' }}>{learner.employer}</p></div>
        <div className="kpi-card"><h3>Start Date</h3><p style={{ fontSize: '1.1rem' }}>{learner.startDate}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Goals</h2>
          {goals.map(g => (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{g.title}</span>
                <StatusBadge status={g.status} />
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${g.progress}%` }} /></div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due {g.dueDate}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="card-title">Timeline</h2>
          <div className="timeline">
            {sessions.map(s => (
              <div key={s.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <p className="timeline-label">Coaching session — {s.date}</p>
                  {s.notes && <p className="timeline-note">{s.notes.slice(0, 80)}...</p>}
                </div>
              </div>
            ))}
            {reviews.map(r => (
              <div key={r.id} className="timeline-item">
                <div className="timeline-dot timeline-dot-blue" />
                <div>
                  <p className="timeline-label">Review: {r.period} — Score {r.score}</p>
                  <p className="timeline-note">{r.comments.slice(0, 60)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Evidence Files</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {evidence.map(e => (
            <div key={e.id} className="evidence-row">
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{e.title}</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{e.linkedTo} · {e.uploadedAt} · {e.fileSize}</p>
              </div>
              <span className="file-badge">{e.fileType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
