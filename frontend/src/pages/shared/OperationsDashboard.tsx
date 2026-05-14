import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { ATTENDANCE, SESSIONS, INTERVENTIONS, GOALS, LEARNERS } from '../../data/mockData';

export default function OperationsDashboard() {
  const { addToast } = useToast();

  const pendingAttendance = ATTENDANCE.filter(a => a.approvalStatus === 'pending');
  const overdueGoals = GOALS.filter(g => g.status === 'overdue');
  const openInterventions = INTERVENTIONS.filter(i => i.status !== 'resolved');
  const upcomingSessions = SESSIONS.filter(s => s.sessionStatus === 'scheduled');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Administration</p>
          <h1 className="page-title">Operations Dashboard</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-yellow"><h3>Pending Approvals</h3><p>{pendingAttendance.length}</p></div>
        <div className="kpi-card kpi-red"><h3>Open Interventions</h3><p>{openInterventions.length}</p></div>
        <div className="kpi-card kpi-red"><h3>Overdue Goals</h3><p>{overdueGoals.length}</p></div>
        <div className="kpi-card"><h3>Upcoming Sessions</h3><p>{upcomingSessions.length}</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Pending Attendance Approvals</h2>
          {pendingAttendance.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>All caught up!</p>
            : <DataTable
                columns={[
                  { key: 'learnerName', label: 'Learner' },
                  { key: 'date', label: 'Date' },
                  { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
                  { key: 'id', label: 'Action', render: row => (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn" onClick={() => addToast(`Approved ${row.learnerName}`, 'success')}>Approve</button>
                      <button className="action-btn action-btn-danger" onClick={() => addToast(`Rejected`, 'error')}>Reject</button>
                    </div>
                  )},
                ]}
                data={pendingAttendance}
                keyField="id"
                searchable={false}
              />
          }
        </div>

        <div className="card">
          <h2 className="card-title">Upcoming Sessions</h2>
          {upcomingSessions.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions.</p>
            : <div style={{ display: 'grid', gap: 10 }}>
                {upcomingSessions.map(s => (
                  <div key={s.id} className="session-row">
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{s.learnerName}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.date} · {s.duration} min</p>
                    </div>
                    <StatusBadge status={s.sessionStatus} />
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Overdue Goals</h2>
          {overdueGoals.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No overdue goals.</p>
            : <div style={{ display: 'grid', gap: 10 }}>
                {overdueGoals.map(g => {
                  const learner = LEARNERS.find(l => l.id === g.learnerId);
                  return (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>{g.title}</p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{learner?.name} · Due {g.dueDate}</p>
                      </div>
                      <StatusBadge status="overdue" />
                    </div>
                  );
                })}
              </div>
          }
        </div>

        <div className="card">
          <h2 className="card-title">Active Interventions</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {openInterventions.map(i => (
              <div key={i.id} className="intervention-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{i.learnerName}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Day {i.daysOpen} · {i.assignedTo}</p>
                </div>
                <StatusBadge status={i.riskLevel} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
