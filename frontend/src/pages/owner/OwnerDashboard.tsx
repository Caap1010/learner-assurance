import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { usePlatformData } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';
import {
  LEARNERS, COMPLIANCE_TREND, STATUS_DISTRIBUTION,
  NOTIFICATIONS
} from '../../data/mockData';
import type { Role } from '../../types';

type RoleChangeRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: Role;
  requestedRole: Role;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
};

type CsvPreviewRow = {
  name: string;
  email: string;
  role: Role;
};

const ALL_ROLES: Role[] = ['owner', 'admin', 'coach', 'learner', 'employer', 'mentor', 'manager', 'institute', 'ydp'];

function parseAdvancedQuery(query: string) {
  const lower = query.toLowerCase();
  const roleToken = lower.match(/role:(owner|admin|coach|learner|employer|mentor|manager|institute|ydp)/)?.[1] ?? null;
  const statusToken = lower.match(/status:(active|inactive)/)?.[1] ?? null;
  const inferredRole = ALL_ROLES.find((r) => lower.includes(r));
  const inferredStatus = lower.includes('inactive') ? 'inactive' : (lower.includes('active') ? 'active' : null);

  const role = (roleToken ?? inferredRole ?? null) as Role | null;
  const status = (statusToken ?? inferredStatus ?? null) as 'active' | 'inactive' | null;

  const stripped = lower
    .replace(/role:(owner|admin|coach|learner|employer|mentor|manager|institute|ydp)/g, ' ')
    .replace(/status:(active|inactive)/g, ' ')
    .replace(/\b(owner|admin|coach|learner|employer|mentor|manager|institute|ydp|active|inactive)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { role, status, text: stripped };
}

export default function OwnerDashboard() {
  const { addToast } = useToast();
  const {
    users,
    addUser,
    removeUser,
    suspendUser,
    bulkSuspend,
    bulkAssignRole,
    permissions,
    togglePermission,
    grants,
    addTemporaryGrant,
    approveTemporaryGrant,
    rejectTemporaryGrant,
  } = usePlatformData();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'users' | 'permissions' | 'activity'>('overview');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState<1 | 2>(1);
  const [inviteChallengeCode, setInviteChallengeCode] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [roleChangeUserId, setRoleChangeUserId] = useState('');
  const [requestedRole, setRequestedRole] = useState<Role>('coach');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [roleChangeRequests, setRoleChangeRequests] = useState<RoleChangeRequest[]>([]);

  const [csvOpen, setCsvOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('name,email,role\nSam Mentor,sam@learnerassurance.com,mentor');
  const [csvPreviewRows, setCsvPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  const [compareA, setCompareA] = useState('manager');
  const [compareB, setCompareB] = useState('mentor');
  const [sandboxRole, setSandboxRole] = useState('ydp');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('admin');
  const [bulkRole, setBulkRole] = useState<Role>('coach');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantRole, setGrantRole] = useState<Role>('manager');
  const [grantExpiry, setGrantExpiry] = useState('');

  const selectedProfileUser = users.find((u) => u.id === profileUserId) ?? null;

  function validateInviteInput() {
    const trimmedName = inviteName.trim();
    const trimmedEmail = inviteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedName.length < 3) return 'Full name must be at least 3 characters.';
    if (!emailRegex.test(trimmedEmail)) return 'Enter a valid email address.';
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) return 'A user with this email already exists.';
    return null;
  }

  useEffect(() => {
    if (!inviteOpen || inviteStep !== 2 || resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [inviteOpen, inviteStep, resendIn]);

  function validateCsvInput() {
    const rows = csvInput.split('\n').map((line) => line.trim()).filter(Boolean);
    const errors: string[] = [];
    const preview: CsvPreviewRow[] = [];
    const seenEmails = new Set<string>();

    if (rows.length <= 1) {
      setCsvErrors(['Add at least one CSV row after the header.']);
      setCsvPreviewRows([]);
      return;
    }

    rows.slice(1).forEach((line, idx) => {
      const [rawName, rawEmail, rawRole] = line.split(',').map((part) => part?.trim() ?? '');
      const lineNo = idx + 2;
      const email = rawEmail.toLowerCase();
      const role = rawRole.toLowerCase() as Role;

      if (!rawName || rawName.length < 3) errors.push(`Line ${lineNo}: name must be at least 3 characters.`);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`Line ${lineNo}: invalid email.`);
      if (!ALL_ROLES.includes(role)) errors.push(`Line ${lineNo}: role must be one of ${ALL_ROLES.join(', ')}.`);
      if (seenEmails.has(email)) errors.push(`Line ${lineNo}: duplicate email in upload (${email}).`);
      if (users.some((u) => u.email.toLowerCase() === email)) errors.push(`Line ${lineNo}: user already exists (${email}).`);

      seenEmails.add(email);
      if (rawName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && ALL_ROLES.includes(role) && rawName.length >= 3) {
        preview.push({ name: rawName, email, role });
      }
    });

    setCsvErrors(errors);
    setCsvPreviewRows(preview);
    if (errors.length === 0) addToast(`CSV validated with ${preview.length} importable users`, 'success');
  }

  function startInviteVerification() {
    const inviteError = validateInviteInput();
    if (inviteError) {
      addToast(inviteError, 'warning');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setInviteChallengeCode(code);
    setInviteCodeInput('');
    setResendIn(30);
    setInviteStep(2);
    addToast('Verification code sent to the invite requester.', 'info');
  }

  function completeInviteFlow() {
    if (inviteCodeInput !== inviteChallengeCode) {
      addToast('Verification code does not match.', 'warning');
      return;
    }
    addUser({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole });
    setInviteName('');
    setInviteEmail('');
    setInviteRole('admin');
    setInviteOpen(false);
    setInviteStep(1);
    setInviteChallengeCode('');
    setInviteCodeInput('');
    addToast('Invitation sent and verified.', 'success');
  }

  function submitRoleChangeRequest() {
    const target = users.find((u) => u.id === roleChangeUserId);
    if (!target) {
      addToast('Select a user before submitting a role change.', 'warning');
      return;
    }
    if (target.role === requestedRole) {
      addToast('Requested role must differ from current role.', 'warning');
      return;
    }
    if (roleChangeReason.trim().length < 10) {
      addToast('Provide a business reason with at least 10 characters.', 'warning');
      return;
    }
    const next: RoleChangeRequest = {
      id: crypto.randomUUID(),
      userId: target.id,
      userName: target.name,
      userEmail: target.email,
      currentRole: target.role,
      requestedRole,
      reason: roleChangeReason.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setRoleChangeRequests((prev) => [next, ...prev]);
    setRoleChangeOpen(false);
    setRoleChangeReason('');
    addToast('Role change request submitted for owner approval.', 'success');
  }

  function validateGrantInput() {
    const trimmedEmail = grantEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const today = new Date().toISOString().slice(0, 10);

    if (!emailRegex.test(trimmedEmail)) return 'Enter a valid email for the temporary grant.';
    if (!users.some((u) => u.email.toLowerCase() === trimmedEmail)) return 'Temporary grants can only be assigned to existing platform users.';
    if (!grantExpiry) return 'Provide an expiry date for the temporary grant.';
    if (grantExpiry <= today) return 'Expiry date must be in the future.';
    if (grants.some((g) => g.email.toLowerCase() === trimmedEmail && g.status === 'pending')) return 'There is already a pending grant for this email.';
    return null;
  }

  // Sync tab state with URL
  useEffect(() => {
    if (location.pathname.includes('/users')) setTab('users');
    else if (location.pathname.includes('/permissions')) setTab('permissions');
    else if (location.pathname.includes('/activity')) setTab('activity');
    else setTab('overview');
  }, [location.pathname]);

  function handleTabClick(tabId: 'overview' | 'users' | 'permissions' | 'activity') {
    const paths: Record<typeof tabId, string> = {
      overview: '/owner/dashboard',
      users: '/owner/users',
      permissions: '/owner/permissions',
      activity: '/owner/activity',
    };
    navigate(paths[tabId]);
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'activity', label: 'Activity Feed' },
  ] as const;

  const visibleUsers = useMemo(() => {
    const queryFilters = parseAdvancedQuery(userSearch);
    return users.filter((u) => {
      const roleFromControls = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
      const statusFromControls = userStatusFilter === 'all' ? true : u.status === userStatusFilter;
      const roleFromQuery = queryFilters.role ? u.role === queryFilters.role : true;
      const statusFromQuery = queryFilters.status ? u.status === queryFilters.status : true;
      const haystack = `${u.name} ${u.email}`.toLowerCase();
      const textFromQuery = queryFilters.text ? haystack.includes(queryFilters.text) : true;
      return roleFromControls && statusFromControls && roleFromQuery && statusFromQuery && textFromQuery;
    });
  }, [users, userRoleFilter, userStatusFilter, userSearch]);

  const selectedCount = selectedUsers.length;

  function toggleUserSelection(userId: string) {
    setSelectedUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  }

  function clearUserSelection() {
    setSelectedUsers([]);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Platform Owner</p>
          <h1 className="page-title">Owner Dashboard</h1>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'tab-btn-active' : ''}`}
            onClick={() => handleTabClick(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card"><h3>Active Learners</h3><p>1,248</p></div>
            <div className="kpi-card kpi-yellow"><h3>At Risk</h3><p>310</p></div>
            <div className="kpi-card kpi-red"><h3>Escalated</h3><p>74</p></div>
            <div className="kpi-card kpi-green"><h3>Compliance</h3><p>97.4%</p></div>
          </div>

          <div className="chart-grid">
            <div className="card">
              <h2 className="card-title">Compliance Trend (6 months)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={COMPLIANCE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis domain={[80, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
                  <Line type="monotone" dataKey="compliance" stroke="#45d0d4" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="card-title">Learner Status Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={STATUS_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
                  <Bar dataKey="value" fill="#0f3b72" radius={[6, 6, 0, 0]}
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Platform Users</h2>
            <button className="primary-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setInviteOpen(true)}>
              + Invite User
            </button>
          </div>
          <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="form-input" style={{ maxWidth: 220 }} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="all">All roles</option>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="learner">learner</option>
                <option value="employer">employer</option>
                <option value="mentor">mentor</option>
                <option value="manager">manager</option>
                <option value="institute">institute</option>
                <option value="ydp">ydp</option>
              </select>
              <select className="form-input" style={{ maxWidth: 220 }} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
              <input
                className="form-input"
                style={{ maxWidth: 340 }}
                placeholder="Advanced search: role:coach status:inactive john"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button className="secondary-button" onClick={() => { setUserRoleFilter('all'); setUserStatusFilter('all'); clearUserSelection(); }}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 12 }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {visibleUsers.length} users shown • {selectedCount} selected
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="action-btn" onClick={() => addToast(`Bulk invite resent to ${selectedCount} users`, 'success')} disabled={selectedCount === 0}>Resend Invite</button>
                <select className="form-input" style={{ maxWidth: 150 }} value={bulkRole} onChange={(e) => setBulkRole(e.target.value as Role)}>
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                  <option value="coach">coach</option>
                  <option value="learner">learner</option>
                  <option value="employer">employer</option>
                  <option value="mentor">mentor</option>
                  <option value="manager">manager</option>
                  <option value="institute">institute</option>
                  <option value="ydp">ydp</option>
                </select>
                <button
                  className="action-btn"
                  onClick={() => {
                    bulkAssignRole(selectedUsers, bulkRole);
                    addToast(`Assigned ${bulkRole} role to ${selectedCount} users`, 'info');
                    clearUserSelection();
                  }}
                  disabled={selectedCount === 0}
                >Assign Role</button>
                <button
                  className="action-btn"
                  onClick={() => setCsvOpen(true)}
                >CSV Import</button>
                <button
                  className="action-btn action-btn-danger"
                  onClick={() => {
                    bulkSuspend(selectedUsers);
                    addToast(`Suspended ${selectedCount} users`, 'warning');
                    clearUserSelection();
                  }}
                  disabled={selectedCount === 0}
                >Suspend</button>
              </div>
            </div>
          </div>
          <DataTable
            columns={[
              { key: 'select', label: 'Select', render: row => (
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(row.id)}
                  onChange={() => toggleUserSelection(row.id)}
                  aria-label={`Select ${row.name}`}
                />
              ) },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: row => <StatusBadge status={row.role} /> },
              { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
              { key: 'lastLogin', label: 'Last Login' },
              { key: 'id', label: 'Actions', render: row => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="action-btn" onClick={() => setProfileUserId(row.id)}>Profile</button>
                  <button
                    className="action-btn"
                    onClick={() => {
                      setRoleChangeUserId(row.id);
                      setRequestedRole(row.role === 'coach' ? 'manager' : 'coach');
                      setRoleChangeOpen(true);
                    }}
                  >Role Change</button>
                  <button className="action-btn" onClick={() => { suspendUser(row.id); addToast('User suspended', 'warning'); }}>Suspend</button>
                  <button className="action-btn action-btn-danger" onClick={() => { removeUser(row.id); addToast('User removed', 'error'); }}>Remove</button>
                </div>
              )},
            ]}
            data={visibleUsers}
            keyField="id"
            exportFilename="platform-users"
          />
        </div>
      )}

      {tab === 'permissions' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Role Permission Matrix</h2>
            <button className="primary-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => addToast('Permission change submitted for approval', 'success')}>
              Request Permission Change
            </button>
          </div>
          <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem' }}>Compare Roles</strong>
              <select className="form-input" style={{ maxWidth: 180 }} value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="learner">learner</option>
                <option value="employer">employer</option>
                <option value="mentor">mentor</option>
                <option value="manager">manager</option>
                <option value="institute">institute</option>
                <option value="ydp">ydp</option>
              </select>
              <span style={{ color: 'var(--text-secondary)' }}>vs</span>
              <select className="form-input" style={{ maxWidth: 180 }} value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="learner">learner</option>
                <option value="employer">employer</option>
                <option value="mentor">mentor</option>
                <option value="manager">manager</option>
                <option value="institute">institute</option>
                <option value="ydp">ydp</option>
              </select>
              <button className="secondary-button" onClick={() => addToast(`Comparing ${compareA} and ${compareB} access`, 'info')}>Run Compare</button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem' }}>Sandbox Preview</strong>
              <select className="form-input" style={{ maxWidth: 180 }} value={sandboxRole} onChange={(e) => setSandboxRole(e.target.value)}>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="learner">learner</option>
                <option value="employer">employer</option>
                <option value="mentor">mentor</option>
                <option value="manager">manager</option>
                <option value="institute">institute</option>
                <option value="ydp">ydp</option>
              </select>
              <button className="secondary-button" onClick={() => addToast(`Previewing UI as ${sandboxRole}`, 'info')}>Preview Access</button>
            </div>
          </div>
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Feature</th>
                  {['Owner', 'Admin', 'Coach', 'Learner', 'Employer', 'Mentor', 'Manager', 'Institute', 'YDP'].map(r => (
                    <th key={r} className="datatable-th" style={{ textAlign: 'center' }}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(row => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 500 }}>{row.feature}</td>
                    {(['owner', 'admin', 'coach', 'learner', 'employer', 'mentor', 'manager', 'institute', 'ydp'] as const).map(role => (
                      <td key={role} style={{ textAlign: 'center' }}>
                        <button
                          className="action-btn"
                          onClick={() => {
                            togglePermission(row.feature, role);
                            addToast(`Updated ${role} permission for ${row.feature}`, 'info');
                          }}
                        >
                          {row[role] ? '✓' : '–'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14, borderTop: '1px solid var(--input-border)', paddingTop: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Temporary Access Grants</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <input className="form-input" style={{ maxWidth: 220 }} placeholder="User email" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
              <select className="form-input" style={{ maxWidth: 220 }} value={grantRole} onChange={(e) => setGrantRole(e.target.value as Role)}>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="coach">coach</option>
                <option value="learner">learner</option>
                <option value="employer">employer</option>
                <option value="mentor">mentor</option>
                <option value="manager">manager</option>
                <option value="institute">institute</option>
                <option value="ydp">ydp</option>
              </select>
              <input className="form-input" style={{ maxWidth: 180 }} type="date" value={grantExpiry} onChange={(e) => setGrantExpiry(e.target.value)} />
              <button
                className="primary-button"
                style={{ padding: '10px 14px' }}
                onClick={() => {
                  const grantError = validateGrantInput();
                  if (grantError) {
                    addToast(grantError, 'warning');
                    return;
                  }
                  addTemporaryGrant({ email: grantEmail, role: grantRole, expiresAt: grantExpiry });
                  setGrantEmail('');
                  setGrantExpiry('');
                  addToast('Temporary access grant submitted', 'success');
                }}
              >
                Grant Temporary Access
              </button>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>All grants require owner approval and auto-expire at end date.</p>
            {grants.length > 0 && (
              <div className="datatable-scroll" style={{ marginTop: 12 }}>
                <table className="datatable">
                  <thead>
                    <tr>
                      <th className="datatable-th">Email</th>
                      <th className="datatable-th">Role</th>
                      <th className="datatable-th">Expires</th>
                      <th className="datatable-th">Status</th>
                      <th className="datatable-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grants.map((grant) => (
                      <tr key={grant.id}>
                        <td>{grant.email}</td>
                        <td><StatusBadge status={grant.role} /></td>
                        <td>{grant.expiresAt}</td>
                        <td><StatusBadge status={grant.status} /></td>
                        <td>
                          {grant.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="action-btn" onClick={() => { approveTemporaryGrant(grant.id); addToast('Temporary grant approved', 'success'); }}>
                                Approve
                              </button>
                              <button className="action-btn action-btn-danger" onClick={() => { rejectTemporaryGrant(grant.id); addToast('Temporary grant rejected', 'warning'); }}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ marginTop: 20, borderTop: '1px solid var(--input-border)', paddingTop: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Role Change Approval Queue</h3>
            {roleChangeRequests.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No pending role change requests.</p>
            ) : (
              <div className="datatable-scroll">
                <table className="datatable">
                  <thead>
                    <tr>
                      <th className="datatable-th">User</th>
                      <th className="datatable-th">Current Role</th>
                      <th className="datatable-th">Requested Role</th>
                      <th className="datatable-th">Reason</th>
                      <th className="datatable-th">Status</th>
                      <th className="datatable-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleChangeRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.userName}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{request.userEmail}</div>
                        </td>
                        <td><StatusBadge status={request.currentRole} /></td>
                        <td><StatusBadge status={request.requestedRole} /></td>
                        <td>{request.reason}</td>
                        <td><StatusBadge status={request.status} /></td>
                        <td>
                          {request.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="action-btn"
                                onClick={() => {
                                  bulkAssignRole([request.userId], request.requestedRole);
                                  setRoleChangeRequests((prev) => prev.map((row) => row.id === request.id ? { ...row, status: 'approved' } : row));
                                  addToast('Role change approved and applied.', 'success');
                                }}
                              >Approve</button>
                              <button
                                className="action-btn action-btn-danger"
                                onClick={() => {
                                  setRoleChangeRequests((prev) => prev.map((row) => row.id === request.id ? { ...row, status: 'rejected' } : row));
                                  addToast('Role change rejected.', 'warning');
                                }}
                              >Reject</button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ marginTop: 20, borderTop: '1px solid var(--input-border)', paddingTop: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Permission Bundles & Inheritance</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { name: 'Ops Manager Bundle', inherits: 'Coach Base', scopes: 'attendance.write, interventions.manage, reports.read' },
                { name: 'Mentor Bundle', inherits: 'Learner Support Base', scopes: 'feedback.write, evidence.review, coaching.logs' },
                { name: 'Institute Admin Bundle', inherits: 'Partner Base', scopes: 'cohorts.manage, timetables.manage, submissions.audit' },
              ].map((bundle) => (
                <div key={bundle.name} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{bundle.name}</p>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Inherits from: {bundle.inherits}</p>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Scopes: {bundle.scopes}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Inheritance graph: Owner → Admin → Manager/Institute → Coach/Mentor → Learner
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <h2 className="card-title">Recent Activity</h2>
          <div className="activity-feed">
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`activity-item activity-${n.type}`}>
                <span className="activity-dot" />
                <div>
                  <p className="activity-msg">{n.message}</p>
                  <p className="activity-time">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {LEARNERS.map(l => (
              <div key={l.id} className="activity-item activity-info">
                <span className="activity-dot" />
                <div>
                  <p className="activity-msg">{l.name} — attendance {l.attendance}%</p>
                  <p className="activity-time">Programme: {l.programme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inviteOpen && (
        <Modal
          title={inviteStep === 1 ? 'Invite User' : 'Verify Invite Request'}
          onClose={() => {
            setInviteOpen(false);
            setInviteStep(1);
          }}
          footer={
            <>
              {inviteStep === 1 ? (
                <button className="primary-button" onClick={startInviteVerification}>Continue</button>
              ) : (
                <button className="primary-button" onClick={completeInviteFlow}>Verify & Send Invite</button>
              )}
              <button className="secondary-button" onClick={() => {
                setInviteOpen(false);
                setInviteStep(1);
              }}>Cancel</button>
            </>
          }
        >
          {inviteStep === 1 ? (
            <>
              <label className="form-label">
                <span>Full name</span>
                <input type="text" className="form-input" placeholder="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
              </label>
              <label className="form-label">
                <span>Email address</span>
                <input type="email" className="form-input" placeholder="user@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </label>
              <label className="form-label">
                <span>Role</span>
                <select className="form-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}>
                  {ALL_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
            </>
          ) : (
            <>
              <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Verification code sent for invite approval. For demo: <strong>{inviteChallengeCode}</strong>
              </p>
              <label className="form-label">
                <span>Enter verification code</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="6-digit code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.trim())}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Resend available in {resendIn}s
                </span>
                <button
                  className="action-btn"
                  onClick={startInviteVerification}
                  disabled={resendIn > 0}
                >Resend Code</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {selectedProfileUser && (
        <Modal
          title={`User Profile • ${selectedProfileUser.name}`}
          onClose={() => setProfileUserId(null)}
          footer={
            <>
              <button className="primary-button" onClick={() => addToast(`Password reset sent to ${selectedProfileUser.email}`, 'success')}>Send Password Reset</button>
              <button className="secondary-button" onClick={() => setProfileUserId(null)}>Close</button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ margin: 0 }}><strong>Email:</strong> {selectedProfileUser.email}</p>
            <p style={{ margin: 0 }}><strong>Role:</strong> {selectedProfileUser.role}</p>
            <p style={{ margin: 0 }}><strong>Status:</strong> {selectedProfileUser.status}</p>
            <p style={{ margin: 0 }}><strong>Last Login:</strong> {selectedProfileUser.lastLogin}</p>
          </div>
          <h3 style={{ marginBottom: 8 }}>Activity Timeline</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              'Invite accepted and MFA configured',
              'Accessed learner portfolio views',
              'Submitted intervention feedback',
              'Viewed executive KPI summary',
            ].map((entry, idx) => (
              <div key={entry} style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: 10 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{entry}</p>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1} day(s) ago</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {roleChangeOpen && (
        <Modal
          title="Submit Role Change Request"
          onClose={() => setRoleChangeOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={submitRoleChangeRequest}>Submit for Approval</button>
              <button className="secondary-button" onClick={() => setRoleChangeOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label">
            <span>User</span>
            <select className="form-input" value={roleChangeUserId} onChange={(e) => setRoleChangeUserId(e.target.value)}>
              <option value="">Select user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Requested Role</span>
            <select className="form-input" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value as Role)}>
              {ALL_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className="form-label">
            <span>Reason</span>
            <textarea
              className="form-input"
              rows={3}
              value={roleChangeReason}
              onChange={(e) => setRoleChangeReason(e.target.value)}
              placeholder="Business justification and expected duration"
            />
          </label>
        </Modal>
      )}

      {csvOpen && (
        <Modal
          title="Bulk CSV User Import"
          onClose={() => setCsvOpen(false)}
          footer={
            <>
              <button className="secondary-button" onClick={validateCsvInput}>Validate File</button>
              <button
                className="primary-button"
                onClick={() => {
                  if (csvErrors.length > 0) {
                    addToast('Resolve CSV errors before importing.', 'warning');
                    return;
                  }
                  csvPreviewRows.forEach((row) => addUser(row));
                  addToast(`Imported ${csvPreviewRows.length} users`, 'success');
                  setCsvOpen(false);
                  setCsvPreviewRows([]);
                  setCsvErrors([]);
                }}
              >Import Valid Rows</button>
            </>
          }
        >
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Use columns: name,email,role</p>
          <textarea
            className="form-input"
            rows={8}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
          />
          {csvErrors.length > 0 && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: 'color-mix(in srgb, #dc2626 12%, var(--surface))' }}>
              {csvErrors.map((error) => <p key={error} style={{ margin: '2px 0', fontSize: '0.84rem' }}>{error}</p>)}
            </div>
          )}
          {csvPreviewRows.length > 0 && (
            <div className="datatable-scroll" style={{ marginTop: 10 }}>
              <table className="datatable">
                <thead>
                  <tr>
                    <th className="datatable-th">Name</th>
                    <th className="datatable-th">Email</th>
                    <th className="datatable-th">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewRows.map((row) => (
                    <tr key={row.email}>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td><StatusBadge status={row.role} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
