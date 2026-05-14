import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { InterventionRisk, InterventionStatus, InterventionCategory, InterventionResolution } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

type InterventionForm = {
  learner: string;
  cohort: string;
  risk: InterventionRisk;
  category: InterventionCategory;
  owner: string;
  dueDate: string;
  resolution: InterventionResolution;
  notes: string;
};

const EMPTY_FORM: InterventionForm = {
  learner: '',
  cohort: '',
  risk: 'medium',
  category: 'Attendance',
  owner: 'Programme Success Lead',
  dueDate: '',
  resolution: 'none',
  notes: '',
};

export default function OwnerInterventionsPage() {
  const { addToast } = useToast();
  const { interventionCases, addInterventionCase, updateInterventionCase, updateInterventionStatus } = usePlatformData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InterventionStatus>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | InterventionRisk>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | InterventionCategory>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'sla-alert' | 'due-soon'>('all');
  const [activePreset, setActivePreset] = useState<'all' | 'high-priority' | 'overdue' | 'due-soon'>('all');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [bulkOwner, setBulkOwner] = useState('Programme Success Lead');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [selectedLearnerForLookup, setSelectedLearnerForLookup] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InterventionForm>(EMPTY_FORM);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const slaAlertDate = useMemo(() => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), []);
  const soonDate = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), []);

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interventionCases.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (riskFilter !== 'all' && entry.risk !== riskFilter) return false;
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      if (dueFilter === 'sla-alert' && (entry.status === 'resolved' || entry.dueDate > slaAlertDate)) return false;
      if (dueFilter === 'due-soon' && (entry.status === 'resolved' || entry.dueDate < today || entry.dueDate > soonDate)) return false;
      if (!q) return true;
      return `${entry.learner} ${entry.cohort} ${entry.owner} ${entry.category} ${entry.notes}`.toLowerCase().includes(q);
    });
  }, [categoryFilter, dueFilter, interventionCases, query, riskFilter, slaAlertDate, soonDate, statusFilter, today]);

  const sortedCases = useMemo(
    () => [...filteredCases].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filteredCases],
  );

  const filteredIds = useMemo(() => sortedCases.map((entry) => entry.id), [sortedCases]);

  const allFilteredSelected = useMemo(() => {
    if (filteredIds.length === 0) return false;
    return filteredIds.every((id) => selectedCaseIds.includes(id));
  }, [filteredIds, selectedCaseIds]);

  const priorityQueue = useMemo(
    () => interventionCases
      .filter((entry) => entry.risk === 'high' || entry.status === 'overdue')
      .filter((entry) => entry.status !== 'resolved')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5),
    [interventionCases],
  );

  const ownerWorkload = useMemo(() => {
    const workload: Record<string, { total: number; open: number; inProgress: number; resolved: number }> = {};
    interventionCases.forEach((entry) => {
      if (!workload[entry.owner]) {
        workload[entry.owner] = { total: 0, open: 0, inProgress: 0, resolved: 0 };
      }
      workload[entry.owner].total += 1;
      if (entry.status === 'open') workload[entry.owner].open += 1;
      if (entry.status === 'in-progress') workload[entry.owner].inProgress += 1;
      if (entry.status === 'resolved') workload[entry.owner].resolved += 1;
    });
    return Object.entries(workload).map(([owner, stats]) => ({ owner, ...stats })).sort((a, b) => b.total - a.total);
  }, [interventionCases]);

  const learnerCaseLookup = useMemo(() => {
    if (!selectedLearnerForLookup.trim()) return [];
    const q = selectedLearnerForLookup.trim().toLowerCase();
    return interventionCases.filter((entry) => entry.learner.toLowerCase().includes(q));
  }, [interventionCases, selectedLearnerForLookup]);

  const durationMetrics = useMemo(() => {
    const resolved = interventionCases.filter((entry) => entry.status === 'resolved' && entry.resolvedAt);
    const durations = resolved.map((entry) => {
      const opened = new Date(entry.openedAt).getTime();
      const closed = new Date(entry.resolvedAt!).getTime();
      return Math.floor((closed - opened) / (1000 * 60 * 60 * 24));
    });
    const avgDays = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const successCount = interventionCases.filter((entry) => entry.resolution === 'successful').length;
    const partialCount = interventionCases.filter((entry) => entry.resolution === 'partial').length;
    const successRate = resolved.length > 0 ? Math.round((successCount / resolved.length) * 100) : 0;
    return { avgDays, successRate, successCount, partialCount, resolvedCount: resolved.length };
  }, [interventionCases]);

  const kpis = useMemo(() => {
    const open = interventionCases.filter((entry) => entry.status === 'open').length;
    const inProgress = interventionCases.filter((entry) => entry.status === 'in-progress').length;
    const overdue = interventionCases.filter((entry) => entry.status === 'overdue').length;
    const resolved = interventionCases.filter((entry) => entry.status === 'resolved').length;
    const highRiskOpen = interventionCases.filter((entry) => entry.risk === 'high' && entry.status !== 'resolved').length;
    const slaAlerts = interventionCases.filter((entry) => entry.status !== 'resolved' && entry.dueDate <= slaAlertDate).length;
    const dueSoon = interventionCases.filter((entry) => entry.status !== 'resolved' && entry.dueDate >= today && entry.dueDate <= soonDate).length;
    return { open, inProgress, overdue, resolved, highRiskOpen, slaAlerts, dueSoon };
  }, [interventionCases, slaAlertDate, soonDate, today]);

  function hasSlaAlert(dueDate: string, status: InterventionStatus) {
    return status !== 'resolved' && dueDate <= slaAlertDate;
  }

  function applyPreset(preset: 'all' | 'high-priority' | 'overdue' | 'due-soon') {
    setActivePreset(preset);
    setQuery('');
    if (preset === 'all') {
      setStatusFilter('all');
      setRiskFilter('all');
      setCategoryFilter('all');
      setDueFilter('all');
      return;
    }
    if (preset === 'high-priority') {
      setStatusFilter('all');
      setRiskFilter('high');
      setCategoryFilter('all');
      setDueFilter('all');
      return;
    }
    if (preset === 'overdue') {
      setStatusFilter('overdue');
      setRiskFilter('all');
      setCategoryFilter('all');
      setDueFilter('all');
      return;
    }
    setStatusFilter('all');
    setRiskFilter('all');
    setCategoryFilter('all');
    setDueFilter('due-soon');
  }

  function toggleCaseSelection(id: string) {
    setSelectedCaseIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  }

  function toggleAllFilteredSelection() {
    setSelectedCaseIds((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      const merged = new Set([...prev, ...filteredIds]);
      return Array.from(merged);
    });
  }

  function applyBulkStatus(status: InterventionStatus) {
    if (selectedCaseIds.length === 0) {
      addToast('Select at least one case first.', 'warning');
      return;
    }
    selectedCaseIds.forEach((id) => {
      updateInterventionStatus(id, status);
      if (status === 'resolved') {
        updateInterventionCase(id, { resolvedAt: new Date().toISOString() });
      }
    });
    addToast(`Updated ${selectedCaseIds.length} case(s) to ${status}.`, 'success');
    setSelectedCaseIds([]);
  }

  function applyBulkOwner() {
    const owner = bulkOwner.trim();
    if (selectedCaseIds.length === 0) {
      addToast('Select at least one case first.', 'warning');
      return;
    }
    if (owner.length < 3) {
      addToast('Owner must be at least 3 characters.', 'warning');
      return;
    }
    selectedCaseIds.forEach((id) => updateInterventionCase(id, { owner }));
    addToast(`Assigned owner to ${selectedCaseIds.length} case(s).`, 'success');
    setSelectedCaseIds([]);
  }

  function applyBulkDueDate() {
    if (selectedCaseIds.length === 0) {
      addToast('Select at least one case first.', 'warning');
      return;
    }
    if (!bulkDueDate || bulkDueDate < today) {
      addToast('Select a valid due date not in the past.', 'warning');
      return;
    }
    selectedCaseIds.forEach((id) => updateInterventionCase(id, { dueDate: bulkDueDate }));
    addToast(`Updated due date for ${selectedCaseIds.length} case(s).`, 'success');
    setSelectedCaseIds([]);
  }

  function exportCasesCsv(entries: typeof interventionCases, filenamePrefix: string) {
    const header = ['Learner', 'Cohort', 'Risk', 'Category', 'Status', 'Owner', 'Due Date', 'Opened', 'Resolution', 'SLA Alert', 'Notes'];
    const csvContent = [header, ...entries.map((entry) => [
      entry.learner,
      entry.cohort,
      entry.risk,
      entry.category,
      entry.status,
      entry.owner,
      entry.dueDate,
      new Date(entry.openedAt).toLocaleDateString(),
      entry.resolution,
      hasSlaAlert(entry.dueDate, entry.status) ? 'Yes' : 'No',
      entry.notes,
    ])]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportSelectedCasesCsv() {
    if (selectedCaseIds.length === 0) {
      addToast('Select at least one case first.', 'warning');
      return;
    }
    exportCasesCsv(interventionCases.filter((entry) => selectedCaseIds.includes(entry.id)), 'intervention-selected-cases');
    addToast('Selected intervention cases exported to CSV.', 'success');
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, dueDate: today });
    setModalOpen(true);
  }

  function openEditModal(id: string) {
    const entry = interventionCases.find((item) => item.id === id);
    if (!entry) return;
    setEditingId(id);
    setForm({
      learner: entry.learner,
      cohort: entry.cohort,
      risk: entry.risk,
      category: entry.category,
      owner: entry.owner,
      dueDate: entry.dueDate,
      resolution: entry.resolution,
      notes: entry.notes,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function saveInterventionCase() {
    const learner = form.learner.trim();
    const cohort = form.cohort.trim();
    const owner = form.owner.trim();
    if (learner.length < 3 || cohort.length < 3 || owner.length < 3) {
      addToast('Learner, cohort, and owner fields must be at least 3 characters.', 'warning');
      return;
    }
    if (!form.dueDate) {
      addToast('Select a due date.', 'warning');
      return;
    }
    if (editingId) {
      updateInterventionCase(editingId, {
        learner,
        cohort,
        risk: form.risk,
        category: form.category,
        owner,
        dueDate: form.dueDate,
        resolution: form.resolution,
        notes: form.notes.trim(),
      });
      addToast('Intervention case updated.', 'success');
    } else {
      addInterventionCase({
        learner,
        cohort,
        risk: form.risk,
        category: form.category,
        owner,
        dueDate: form.dueDate,
        resolution: form.resolution,
        notes: form.notes.trim(),
      });
      addToast('Intervention case created.', 'success');
    }
    closeModal();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Interventions</h1>
        </div>
        <button className="primary-button" onClick={openCreateModal}>+ New Case</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Open Cases</h3><p>{kpis.open}</p></div>
        <div className="kpi-card kpi-yellow"><h3>In Progress</h3><p>{kpis.inProgress}</p></div>
        <div className="kpi-card kpi-red"><h3>Overdue</h3><p>{kpis.overdue}</p></div>
        <div className="kpi-card kpi-green"><h3>Resolved</h3><p>{kpis.resolved}</p></div>
        <div className="kpi-card kpi-red"><h3>High Risk Active</h3><p>{kpis.highRiskOpen}</p></div>
        <div className="kpi-card kpi-yellow"><h3>SLA Alerts (48h)</h3><p>{kpis.slaAlerts}</p></div>
        <div className="kpi-card"><h3>Due Soon (7d)</h3><p>{kpis.dueSoon}</p></div>
        <div className="kpi-card kpi-green"><h3>Avg Days to Resolve</h3><p>{durationMetrics.avgDays}</p></div>
        <div className="kpi-card kpi-green"><h3>Resolution Success Rate</h3><p>{durationMetrics.successRate}%</p></div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">Owner Workload Summary</h2>
        </div>
        <div className="datatable-scroll">
          <table className="datatable" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th className="datatable-th">Owner</th>
                <th className="datatable-th">Total Cases</th>
                <th className="datatable-th">Open</th>
                <th className="datatable-th">In Progress</th>
                <th className="datatable-th">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {ownerWorkload.map((row) => (
                <tr key={row.owner}>
                  <td><strong>{row.owner}</strong></td>
                  <td>{row.total}</td>
                  <td>{row.open}</td>
                  <td>{row.inProgress}</td>
                  <td>{row.resolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">Resolution Performance</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Resolved</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{durationMetrics.resolvedCount}</p>
          </div>
          <div style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>✓ Successful</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{durationMetrics.successCount}</p>
          </div>
          <div style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>⚠ Partial Success</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{durationMetrics.partialCount}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">Quick Learner Case Lookup</h2>
        </div>
        <input
          className="form-input"
          placeholder="Search learner name to see all intervention cases"
          value={selectedLearnerForLookup}
          onChange={(event) => setSelectedLearnerForLookup(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        {learnerCaseLookup.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {learnerCaseLookup.map((entry) => (
              <div key={entry.id} style={{ border: '1px solid var(--input-border)', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{entry.cohort}</p>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {entry.category} • Due: {entry.dueDate}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <StatusBadge status={entry.risk} />
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedLearnerForLookup.trim() && learnerCaseLookup.length === 0 && (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No intervention cases found for this learner.</p>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">Priority Intervention Queue</h2>
        </div>
        {priorityQueue.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No high-risk or overdue active cases right now.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {priorityQueue.map((entry) => (
              <div key={entry.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{entry.learner}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <StatusBadge status={entry.risk} />
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  Cohort: {entry.cohort} • Category: {entry.category} • Owner: {entry.owner} • Due: {entry.dueDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Platform Risk Cases</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | InterventionStatus)} style={{ minWidth: 150 }}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="overdue">Overdue</option>
              <option value="resolved">Resolved</option>
            </select>
            <select className="form-input" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as 'all' | InterventionRisk)} style={{ minWidth: 130 }}>
              <option value="all">All risks</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="form-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | InterventionCategory)} style={{ minWidth: 150 }}>
              <option value="all">All categories</option>
              <option value="Attendance">Attendance</option>
              <option value="Performance">Performance</option>
              <option value="Behaviour">Behaviour</option>
              <option value="Engagement">Engagement</option>
              <option value="Finance">Finance</option>
            </select>
            <select className="form-input" value={dueFilter} onChange={(event) => setDueFilter(event.target.value as 'all' | 'sla-alert' | 'due-soon')} style={{ minWidth: 150 }}>
              <option value="all">All due windows</option>
              <option value="sla-alert">SLA 48h</option>
              <option value="due-soon">Due in 7 days</option>
            </select>
            <button className="secondary-button" onClick={() => applyPreset('high-priority')} style={{ borderColor: activePreset === 'high-priority' ? 'var(--brand)' : undefined }}>High Priority Preset</button>
            <button className="secondary-button" onClick={() => applyPreset('overdue')} style={{ borderColor: activePreset === 'overdue' ? 'var(--brand)' : undefined }}>Overdue Preset</button>
            <button className="secondary-button" onClick={() => applyPreset('due-soon')} style={{ borderColor: activePreset === 'due-soon' ? 'var(--brand)' : undefined }}>Due Soon Preset</button>
            <button className="secondary-button" onClick={() => applyPreset('all')}>Reset Preset</button>
          </div>
        </div>
        <input
          className="form-input"
          placeholder="Search learner, cohort, owner, category, or notes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="action-btn" onClick={() => applyBulkStatus('in-progress')} disabled={selectedCaseIds.length === 0}>Start Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('overdue')} disabled={selectedCaseIds.length === 0}>Mark Overdue Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('resolved')} disabled={selectedCaseIds.length === 0}>Resolve Selected</button>
          <button className="action-btn" onClick={exportSelectedCasesCsv} disabled={selectedCaseIds.length === 0}>Export Selected CSV</button>
          <input
            className="form-input"
            aria-label="Bulk owner"
            value={bulkOwner}
            onChange={(event) => setBulkOwner(event.target.value)}
            style={{ width: 220 }}
            placeholder="Bulk assign owner"
          />
          <button className="action-btn" onClick={applyBulkOwner} disabled={selectedCaseIds.length === 0}>Assign Owner Selected</button>
          <input
            className="form-input"
            aria-label="Bulk due date"
            type="date"
            min={today}
            value={bulkDueDate}
            onChange={(event) => setBulkDueDate(event.target.value)}
            style={{ width: 190 }}
          />
          <button className="action-btn" onClick={applyBulkDueDate} disabled={selectedCaseIds.length === 0}>Set Due Date Selected</button>
          <button className="action-btn" onClick={() => setSelectedCaseIds([])} disabled={selectedCaseIds.length === 0}>Clear Selection</button>
          <p style={{ margin: 0, color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.86rem' }}>{selectedCaseIds.length} selected</p>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th" style={{ width: 42 }}>
                  <input
                    aria-label="Select all filtered intervention cases"
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFilteredSelection}
                  />
                </th>
                <th className="datatable-th">Learner</th>
                <th className="datatable-th">Cohort</th>
                <th className="datatable-th">Category</th>
                <th className="datatable-th">Risk</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Resolution</th>
                <th className="datatable-th">Assigned Owner</th>
                <th className="datatable-th">Due Date</th>
                <th className="datatable-th">Opened</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      aria-label={`Select case ${row.learner}`}
                      type="checkbox"
                      checked={selectedCaseIds.includes(row.id)}
                      onChange={() => toggleCaseSelection(row.id)}
                    />
                  </td>
                  <td>{row.learner}</td>
                  <td>{row.cohort}</td>
                  <td>{row.category}</td>
                  <td><StatusBadge status={row.risk} /></td>
                  <td>
                    <select className="form-input" value={row.status} onChange={(event) => updateInterventionStatus(row.id, event.target.value as InterventionStatus)}>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="overdue">Overdue</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{row.resolution}</td>
                  <td>{row.owner}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span>{row.dueDate}</span>
                      {hasSlaAlert(row.dueDate, row.status) ? (
                        <span style={{ color: 'var(--status-warning)', fontSize: '0.8rem', fontWeight: 700 }}>SLA 48h</span>
                      ) : null}
                    </div>
                  </td>
                  <td>{new Date(row.openedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => openEditModal(row.id)}>Edit</button>
                      <button className="action-btn" onClick={() => addToast(row.notes || 'No notes for this case.', 'info')}>Notes</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Update Intervention Case' : 'Create Intervention Case'}
          onClose={closeModal}
          footer={(
            <>
              <button className="secondary-button" onClick={closeModal}>Cancel</button>
              <button className="primary-button" onClick={saveInterventionCase}>{editingId ? 'Save Case' : 'Create Case'}</button>
            </>
          )}
        >
          <label className="form-label">
            Learner
            <input className="form-input" value={form.learner} onChange={(event) => setForm((prev) => ({ ...prev, learner: event.target.value }))} placeholder="Learner full name" />
          </label>
          <label className="form-label">
            Cohort
            <input className="form-input" value={form.cohort} onChange={(event) => setForm((prev) => ({ ...prev, cohort: event.target.value }))} placeholder="Cohort name" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Category
              <select className="form-input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as InterventionCategory }))}>
                <option value="Attendance">Attendance</option>
                <option value="Performance">Performance</option>
                <option value="Behaviour">Behaviour</option>
                <option value="Engagement">Engagement</option>
                <option value="Finance">Finance</option>
              </select>
            </label>
            <label className="form-label">
              Risk
              <select className="form-input" value={form.risk} onChange={(event) => setForm((prev) => ({ ...prev, risk: event.target.value as InterventionRisk }))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="form-label">
              Owner
              <input className="form-input" value={form.owner} onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))} />
            </label>
            <label className="form-label">
              Due date
              <input type="date" min={today} className="form-input" value={form.dueDate} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
            </label>
            <label className="form-label">
              Resolution
              <select className="form-input" value={form.resolution} onChange={(event) => setForm((prev) => ({ ...prev, resolution: event.target.value as InterventionResolution }))}>
                <option value="none">None (In Progress)</option>
                <option value="successful">Successful</option>
                <option value="partial">Partial Success</option>
                <option value="unsuccessful">Unsuccessful</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            Notes
            <textarea className="form-input" rows={4} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Describe risk factors, action plan, and follow-ups." />
          </label>
        </Modal>
      )}
    </div>
  );
}
