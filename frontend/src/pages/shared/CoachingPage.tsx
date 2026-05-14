import { useState } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { SESSIONS, LEARNERS } from '../../data/mockData';

export default function CoachingPage() {
  const { addToast } = useToast();
  const [bookOpen, setBookOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const selectedSession = SESSIONS.find(s => s.id === notesOpen);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Coaching</p>
          <h1 className="page-title">Sessions</h1>
        </div>
        <button className="primary-button" onClick={() => setBookOpen(true)}>+ Book Session</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Sessions</h3><p>{SESSIONS.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Completed</h3><p>{SESSIONS.filter(s => s.sessionStatus === 'completed').length}</p></div>
        <div className="kpi-card"><h3>Scheduled</h3><p>{SESSIONS.filter(s => s.sessionStatus === 'scheduled').length}</p></div>
        <div className="kpi-card kpi-red"><h3>Cancelled</h3><p>{SESSIONS.filter(s => s.sessionStatus === 'cancelled').length}</p></div>
      </div>

      <div className="card">
        <h2 className="card-title">All Sessions</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          {SESSIONS.map(s => (
            <div key={s.id} className="session-card">
              <div className="session-card-header">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{s.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {s.date} · {s.duration} min
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={s.sessionStatus} />
                  {s.sessionStatus === 'completed' && s.notes && (
                    <button className="action-btn" onClick={() => setNotesOpen(s.id)}>View Notes</button>
                  )}
                </div>
              </div>
              {s.followUps.length > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--input-border)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Follow-ups</p>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {s.followUps.map((f, i) => <li key={i} style={{ fontSize: '0.88rem' }}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {bookOpen && (
        <Modal
          title="Book Coaching Session"
          onClose={() => setBookOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setBookOpen(false); addToast('Session booked', 'success'); }}>Book</button>
              <button className="secondary-button" onClick={() => setBookOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Date</span>
            <input type="date" className="form-input" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="form-label"><span>Duration (minutes)</span>
            <select className="form-input"><option>30</option><option>45</option><option>60</option><option>90</option></select>
          </label>
          <label className="form-label"><span>Notes</span>
            <textarea className="form-input" rows={3} placeholder="Pre-session notes or agenda..." />
          </label>
        </Modal>
      )}

      {notesOpen && selectedSession && (
        <Modal title={`Session Notes — ${selectedSession.learnerName}`} onClose={() => setNotesOpen(null)}>
          <p style={{ lineHeight: 1.7 }}>{selectedSession.notes}</p>
          {selectedSession.followUps.length > 0 && (
            <>
              <h3 style={{ marginTop: 16 }}>Follow-up Actions</h3>
              <ul>{selectedSession.followUps.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
