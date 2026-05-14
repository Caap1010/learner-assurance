import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { REVIEWS, LEARNERS } from '../../data/mockData';

export default function ReviewsPage() {
  const { addToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const trendData = REVIEWS.filter(r => r.learnerId === 'l1').reverse().map(r => ({
    period: r.period.split(' ')[0],
    score: r.score,
  }));

  const selectedReview = REVIEWS.find(r => r.id === selected);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Performance</p>
          <h1 className="page-title">Monthly Reviews</h1>
        </div>
        <button className="primary-button" onClick={() => setCreateOpen(true)}>+ New Review</button>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Performance Trend — Priya Sharma</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Latest Scores</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {REVIEWS.map(r => (
              <div key={r.id} className="review-row" onClick={() => setSelected(r.id)} tabIndex={0} role="button" onKeyDown={e => e.key === 'Enter' && setSelected(r.id)}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{r.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.period}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="score-pill">{r.score}</span>
                  <StatusBadge status={r.score >= 70 ? 'on-track' : r.score >= 50 ? 'at-risk' : 'escalated'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {createOpen && (
        <Modal
          title="Create Monthly Review"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setCreateOpen(false); addToast('Review saved', 'success'); }}>Save Review</button>
              <button className="secondary-button" onClick={() => setCreateOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Period</span>
            <input type="text" className="form-input" placeholder="e.g. May 2026" />
          </label>
          <label className="form-label"><span>Score (0–100)</span>
            <input type="number" className="form-input" min={0} max={100} placeholder="75" />
          </label>
          <label className="form-label"><span>Comments</span>
            <textarea className="form-input" rows={3} placeholder="Overall assessment..." />
          </label>
          <label className="form-label"><span>Targets for next period</span>
            <textarea className="form-input" rows={2} placeholder="Goals and targets..." />
          </label>
        </Modal>
      )}

      {selected && selectedReview && (
        <Modal title={`Review — ${selectedReview.learnerName} (${selectedReview.period})`} onClose={() => setSelected(null)}>
          <p><strong>Score:</strong> {selectedReview.score} / 100</p>
          <p><strong>Comments:</strong> {selectedReview.comments}</p>
          <p><strong>Targets:</strong> {selectedReview.targets}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Created: {selectedReview.createdAt}</p>
        </Modal>
      )}
    </div>
  );
}
