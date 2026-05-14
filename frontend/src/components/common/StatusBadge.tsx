import type { LearnerStatus } from '../../types';

const VARIANTS: Record<string, { bg: string; color: string; label: string }> = {
  'on-track':    { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'On Track' },
  'at-risk':     { bg: 'var(--badge-yellow-bg)',   color: 'var(--badge-yellow-text)',   label: 'At Risk' },
  'escalated':   { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Escalated' },
  'completed':   { bg: 'var(--badge-blue-bg)',     color: 'var(--badge-blue-text)',     label: 'Completed' },
  'pending':     { bg: 'var(--badge-grey-bg)',     color: 'var(--badge-grey-text)',     label: 'Pending' },
  'approved':    { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Approved' },
  'rejected':    { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Rejected' },
  'expired':     { bg: 'var(--badge-grey-bg)',     color: 'var(--badge-grey-text)',     label: 'Expired' },
  'present':     { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Present' },
  'absent':      { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Absent' },
  'late':        { bg: 'var(--badge-yellow-bg)',   color: 'var(--badge-yellow-text)',   label: 'Late' },
  'scheduled':   { bg: 'var(--badge-blue-bg)',     color: 'var(--badge-blue-text)',     label: 'Scheduled' },
  'cancelled':   { bg: 'var(--badge-grey-bg)',     color: 'var(--badge-grey-text)',     label: 'Cancelled' },
  'open':        { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Open' },
  'in-progress': { bg: 'var(--badge-yellow-bg)',   color: 'var(--badge-yellow-text)',   label: 'In Progress' },
  'resolved':    { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Resolved' },
  'connected':   { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Connected' },
  'syncing':     { bg: 'var(--badge-blue-bg)',     color: 'var(--badge-blue-text)',     label: 'Syncing' },
  'warning':     { bg: 'var(--badge-yellow-bg)',   color: 'var(--badge-yellow-text)',   label: 'Warning' },
  'disconnected':{ bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Disconnected' },
  'not-started': { bg: 'var(--badge-grey-bg)',     color: 'var(--badge-grey-text)',     label: 'Not Started' },
  'overdue':     { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Overdue' },
  'failed':      { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'Failed' },
  'low':         { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Low' },
  'medium':      { bg: 'var(--badge-yellow-bg)',   color: 'var(--badge-yellow-text)',   label: 'Medium' },
  'high':        { bg: 'var(--badge-red-bg)',      color: 'var(--badge-red-text)',      label: 'High' },
  'active':      { bg: 'var(--badge-green-bg)',    color: 'var(--badge-green-text)',    label: 'Active' },
  'inactive':    { bg: 'var(--badge-grey-bg)',     color: 'var(--badge-grey-text)',     label: 'Inactive' },
  'admin':       { bg: '#fee2e2', color: '#991b1b', label: 'Admin' },
  'coach':       { bg: '#dbeafe', color: '#1e40af', label: 'Coach' },
  'learner':     { bg: '#dcfce7', color: '#166534', label: 'Learner' },
  'employer':    { bg: '#fef3c7', color: '#92400e', label: 'Employer' },
  'mentor':      { bg: '#f3e8ff', color: '#6b21a8', label: 'Mentor' },
  'manager':     { bg: '#fecaca', color: '#7f1d1d', label: 'Manager' },
  'institute':   { bg: '#cffafe', color: '#164e63', label: 'Institute' },
  'ydp':         { bg: '#e0e7ff', color: '#312e81', label: 'YDP Candidate' },
  'owner':       { bg: '#dbeafe', color: '#0c4a6e', label: 'Owner' },
};

export default function StatusBadge({ status }: { status: string }) {
  const v = VARIANTS[status] ?? VARIANTS['pending'];
  return (
    <span
      style={{ background: v.bg, color: v.color }}
      className="status-badge"
    >
      {v.label}
    </span>
  );
}

// Suppress unused import warning — LearnerStatus is used externally
void (undefined as unknown as LearnerStatus);
