import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { ApprovalCategory } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function OwnerApprovalsPage() {
  const { addToast } = useToast();
  const { approvalRequests, decideApprovalRequest, addApprovalRequest } = usePlatformData();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'review'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ApprovalCategory>('all');
  const [approverFilter, setApproverFilter] = useState<'all' | string>('all');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [category, setCategory] = useState<ApprovalCategory>('Access');
  const [item, setItem] = useState('');
  const [linkedEntity, setLinkedEntity] = useState('');
  const [requester, setRequester] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueBy, setDueBy] = useState('');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const minDueDateTime = useMemo(() => toDateTimeLocalValue(new Date()), []);
  const currentApprovers = useMemo(() => Array.from(new Set(approvalRequests.map((request) => request.route[Math.min(request.currentStep, request.route.length - 1)])).values()), [approvalRequests]);
  const canSubmitRequest = useMemo(() => {
    if (item.trim().length < 6) return false;
    if (linkedEntity.trim().length < 3) return false;
    if (requester.trim().length < 3) return false;
    if (!dueBy) return true;
    const dueTimestamp = Date.parse(dueBy);
    return Number.isFinite(dueTimestamp) && dueTimestamp > Date.now();
  }, [dueBy, item, linkedEntity, requester]);

  const filteredRequests = useMemo(
    () => approvalRequests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && request.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && request.category !== categoryFilter) return false;
      if (approverFilter !== 'all' && request.route[Math.min(request.currentStep, request.route.length - 1)] !== approverFilter) return false;
      return true;
    }),
    [approvalRequests, approverFilter, categoryFilter, priorityFilter, statusFilter],
  );

  const kpis = useMemo(() => {
    const pending = approvalRequests.filter((request) => request.status === 'pending').length;
    const review = approvalRequests.filter((request) => request.status === 'review').length;
    const escalated = approvalRequests.filter((request) => Boolean(request.escalatedAt)).length;
    const approvedToday = approvalRequests.filter((request) => {
      if (request.status !== 'approved' || !request.decidedAt) return false;
      return request.decidedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
    }).length;
    const highPriority = approvalRequests.filter((request) => request.priority === 'High' && request.status === 'pending').length;
    const access = approvalRequests.filter((request) => request.category === 'Access').length;
    const compliance = approvalRequests.filter((request) => request.category === 'Compliance').length;
    return { pending, review, escalated, approvedToday, highPriority, access, compliance };
  }, [approvalRequests]);

  const categoryMix = useMemo(() => {
    return ['Access', 'Programme', 'Cohort', 'Partner', 'Compliance'].map((entry) => ({
      category: entry as ApprovalCategory,
      count: approvalRequests.filter((request) => request.category === entry).length,
    }));
  }, [approvalRequests]);

  function submitApprovalRequest() {
    const trimmedItem = item.trim();
    const trimmedLinkedEntity = linkedEntity.trim();
    const trimmedRequester = requester.trim();
    if (trimmedItem.length < 6) {
      addToast('Request must be at least 6 characters.', 'warning');
      return;
    }
    if (trimmedLinkedEntity.length < 3) {
      addToast('Linked entity must be at least 3 characters.', 'warning');
      return;
    }
    if (trimmedRequester.length < 3) {
      addToast('Requester name must be at least 3 characters.', 'warning');
      return;
    }
    if (dueBy) {
      const dueTimestamp = Date.parse(dueBy);
      if (!Number.isFinite(dueTimestamp)) {
        addToast('Enter a valid SLA due date.', 'warning');
        return;
      }
      if (dueTimestamp <= Date.now()) {
        addToast('SLA due date must be in the future.', 'warning');
        return;
      }
    }
    addApprovalRequest({ category, item: trimmedItem, linkedEntity: trimmedLinkedEntity, requester: trimmedRequester, priority, dueBy: dueBy ? new Date(dueBy).toISOString() : undefined });
    setCategory('Access');
    setItem('');
    setLinkedEntity('');
    setRequester('');
    setPriority('Medium');
    setDueBy('');
    setRequestModalOpen(false);
    addToast('Approval request added to queue.', 'success');
  }

  function decide(id: string, status: 'approved' | 'rejected' | 'review') {
    decideApprovalRequest(id, status, decisionNotes[id]?.trim() || undefined);
    addToast(
      status === 'approved' ? 'Approval step granted.' : status === 'rejected' ? 'Request rejected.' : 'Marked for review.',
      status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning',
    );
  }

  function canTakeAction(currentStatus: 'pending' | 'approved' | 'rejected' | 'review') {
    return currentStatus === 'pending' || currentStatus === 'review';
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Approvals</h1>
        </div>
        <button className="primary-button" onClick={() => setRequestModalOpen(true)}>+ New Request</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Pending Queue</h3><p>{kpis.pending}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Needs Review</h3><p>{kpis.review}</p></div>
        <div className="kpi-card"><h3>Approved Today</h3><p>{kpis.approvedToday}</p></div>
        <div className="kpi-card kpi-red"><h3>High Priority Pending</h3><p>{kpis.highPriority}</p></div>
        <div className="kpi-card kpi-red"><h3>SLA Escalated</h3><p>{kpis.escalated}</p></div>
        <div className="kpi-card"><h3>Access Requests</h3><p>{kpis.access}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Compliance Requests</h3><p>{kpis.compliance}</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Approval Mix</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {categoryMix.map((entry) => (
            <div key={entry.category} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <strong>{entry.category}</strong>
              <p style={{ margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700 }}>{entry.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Approval Queue</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'review')} style={{ minWidth: 150 }}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="review">Needs review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="form-input" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | 'Low' | 'Medium' | 'High')} style={{ minWidth: 150 }}>
              <option value="all">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="form-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | ApprovalCategory)} style={{ minWidth: 160 }}>
              <option value="all">All categories</option>
              <option value="Access">Access</option>
              <option value="Programme">Programme</option>
              <option value="Cohort">Cohort</option>
              <option value="Partner">Partner</option>
              <option value="Compliance">Compliance</option>
            </select>
            <select className="form-input" value={approverFilter} onChange={(event) => setApproverFilter(event.target.value)} style={{ minWidth: 180 }}>
              <option value="all">All approvers</option>
              {currentApprovers.map((approver) => (
                <option key={approver} value={approver}>{approver}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Category</th>
                <th className="datatable-th">Request</th>
                <th className="datatable-th">Linked Entity</th>
                <th className="datatable-th">Requester</th>
                <th className="datatable-th">Submitted</th>
                <th className="datatable-th">Priority</th>
                <th className="datatable-th">Route Progress</th>
                <th className="datatable-th">SLA Due</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Decision Notes</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((row) => (
                <tr key={row.id}>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td>{row.linkedEntity}</td>
                  <td>{row.requester}</td>
                  <td>{new Date(row.submitted).toLocaleString()}</td>
                  <td>{row.priority}</td>
                  <td>
                    <div style={{ display: 'grid', gap: 2 }}>
                      <span>Step {Math.min(row.currentStep + 1, row.route.length)} of {row.route.length}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Current approver: {row.route[Math.min(row.currentStep, row.route.length - 1)]}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{row.route.join(' -> ')}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'grid', gap: 2 }}>
                      <span>{new Date(row.dueBy).toLocaleString()}</span>
                      {row.escalatedAt ? <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>Escalated {new Date(row.escalatedAt).toLocaleString()}</span> : null}
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{row.status}</td>
                  <td>
                    <input
                      className="form-input"
                      value={decisionNotes[row.id] ?? row.notes ?? ''}
                      onChange={(event) => setDecisionNotes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                      placeholder="Optional rationale"
                      disabled={row.status !== 'pending' && row.status !== 'review'}
                      style={{ minWidth: 160 }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" disabled={!canTakeAction(row.status)} onClick={() => decide(row.id, 'approved')}>Approve Step</button>
                      <button className="action-btn action-btn-danger" disabled={!canTakeAction(row.status)} onClick={() => decide(row.id, 'rejected')}>Reject</button>
                      <button className="action-btn" disabled={!canTakeAction(row.status) || row.status === 'review'} onClick={() => decide(row.id, 'review')}>Need Review</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {requestModalOpen && (
        <Modal
          title="Create Approval Request"
          onClose={() => setRequestModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setRequestModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={submitApprovalRequest} disabled={!canSubmitRequest}>Submit Request</button>
            </>
          )}
        >
          <label className="form-label">
            Category
            <select className="form-input" value={category} onChange={(event) => setCategory(event.target.value as ApprovalCategory)}>
              <option value="Access">Access</option>
              <option value="Programme">Programme</option>
              <option value="Cohort">Cohort</option>
              <option value="Partner">Partner</option>
              <option value="Compliance">Compliance</option>
            </select>
          </label>
          <label className="form-label">
            Request description
            <input className="form-input" value={item} onChange={(event) => setItem(event.target.value)} placeholder="e.g. Programme version migration approval" />
          </label>
          <label className="form-label">
            Linked entity
            <input className="form-input" value={linkedEntity} onChange={(event) => setLinkedEntity(event.target.value)} placeholder="e.g. Metro Academy or Cohort 2026-A" />
          </label>
          <label className="form-label">
            Requester
            <input className="form-input" value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Requester name" />
          </label>
          <label className="form-label">
            Priority
            <select className="form-input" value={priority} onChange={(event) => setPriority(event.target.value as 'Low' | 'Medium' | 'High')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label className="form-label">
            SLA due (optional)
            <input type="datetime-local" min={minDueDateTime} className="form-input" value={dueBy} onChange={(event) => setDueBy(event.target.value)} />
          </label>
        </Modal>
      )}
    </div>
  );
}
