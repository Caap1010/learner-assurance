import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const SENT_MESSAGES = [
  { id: 'cm1', title: 'Attendance Reminder', target: 'All Cohorts', channel: 'Email', sentAt: '2026-05-08 07:30', status: 'Sent' },
  { id: 'cm2', title: 'Evidence Deadline Alert', target: 'YDP Cohort 2026-Q1', channel: 'In-App', sentAt: '2026-05-08 12:15', status: 'Sent' },
  { id: 'cm3', title: 'Partner SLA Update', target: 'Institute Managers', channel: 'Email', sentAt: '2026-05-09 09:00', status: 'Scheduled' },
];

export default function OwnerCommunicationsPage() {
  const { addToast } = useToast();
  const [message, setMessage] = useState('');

  function sendNow() {
    if (!message.trim()) {
      addToast('Write a message before sending.', 'warning');
      return;
    }
    setMessage('');
    addToast('Broadcast sent successfully.', 'success');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Communications</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Broadcast Composer</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <select className="form-input" defaultValue="all">
            <option value="all">All users</option>
            <option value="cohorts">Specific cohort</option>
            <option value="partners">Partner managers</option>
            <option value="owners">Operational owners</option>
          </select>
          <textarea
            className="form-input"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement or reminder"
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary-button" onClick={sendNow}>Send Now</button>
            <button className="secondary-button" onClick={() => addToast('Message scheduled', 'success')}>Schedule</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Recent Campaigns</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Title</th>
                <th className="datatable-th">Audience</th>
                <th className="datatable-th">Channel</th>
                <th className="datatable-th">Time</th>
                <th className="datatable-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {SENT_MESSAGES.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.target}</td>
                  <td>{row.channel}</td>
                  <td>{row.sentAt}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
