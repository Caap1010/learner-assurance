import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { ComplianceItem, ComplianceStatus } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function scoreColor(value: number) {
  if (value >= 90) return 'color-mix(in srgb, #10b981 26%, var(--surface))';
  if (value >= 82) return 'color-mix(in srgb, #f59e0b 26%, var(--surface))';
  return 'color-mix(in srgb, #dc2626 24%, var(--surface))';
}

function severityFromGap(item: ComplianceItem) {
  const gap = item.missingEvidence + item.missingAppraisals;
  if (item.status === 'escalated' || gap >= 10) return 'high';
  if (item.status === 'at-risk' || gap >= 4) return 'medium';
  return 'low';
}

export default function OwnerCompliancePage() {
  const { addToast } = useToast();
  const {
    cohorts,
    complianceItems,
    createComplianceItem,
    updateComplianceStatus,
    createRemediationPlan,
    resolveRemediationPlan,
    contractDocuments,
    addContractDocument,
    updateContractDocumentStatus,
    complianceReportSchedules,
    upsertComplianceReportSchedule,
    runComplianceReportNow,
  } = usePlatformData();
  const [statusFilter, setStatusFilter] = useState<'all' | ComplianceStatus>('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'due-soon' | 'future'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<'all' | 'audit' | 'due-soon' | 'escalations'>('all');
  const [planItemId, setPlanItemId] = useState<string | null>(null);
  const [planOwner, setPlanOwner] = useState('Programme Success Lead');
  const [planDue, setPlanDue] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Contract' | 'Accreditation' | 'Policy' | 'Compliance Pack'>('Contract');
  const [docOwner, setDocOwner] = useState('Compliance Officer');
  const [docLinkedEntity, setDocLinkedEntity] = useState('');
  const [docExpiresAt, setDocExpiresAt] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [scheduleAudience, setScheduleAudience] = useState('Platform Owner');
  const [scheduleFormat, setScheduleFormat] = useState<'PDF' | 'CSV' | 'XLSX'>('PDF');
  const [scheduleNextRun, setScheduleNextRun] = useState('');
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [controlArea, setControlArea] = useState('');
  const [controlOwner, setControlOwner] = useState('Compliance Officer');
  const [controlDue, setControlDue] = useState('');
  const [controlStatus, setControlStatus] = useState<ComplianceStatus>('on-track');
  const [controlLinkedCohortId, setControlLinkedCohortId] = useState('');
  const [controlMissingEvidence, setControlMissingEvidence] = useState('0');
  const [controlMissingAppraisals, setControlMissingAppraisals] = useState('0');
  const [bulkPlanModalOpen, setBulkPlanModalOpen] = useState(false);
  const [bulkPlanOwner, setBulkPlanOwner] = useState('Programme Success Lead');
  const [bulkPlanDue, setBulkPlanDue] = useState('');
  const [bulkPlanNotes, setBulkPlanNotes] = useState('');
  const minPlanDueDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minScheduleDateTime = useMemo(() => toDateTimeLocalValue(new Date()), []);
  const canSavePlan = useMemo(() => {
    if (!planItemId) return false;
    if (planOwner.trim().length < 3) return false;
    if (!planDue) return false;
    return planDue >= minPlanDueDate;
  }, [minPlanDueDate, planDue, planItemId, planOwner]);
  const canSaveDocument = useMemo(() => {
    if (docTitle.trim().length < 4) return false;
    if (docOwner.trim().length < 3) return false;
    if (docLinkedEntity.trim().length < 2) return false;
    if (!docExpiresAt) return false;
    return docExpiresAt >= minPlanDueDate;
  }, [docExpiresAt, docLinkedEntity, docOwner, docTitle, minPlanDueDate]);
  const canSaveReportSchedule = useMemo(() => {
    if (scheduleName.trim().length < 4) return false;
    if (scheduleAudience.trim().length < 3) return false;
    if (!scheduleNextRun) return false;
    const runTimestamp = Date.parse(scheduleNextRun);
    return Number.isFinite(runTimestamp) && runTimestamp > Date.now();
  }, [scheduleAudience, scheduleName, scheduleNextRun]);
  const canSaveControl = useMemo(() => {
    if (controlArea.trim().length < 4) return false;
    if (controlOwner.trim().length < 3) return false;
    if (!controlDue || controlDue < minPlanDueDate) return false;
    const evidence = Number(controlMissingEvidence);
    const appraisals = Number(controlMissingAppraisals);
    if (!Number.isInteger(evidence) || evidence < 0) return false;
    if (!Number.isInteger(appraisals) || appraisals < 0) return false;
    return true;
  }, [controlArea, controlDue, controlMissingAppraisals, controlMissingEvidence, controlOwner, minPlanDueDate]);
  const canSaveBulkPlan = useMemo(() => {
    if (selectedControlIds.length === 0) return false;
    if (bulkPlanOwner.trim().length < 3) return false;
    if (!bulkPlanDue) return false;
    return bulkPlanDue >= minPlanDueDate;
  }, [bulkPlanDue, bulkPlanOwner, minPlanDueDate, selectedControlIds.length]);

  const cohortNameMap = useMemo(
    () => Object.fromEntries(cohorts.map((cohort) => [cohort.id, cohort.name])),
    [cohorts],
  );

  const owners = useMemo(
    () => Array.from(new Set(complianceItems.map((item) => item.owner))).sort((a, b) => a.localeCompare(b)),
    [complianceItems],
  );

  const filteredItems = useMemo(
    () => complianceItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      if (dueFilter === 'overdue' && item.due >= minPlanDueDate) return false;
      if (dueFilter === 'due-soon' && (item.due < minPlanDueDate || item.due > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))) return false;
      if (dueFilter === 'future' && item.due <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)) return false;
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const cohortName = item.linkedCohortId ? (cohortNameMap[item.linkedCohortId] ?? item.linkedCohortId) : '';
        const haystack = `${item.area} ${item.owner} ${item.status} ${cohortName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }),
    [cohortNameMap, complianceItems, dueFilter, minPlanDueDate, ownerFilter, searchQuery, statusFilter],
  );

  const filteredIds = useMemo(() => filteredItems.map((item) => item.id), [filteredItems]);

  const allFilteredSelected = useMemo(() => {
    if (filteredIds.length === 0) return false;
    return filteredIds.every((id) => selectedControlIds.includes(id));
  }, [filteredIds, selectedControlIds]);

  const priorityQueue = useMemo(
    () => complianceItems
      .filter((item) => item.status === 'escalated' || item.status === 'at-risk')
      .sort((a, b) => a.due.localeCompare(b.due))
      .slice(0, 5),
    [complianceItems],
  );

  const gapDetector = useMemo(
    () => complianceItems
      .filter((item) => item.missingEvidence > 0 || item.missingAppraisals > 0)
      .map((item) => ({
        id: item.id,
        cohort: item.linkedCohortId ? (cohortNameMap[item.linkedCohortId] ?? item.linkedCohortId) : 'Cross-programme',
        missingEvidence: item.missingEvidence,
        missingAppraisals: item.missingAppraisals,
        severity: severityFromGap(item),
      })),
    [cohortNameMap, complianceItems],
  );

  const kpis = useMemo(() => {
    const openAudits = complianceItems.filter((item) => item.status !== 'completed').length;
    const pendingEvidence = complianceItems.reduce((acc, item) => acc + item.missingEvidence, 0);
    const escalations = complianceItems.filter((item) => item.status === 'escalated').length;
    const overdue = complianceItems.filter((item) => item.due < minPlanDueDate && item.status !== 'completed').length;
    const dueSoon = complianceItems.filter((item) => item.due >= minPlanDueDate && item.due <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) && item.status !== 'completed').length;
    const onTrackCount = complianceItems.filter((item) => item.status === 'on-track' || item.status === 'completed').length;
    const slaCompliance = complianceItems.length === 0 ? 100 : (onTrackCount / complianceItems.length) * 100;
    return {
      openAudits,
      pendingEvidence,
      escalations,
      overdue,
      dueSoon,
      slaCompliance: slaCompliance.toFixed(1),
    };
  }, [complianceItems, minPlanDueDate]);

  const heatmapRows = useMemo(() => {
    const byType = (type: 'institute' | 'employer' | 'mentor') => {
      const rows = cohorts.filter((cohort) => {
        if (type === 'institute') return Boolean(cohort.institute);
        if (type === 'employer') return Boolean(cohort.employer);
        return true;
      });
      if (rows.length === 0) return 100;
      return Math.round(rows.reduce((acc, cohort) => {
        if (cohort.health === 'on-track' || cohort.health === 'completed') return acc + 95;
        if (cohort.health === 'at-risk') return acc + 86;
        return acc + 75;
      }, 0) / rows.length);
    };

    return [
      { area: 'Attendance', institute: byType('institute'), employer: byType('employer'), mentor: byType('mentor') - 3 },
      { area: 'Evidence', institute: byType('institute') - 4, employer: byType('employer') - 2, mentor: byType('mentor') - 6 },
      { area: 'Interventions', institute: byType('institute') - 8, employer: byType('employer') - 6, mentor: byType('mentor') - 9 },
      { area: 'Appraisals', institute: byType('institute') - 5, employer: byType('employer') - 3, mentor: byType('mentor') - 4 },
    ];
  }, [cohorts]);

  function openPlan(item: ComplianceItem) {
    setPlanItemId(item.id);
    setPlanOwner(item.remediationOwner ?? 'Programme Success Lead');
    setPlanDue(item.remediationDue ?? '');
    setPlanNotes(item.remediationNotes ?? '');
  }

  function savePlan() {
    if (!planItemId) return;
    if (!planDue) {
      addToast('Select a remediation due date.', 'warning');
      return;
    }
    if (planOwner.trim().length < 3) {
      addToast('Remediation owner must be at least 3 characters.', 'warning');
      return;
    }
    if (planDue < minPlanDueDate) {
      addToast('Remediation due date cannot be in the past.', 'warning');
      return;
    }
    createRemediationPlan(planItemId, {
      owner: planOwner.trim() || 'Programme Success Lead',
      due: planDue,
      notes: planNotes.trim(),
    });
    updateComplianceStatus(planItemId, 'at-risk');
    setPlanItemId(null);
    addToast('Remediation plan recorded.', 'success');
  }

  function saveDocument() {
    const title = docTitle.trim();
    const owner = docOwner.trim();
    const linkedEntity = docLinkedEntity.trim();
    if (!title || !owner || !linkedEntity || !docExpiresAt) {
      addToast('Complete all document vault fields.', 'warning');
      return;
    }
    if (title.length < 4) {
      addToast('Document title must be at least 4 characters.', 'warning');
      return;
    }
    if (owner.length < 3) {
      addToast('Owner must be at least 3 characters.', 'warning');
      return;
    }
    if (linkedEntity.length < 2) {
      addToast('Linked entity must be at least 2 characters.', 'warning');
      return;
    }
    if (docExpiresAt < minPlanDueDate) {
      addToast('Expiry date cannot be in the past for newly uploaded documents.', 'warning');
      return;
    }
    addContractDocument({
      title,
      category: docCategory,
      owner,
      linkedEntity,
      expiresAt: docExpiresAt,
    });
    setDocModalOpen(false);
    setDocTitle('');
    setDocOwner('Compliance Officer');
    setDocLinkedEntity('');
    setDocExpiresAt('');
    setDocCategory('Contract');
    addToast('Contract document added to vault.', 'success');
  }

  function saveReportSchedule() {
    const name = scheduleName.trim();
    const audience = scheduleAudience.trim();
    if (!name || !audience || !scheduleNextRun) {
      addToast('Complete all report schedule fields.', 'warning');
      return;
    }
    if (name.length < 4) {
      addToast('Schedule name must be at least 4 characters.', 'warning');
      return;
    }
    if (audience.length < 3) {
      addToast('Audience must be at least 3 characters.', 'warning');
      return;
    }
    const runTimestamp = Date.parse(scheduleNextRun);
    if (!Number.isFinite(runTimestamp)) {
      addToast('Enter a valid next run date and time.', 'warning');
      return;
    }
    if (runTimestamp <= Date.now()) {
      addToast('Next run must be in the future.', 'warning');
      return;
    }
    upsertComplianceReportSchedule({
      name,
      frequency: scheduleFrequency,
      audience,
      format: scheduleFormat,
      status: 'active',
      nextRun: new Date(scheduleNextRun).toISOString(),
    });
    setScheduleModalOpen(false);
    setScheduleName('');
    setScheduleAudience('Platform Owner');
    setScheduleNextRun('');
    setScheduleFrequency('weekly');
    setScheduleFormat('PDF');
    addToast('Compliance report schedule saved.', 'success');
  }

  function saveControl() {
    if (!canSaveControl) {
      addToast('Complete all required control fields with valid values.', 'warning');
      return;
    }
    createComplianceItem({
      area: controlArea.trim(),
      owner: controlOwner.trim(),
      due: controlDue,
      status: controlStatus,
      linkedCohortId: controlLinkedCohortId || undefined,
      missingEvidence: Number(controlMissingEvidence),
      missingAppraisals: Number(controlMissingAppraisals),
    });
    setControlArea('');
    setControlOwner('Compliance Officer');
    setControlDue('');
    setControlStatus('on-track');
    setControlLinkedCohortId('');
    setControlMissingEvidence('0');
    setControlMissingAppraisals('0');
    setControlModalOpen(false);
    addToast('Compliance control added.', 'success');
  }

  function toggleControlSelection(id: string) {
    setSelectedControlIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  }

  function toggleAllFilteredSelections() {
    setSelectedControlIds((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      const merged = new Set([...prev, ...filteredIds]);
      return Array.from(merged);
    });
  }

  function applyBulkStatus(status: ComplianceStatus) {
    if (selectedControlIds.length === 0) {
      addToast('Select at least one control first.', 'warning');
      return;
    }
    selectedControlIds.forEach((id) => updateComplianceStatus(id, status));
    addToast(`Updated ${selectedControlIds.length} control(s) to ${status}.`, 'success');
    setSelectedControlIds([]);
  }

  function applyFilterPreset(preset: 'all' | 'audit' | 'due-soon' | 'escalations') {
    setActivePreset(preset);
    setOwnerFilter('all');
    setSearchQuery('');
    if (preset === 'all') {
      setStatusFilter('all');
      setDueFilter('all');
      return;
    }
    if (preset === 'audit') {
      setStatusFilter('completed');
      setDueFilter('all');
      return;
    }
    if (preset === 'due-soon') {
      setStatusFilter('all');
      setDueFilter('due-soon');
      return;
    }
    setStatusFilter('escalated');
    setDueFilter('all');
  }

  function saveBulkRemediationPlan() {
    if (!canSaveBulkPlan) {
      addToast('Provide owner and due date, then select at least one control.', 'warning');
      return;
    }
    const owner = bulkPlanOwner.trim();
    const due = bulkPlanDue;
    const notes = bulkPlanNotes.trim();
    selectedControlIds.forEach((id) => {
      createRemediationPlan(id, { owner, due, notes });
      updateComplianceStatus(id, 'at-risk');
    });
    addToast(`Remediation plan assigned to ${selectedControlIds.length} control(s).`, 'success');
    setBulkPlanModalOpen(false);
    setBulkPlanOwner('Programme Success Lead');
    setBulkPlanDue('');
    setBulkPlanNotes('');
    setSelectedControlIds([]);
  }

  function exportControlsCsv(items: ComplianceItem[], filenamePrefix: string) {
    const rows = items.map((item) => {
      const cohort = item.linkedCohortId ? (cohortNameMap[item.linkedCohortId] ?? item.linkedCohortId) : 'Cross-programme';
      return [
        item.area,
        item.owner,
        item.due,
        item.status,
        item.remediationStatus,
        String(item.missingEvidence),
        String(item.missingAppraisals),
        cohort,
      ];
    });

    const header = ['Control Area', 'Owner', 'Due Date', 'Status', 'Remediation', 'Missing Evidence', 'Missing Appraisals', 'Cohort'];
    const csvContent = [header, ...rows]
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

  function exportFilteredControlsCsv() {
    exportControlsCsv(filteredItems, 'compliance-worklist');
    addToast('Compliance worklist exported to CSV.', 'success');
  }

  function exportSelectedControlsCsv() {
    if (selectedControlIds.length === 0) {
      addToast('Select controls first to export selected rows.', 'warning');
      return;
    }
    const selectedItems = complianceItems.filter((item) => selectedControlIds.includes(item.id));
    exportControlsCsv(selectedItems, 'compliance-selected-controls');
    addToast('Selected controls exported to CSV.', 'success');
  }

  function exportFilteredControlsPdf() {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!printWindow) {
      addToast('Unable to open print preview. Allow pop-ups and try again.', 'warning');
      return;
    }

    const generatedAt = new Date().toLocaleString();
    const rowsHtml = filteredItems
      .map((item) => {
        const cohort = item.linkedCohortId ? (cohortNameMap[item.linkedCohortId] ?? item.linkedCohortId) : 'Cross-programme';
        return `<tr>
          <td>${item.area}</td>
          <td>${item.owner}</td>
          <td>${item.due}</td>
          <td>${item.status}</td>
          <td>${item.remediationStatus}</td>
          <td>${item.missingEvidence}</td>
          <td>${item.missingAppraisals}</td>
          <td>${cohort}</td>
        </tr>`;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Compliance Worklist Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 16px; color: #555; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; text-align: left; padding: 8px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Compliance Worklist</h1>
          <p>Generated at ${generatedAt}</p>
          <table>
            <thead>
              <tr>
                <th>Control Area</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Remediation</th>
                <th>Missing Evidence</th>
                <th>Missing Appraisals</th>
                <th>Cohort</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    addToast('Opened printable compliance worklist.', 'info');
  }

  function exportSelectedControlsPdf() {
    if (selectedControlIds.length === 0) {
      addToast('Select controls first to export selected rows.', 'warning');
      return;
    }
    const selectedItems = complianceItems.filter((item) => selectedControlIds.includes(item.id));
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!printWindow) {
      addToast('Unable to open print preview. Allow pop-ups and try again.', 'warning');
      return;
    }
    const generatedAt = new Date().toLocaleString();
    const rowsHtml = selectedItems
      .map((item) => {
        const cohort = item.linkedCohortId ? (cohortNameMap[item.linkedCohortId] ?? item.linkedCohortId) : 'Cross-programme';
        return `<tr>
          <td>${item.area}</td>
          <td>${item.owner}</td>
          <td>${item.due}</td>
          <td>${item.status}</td>
          <td>${item.remediationStatus}</td>
          <td>${item.missingEvidence}</td>
          <td>${item.missingAppraisals}</td>
          <td>${cohort}</td>
        </tr>`;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Selected Compliance Controls Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 16px; color: #555; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; text-align: left; padding: 8px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Selected Compliance Controls</h1>
          <p>Generated at ${generatedAt}</p>
          <table>
            <thead>
              <tr>
                <th>Control Area</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Remediation</th>
                <th>Missing Evidence</th>
                <th>Missing Appraisals</th>
                <th>Cohort</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    addToast('Opened printable selected controls export.', 'info');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Compliance</h1>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-green"><h3>SLA Compliance</h3><p>{kpis.slaCompliance}%</p></div>
        <div className="kpi-card"><h3>Open Audits</h3><p>{kpis.openAudits}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Pending Evidence Items</h3><p>{kpis.pendingEvidence}</p></div>
        <div className="kpi-card kpi-red"><h3>Escalations</h3><p>{kpis.escalations}</p></div>
        <div className="kpi-card"><h3>Due Soon (7d)</h3><p>{kpis.dueSoon}</p></div>
        <div className="kpi-card kpi-red"><h3>Overdue Controls</h3><p>{kpis.overdue}</p></div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">Priority Compliance Queue</h2>
        </div>
        {priorityQueue.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No escalated or at-risk controls right now.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {priorityQueue.map((item) => (
              <div key={item.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{item.area}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  Owner: {item.owner} • Due: {item.due} • Missing evidence: {item.missingEvidence} • Missing appraisals: {item.missingAppraisals}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="action-btn" onClick={() => openPlan(item)}>Plan Remediation</button>
                  <button className="action-btn" onClick={() => addToast(`Reminder sent to ${item.owner}.`, 'info')}>Notify Owner</button>
                  <button className="action-btn" onClick={() => updateComplianceStatus(item.id, 'completed')}>Mark Complete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Compliance Worklist</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              className="form-input"
              placeholder="Search area, owner, status, or cohort"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{ minWidth: 220 }}
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ComplianceStatus)} style={{ minWidth: 140 }}>
              <option value="all">All statuses</option>
              <option value="on-track">On track</option>
              <option value="at-risk">At risk</option>
              <option value="escalated">Escalated</option>
              <option value="completed">Completed</option>
            </select>
            <select className="form-input" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} style={{ minWidth: 160 }}>
              <option value="all">All owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
            <select className="form-input" value={dueFilter} onChange={(event) => setDueFilter(event.target.value as 'all' | 'overdue' | 'due-soon' | 'future')} style={{ minWidth: 150 }}>
              <option value="all">All due dates</option>
              <option value="overdue">Overdue</option>
              <option value="due-soon">Due in 7 days</option>
              <option value="future">Future</option>
            </select>
            <button
              className="secondary-button"
              onClick={() => applyFilterPreset('audit')}
              style={{ borderColor: activePreset === 'audit' ? 'var(--brand)' : undefined }}
            >
              Audit Preset
            </button>
            <button
              className="secondary-button"
              onClick={() => applyFilterPreset('due-soon')}
              style={{ borderColor: activePreset === 'due-soon' ? 'var(--brand)' : undefined }}
            >
              Due Soon Preset
            </button>
            <button
              className="secondary-button"
              onClick={() => applyFilterPreset('escalations')}
              style={{ borderColor: activePreset === 'escalations' ? 'var(--brand)' : undefined }}
            >
              Escalations Preset
            </button>
            <button className="secondary-button" onClick={() => applyFilterPreset('all')}>Reset Preset</button>
            <button className="secondary-button" onClick={exportFilteredControlsCsv}>Export CSV</button>
            <button className="secondary-button" onClick={exportFilteredControlsPdf}>Export PDF</button>
            <button className="primary-button" onClick={() => setControlModalOpen(true)}>+ New Control</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="action-btn" onClick={() => setBulkPlanModalOpen(true)} disabled={selectedControlIds.length === 0}>Assign Remediation Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('on-track')} disabled={selectedControlIds.length === 0}>On Track Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('at-risk')} disabled={selectedControlIds.length === 0}>At Risk Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('escalated')} disabled={selectedControlIds.length === 0}>Escalate Selected</button>
          <button className="action-btn" onClick={() => applyBulkStatus('completed')} disabled={selectedControlIds.length === 0}>Complete Selected</button>
          <button className="action-btn" onClick={exportSelectedControlsCsv} disabled={selectedControlIds.length === 0}>Export Selected CSV</button>
          <button className="action-btn" onClick={exportSelectedControlsPdf} disabled={selectedControlIds.length === 0}>Export Selected PDF</button>
          <button className="action-btn" onClick={() => setSelectedControlIds([])} disabled={selectedControlIds.length === 0}>Clear Selection</button>
          <p style={{ margin: 0, color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.86rem' }}>
            {selectedControlIds.length} selected
          </p>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th" style={{ width: 40 }}>
                  <input
                    aria-label="Select all filtered controls"
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFilteredSelections}
                  />
                </th>
                <th className="datatable-th">Control Area</th>
                <th className="datatable-th">Owner</th>
                <th className="datatable-th">Due Date</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Remediation</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      aria-label={`Select control ${row.area}`}
                      type="checkbox"
                      checked={selectedControlIds.includes(row.id)}
                      onChange={() => toggleControlSelection(row.id)}
                    />
                  </td>
                  <td>{row.area}</td>
                  <td>{row.owner}</td>
                  <td>{row.due}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td style={{ textTransform: 'capitalize' }}>{row.remediationStatus}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => updateComplianceStatus(row.id, 'on-track')}>On Track</button>
                      <button className="action-btn" onClick={() => updateComplianceStatus(row.id, 'at-risk')}>At Risk</button>
                      <button className="action-btn" onClick={() => updateComplianceStatus(row.id, 'escalated')}>Escalate</button>
                      <button className="action-btn" onClick={() => updateComplianceStatus(row.id, 'completed')}>Complete</button>
                      <button className="action-btn" onClick={() => openPlan(row)}>Plan</button>
                      <button className="action-btn" onClick={() => resolveRemediationPlan(row.id)}>Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Evidence Gap Detector</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {gapDetector.map((gap) => (
            <div key={gap.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{gap.cohort}</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Missing evidence: {gap.missingEvidence} • Missing appraisals: {gap.missingAppraisals} • Severity: {gap.severity}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button className="action-btn" onClick={() => addToast(`Opened evidence checklist for ${gap.cohort}`, 'info')}>Open Checklist</button>
                <button className="action-btn" onClick={() => addToast(`Remediation task pack created for ${gap.cohort}`, 'success')}>Create Remediation Tasks</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>SLA & Risk Heatmap</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Control Area</th>
                <th className="datatable-th">Institute</th>
                <th className="datatable-th">Employer</th>
                <th className="datatable-th">Mentor</th>
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row) => (
                <tr key={row.area}>
                  <td style={{ fontWeight: 600 }}>{row.area}</td>
                  <td style={{ background: scoreColor(row.institute) }}>{row.institute}%</td>
                  <td style={{ background: scoreColor(row.employer) }}>{row.employer}%</td>
                  <td style={{ background: scoreColor(row.mentor) }}>{row.mentor}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Contract & Document Vault</h2>
          <button className="primary-button" onClick={() => setDocModalOpen(true)}>+ Add Document</button>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Document</th>
                <th className="datatable-th">Category</th>
                <th className="datatable-th">Owner</th>
                <th className="datatable-th">Linked Entity</th>
                <th className="datatable-th">Uploaded</th>
                <th className="datatable-th">Expires</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contractDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.category}</td>
                  <td>{doc.owner}</td>
                  <td>{doc.linkedEntity}</td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td>{doc.expiresAt}</td>
                  <td style={{ textTransform: 'capitalize' }}>{doc.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => updateContractDocumentStatus(doc.id, 'active')}>Active</button>
                      <button className="action-btn" onClick={() => updateContractDocumentStatus(doc.id, 'expiring')}>Expiring</button>
                      <button className="action-btn action-btn-danger" onClick={() => updateContractDocumentStatus(doc.id, 'expired')}>Expired</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Scheduled Compliance Report Packs</h2>
          <button className="primary-button" onClick={() => setScheduleModalOpen(true)}>+ New Schedule</button>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Report Pack</th>
                <th className="datatable-th">Frequency</th>
                <th className="datatable-th">Audience</th>
                <th className="datatable-th">Format</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Next Run</th>
                <th className="datatable-th">Last Run</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complianceReportSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{schedule.frequency}</td>
                  <td>{schedule.audience}</td>
                  <td>{schedule.format}</td>
                  <td style={{ textTransform: 'capitalize' }}>{schedule.status}</td>
                  <td>{new Date(schedule.nextRun).toLocaleString()}</td>
                  <td>{schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => runComplianceReportNow(schedule.id)}>Run Now</button>
                      <button
                        className="action-btn"
                        onClick={() => upsertComplianceReportSchedule({
                          name: schedule.name,
                          frequency: schedule.frequency,
                          audience: schedule.audience,
                          format: schedule.format,
                          status: schedule.status === 'active' ? 'paused' : 'active',
                          nextRun: schedule.nextRun,
                        }, schedule.id)}
                      >
                        {schedule.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {planItemId && (
        <Modal
          title="Create Remediation Plan"
          onClose={() => setPlanItemId(null)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setPlanItemId(null)}>Cancel</button>
              <button className="primary-button" onClick={savePlan} disabled={!canSavePlan}>Save Plan</button>
            </>
          )}
        >
          <label className="form-label">
            Remediation owner
            <input className="form-input" value={planOwner} onChange={(event) => setPlanOwner(event.target.value)} />
          </label>
          <label className="form-label">
            Due date
            <input type="date" min={minPlanDueDate} className="form-input" value={planDue} onChange={(event) => setPlanDue(event.target.value)} />
          </label>
          <label className="form-label">
            Notes
            <textarea className="form-input" rows={4} value={planNotes} onChange={(event) => setPlanNotes(event.target.value)} placeholder="Define actions, owners, and checkpoints." />
          </label>
        </Modal>
      )}

      {docModalOpen && (
        <Modal
          title="Add Vault Document"
          onClose={() => setDocModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setDocModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={saveDocument} disabled={!canSaveDocument}>Add Document</button>
            </>
          )}
        >
          <label className="form-label">
            Document title
            <input className="form-input" value={docTitle} onChange={(event) => setDocTitle(event.target.value)} />
          </label>
          <label className="form-label">
            Category
            <select className="form-input" value={docCategory} onChange={(event) => setDocCategory(event.target.value as 'Contract' | 'Accreditation' | 'Policy' | 'Compliance Pack')}>
              <option value="Contract">Contract</option>
              <option value="Accreditation">Accreditation</option>
              <option value="Policy">Policy</option>
              <option value="Compliance Pack">Compliance Pack</option>
            </select>
          </label>
          <label className="form-label">
            Owner
            <input className="form-input" value={docOwner} onChange={(event) => setDocOwner(event.target.value)} />
          </label>
          <label className="form-label">
            Linked entity
            <input className="form-input" value={docLinkedEntity} onChange={(event) => setDocLinkedEntity(event.target.value)} placeholder="Institute, employer, or cohort" />
          </label>
          <label className="form-label">
            Expiry date
            <input type="date" min={minPlanDueDate} className="form-input" value={docExpiresAt} onChange={(event) => setDocExpiresAt(event.target.value)} />
          </label>
        </Modal>
      )}

      {scheduleModalOpen && (
        <Modal
          title="Create Report Schedule"
          onClose={() => setScheduleModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setScheduleModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={saveReportSchedule} disabled={!canSaveReportSchedule}>Save Schedule</button>
            </>
          )}
        >
          <label className="form-label">
            Schedule name
            <input className="form-input" value={scheduleName} onChange={(event) => setScheduleName(event.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Frequency
              <select className="form-input" value={scheduleFrequency} onChange={(event) => setScheduleFrequency(event.target.value as 'weekly' | 'monthly' | 'quarterly')}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </label>
            <label className="form-label">
              Format
              <select className="form-input" value={scheduleFormat} onChange={(event) => setScheduleFormat(event.target.value as 'PDF' | 'CSV' | 'XLSX')}>
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            Audience
            <input className="form-input" value={scheduleAudience} onChange={(event) => setScheduleAudience(event.target.value)} />
          </label>
          <label className="form-label">
            Next run
            <input type="datetime-local" min={minScheduleDateTime} className="form-input" value={scheduleNextRun} onChange={(event) => setScheduleNextRun(event.target.value)} />
          </label>
        </Modal>
      )}

      {controlModalOpen && (
        <Modal
          title="Add Compliance Control"
          onClose={() => setControlModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setControlModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={saveControl} disabled={!canSaveControl}>Add Control</button>
            </>
          )}
        >
          <label className="form-label">
            Control area
            <input className="form-input" value={controlArea} onChange={(event) => setControlArea(event.target.value)} placeholder="e.g. Mentor compliance confirmation" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Owner
              <input className="form-input" value={controlOwner} onChange={(event) => setControlOwner(event.target.value)} />
            </label>
            <label className="form-label">
              Due date
              <input type="date" min={minPlanDueDate} className="form-input" value={controlDue} onChange={(event) => setControlDue(event.target.value)} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Status
              <select className="form-input" value={controlStatus} onChange={(event) => setControlStatus(event.target.value as ComplianceStatus)}>
                <option value="on-track">On track</option>
                <option value="at-risk">At risk</option>
                <option value="escalated">Escalated</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="form-label">
              Linked cohort (optional)
              <select className="form-input" value={controlLinkedCohortId} onChange={(event) => setControlLinkedCohortId(event.target.value)}>
                <option value="">Cross-programme</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Missing evidence
              <input type="number" min={0} className="form-input" value={controlMissingEvidence} onChange={(event) => setControlMissingEvidence(event.target.value)} />
            </label>
            <label className="form-label">
              Missing appraisals
              <input type="number" min={0} className="form-input" value={controlMissingAppraisals} onChange={(event) => setControlMissingAppraisals(event.target.value)} />
            </label>
          </div>
        </Modal>
      )}

      {bulkPlanModalOpen && (
        <Modal
          title="Assign Remediation Plan to Selected Controls"
          onClose={() => setBulkPlanModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setBulkPlanModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={saveBulkRemediationPlan} disabled={!canSaveBulkPlan}>Assign Plan</button>
            </>
          )}
        >
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Applying this plan to {selectedControlIds.length} selected control(s).
          </p>
          <label className="form-label">
            Remediation owner
            <input className="form-input" value={bulkPlanOwner} onChange={(event) => setBulkPlanOwner(event.target.value)} />
          </label>
          <label className="form-label">
            Due date
            <input type="date" min={minPlanDueDate} className="form-input" value={bulkPlanDue} onChange={(event) => setBulkPlanDue(event.target.value)} />
          </label>
          <label className="form-label">
            Notes
            <textarea className="form-input" rows={4} value={bulkPlanNotes} onChange={(event) => setBulkPlanNotes(event.target.value)} placeholder="Shared remediation plan notes for selected controls." />
          </label>
        </Modal>
      )}
    </div>
  );
}
