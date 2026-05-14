import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { CohortDetail, CohortLearner, CohortPhaseEntry } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

export default function CohortsDashboard() {
  const { addToast } = useToast();
  const {
    cohorts,
    createCohort: createCohortRecord,
    cloneCohort,
    updateCohort,
    cohortDetails,
    updateCohortDetail,
    addLearnerToCohort,
    transferLearners: transferLearnersCtx,
  } = usePlatformData();

  // ─── Main filters ──────────────────────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState<'all' | 'learnership' | 'ydp'>('all');
  const [query, setQuery] = useState('');

  // ─── Create cohort ─────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('default-learnership');
  const [name, setName] = useState('');
  const [type, setType] = useState<'learnership' | 'ydp'>('learnership');
  const [intake, setIntake] = useState('');
  const [endDate, setEndDate] = useState('');
  const [createAutoEndDate, setCreateAutoEndDate] = useState(true);
  const [employer, setEmployer] = useState('');
  const [institute, setInstitute] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState('60');

  // ─── Roster modal ──────────────────────────────────────────────────────────
  const [rosterCohortId, setRosterCohortId] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');

  // ─── Compliance modal ──────────────────────────────────────────────────────
  const [complianceCohortId, setComplianceCohortId] = useState<string | null>(null);

  // ─── Add learner to cohort ─────────────────────────────────────────────────
  const [addUserCohortId, setAddUserCohortId] = useState<string | null>(null);
  const [newLearnerName, setNewLearnerName] = useState('');
  const [newLearnerAccessCard, setNewLearnerAccessCard] = useState('');
  const [newLearnerLaptopSerial, setNewLearnerLaptopSerial] = useState('');
  const [newLearnerSimCard, setNewLearnerSimCard] = useState('');
  const [newLearnerAttendance, setNewLearnerAttendance] = useState('100');

  // ─── Edit cohort ───────────────────────────────────────────────────────────
  const [editCohortId, setEditCohortId] = useState<string | null>(null);
  const [editCohortEndDate, setEditCohortEndDate] = useState('');
  const [editAutoEndDate, setEditAutoEndDate] = useState(true);
  const [editPhases, setEditPhases] = useState<CohortPhaseEntry[]>([]);
  const [editRefNumber, setEditRefNumber] = useState('');
  const [editSetaCode, setEditSetaCode] = useState('');
  const [editNqfLevel, setEditNqfLevel] = useState('4');
  const [editFundingSource, setEditFundingSource] = useState('SETA Funded');
  const [editTrainingSite, setEditTrainingSite] = useState('');
  const [editTransport, setEditTransport] = useState<'yes' | 'no'>('no');
  const [editTransportProvider, setEditTransportProvider] = useState('');
  const [editStipendAmount, setEditStipendAmount] = useState('');
  const [editTab, setEditTab] = useState<'info' | 'phases'>('info');

  // ─── Transfer wizard ───────────────────────────────────────────────────────
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferFilter, setTransferFilter] = useState<'name' | 'accessCard' | 'serial'>('name');
  const [transferSelectedIds, setTransferSelectedIds] = useState<string[]>([]);

  // ─── SLA response actions ─────────────────────────────────────────────────
  const [escalatedBreaches, setEscalatedBreaches] = useState<Record<string, string>>({});
  const [remediationOpen, setRemediationOpen] = useState(false);
  const [remediationCohortId, setRemediationCohortId] = useState<string | null>(null);
  const [remediationOwner, setRemediationOwner] = useState('Programme Success Lead');
  const [remediationDueDate, setRemediationDueDate] = useState('');
  const [remediationNotes, setRemediationNotes] = useState('');
  const [remediationByCohort, setRemediationByCohort] = useState<Record<string, { owner: string; dueDate: string; notes: string; createdAt: string }>>({});

  // ─── Legacy learner backfill audit ───────────────────────────────────────
  const [backfillAuditOpen, setBackfillAuditOpen] = useState(false);
  const [backfillAuditAt, setBackfillAuditAt] = useState('');

  // ─── Derived ──────────────────────────────────────────────────────────────
  const rosterCohort = useMemo(() => cohorts.find((c) => c.id === rosterCohortId) ?? null, [cohorts, rosterCohortId]);
  const complianceCohort = useMemo(() => cohorts.find((c) => c.id === complianceCohortId) ?? null, [cohorts, complianceCohortId]);
  const editCohort = useMemo(() => cohorts.find((c) => c.id === editCohortId) ?? null, [cohorts, editCohortId]);
  const addUserCohort = useMemo(() => cohorts.find((c) => c.id === addUserCohortId) ?? null, [cohorts, addUserCohortId]);
  const remediationCohort = useMemo(
    () => cohorts.find((c) => c.id === remediationCohortId) ?? null,
    [cohorts, remediationCohortId],
  );

  const rosterLearners = useMemo<CohortLearner[]>(() => {
    const learners: CohortLearner[] = cohortDetails[rosterCohortId ?? '']?.learners ?? [];
    if (!rosterSearch.trim()) return learners;
    const q = rosterSearch.toLowerCase();
    return learners.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.accessCardId.toLowerCase().includes(q) ||
        l.laptopSerialId.toLowerCase().includes(q) ||
        l.simCardId.toLowerCase().includes(q),
    );
  }, [cohortDetails, rosterCohortId, rosterSearch]);

  const transferSourceLearners = useMemo((): CohortLearner[] => {
    if (!transferFromId) return [];
    const all: CohortLearner[] = cohortDetails[transferFromId]?.learners ?? [];
    if (!transferSearch.trim()) return all;
    const q = transferSearch.toLowerCase();
    if (transferFilter === 'name') return all.filter((l) => l.name.toLowerCase().includes(q));
    if (transferFilter === 'accessCard') return all.filter((l) => l.accessCardId.toLowerCase().includes(q));
    return all.filter((l) => l.laptopSerialId.toLowerCase().includes(q) || l.simCardId.toLowerCase().includes(q));
  }, [cohortDetails, transferFromId, transferSearch, transferFilter]);

  const complianceItems = useMemo(() => {
    if (!complianceCohortId) return [];
    const c = cohorts.find((co) => co.id === complianceCohortId);
    if (!c) return [];
    return [
      { id: 'ci1', area: 'Attendance SLA (>85%)', status: c.health === 'escalated' ? 'escalated' : c.health === 'at-risk' ? 'at-risk' : 'on-track', due: '2026-05-31', owner: 'Coach / Manager' },
      { id: 'ci2', area: 'Evidence Completeness', status: c.filled < c.seats * 0.8 ? 'at-risk' : 'on-track', due: '2026-06-15', owner: 'Learner / Coach' },
      { id: 'ci3', area: 'Quarterly Appraisal Sign-off', status: 'on-track', due: '2026-06-30', owner: 'Employer Rep' },
      { id: 'ci4', area: 'SETA Reporting Submission', status: 'on-track', due: '2026-07-01', owner: 'Programme Admin' },
      { id: 'ci5', area: 'Learner Agreement on File', status: 'on-track', due: '2026-05-20', owner: 'Compliance Officer' },
      { id: 'ci6', area: 'Medical Clearance Records', status: 'on-track', due: '2026-05-25', owner: 'HR / Institute' },
    ];
  }, [complianceCohortId, cohorts]);

  const filtered = useMemo(() => {
    return cohorts.filter((c) => {
      if (c.health === 'completed' || c.phase === 'completion') return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (!query) return true;
      return `${c.name} ${c.employer} ${c.institute} ${c.location}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [cohorts, query, typeFilter]);

  const completedCohorts = useMemo(
    () => cohorts.filter((c) => c.health === 'completed' || c.phase === 'completion'),
    [cohorts],
  );

  const backfillAuditRows = useMemo(
    () =>
      cohorts.map((cohort) => {
        const learners = cohortDetails[cohort.id]?.learners ?? [];
        const missingLaptop = learners.filter((learner) => !learner.laptopSerialId?.trim()).length;
        const missingSim = learners.filter((learner) => !learner.simCardId?.trim()).length;
        const legacyFlagged = learners.filter((learner) => Boolean(learner.serialId) || Boolean(learner.serialType)).length;
        return {
          cohortId: cohort.id,
          cohortName: cohort.name,
          learners: learners.length,
          missingLaptop,
          missingSim,
          legacyFlagged,
        };
      }),
    [cohorts, cohortDetails],
  );

  const totals = useMemo(() => {
    const seatsTotal = filtered.reduce((acc, c) => acc + c.seats, 0);
    const seatsFilled = filtered.reduce((acc, c) => acc + c.filled, 0);
    const active = filtered.filter((c) => c.phase === 'active').length;
    const atRisk = filtered.filter((c) => c.health === 'at-risk' || c.health === 'escalated').length;
    return { seatsTotal, seatsFilled, active, atRisk };
  }, [filtered]);

  const slaBreaches = useMemo(
    () =>
      [...filtered, ...completedCohorts]
        .map((cohort) => ({
          id: cohort.id,
          name: cohort.name,
          fillRate: cohort.seats > 0 ? Math.round((cohort.filled / cohort.seats) * 100) : 0,
          riskLevel: cohort.health === 'escalated' ? 'high' : cohort.health === 'at-risk' ? 'medium' : 'low',
          owner: cohort.institute,
          isBreach: cohort.health === 'escalated' || (cohort.seats > 0 && cohort.filled / cohort.seats < 0.7),
        }))
        .filter((r) => r.isBreach),
    [filtered, completedCohorts],
  );

  function getCohortDurationLabel(cohortType: 'learnership' | 'ydp') {
    return cohortType === 'learnership' ? '12 months' : '24 months';
  }

  function getDefaultDurationYears(cohortType: 'learnership' | 'ydp') {
    return cohortType === 'learnership' ? 1 : 2;
  }

  function parseIntakeToDate(intakeValue: string): Date | null {
    const normalized = intakeValue.trim();
    if (!normalized) return null;

    const quarterMatch = normalized.match(/^Q([1-4])\s(\d{4})$/i);
    if (quarterMatch) {
      const quarter = Number(quarterMatch[1]);
      const year = Number(quarterMatch[2]);
      const month = (quarter - 1) * 3;
      return new Date(Date.UTC(year, month, 1));
    }

    const monthMatch = normalized.match(/^([A-Za-z]{3,9})\s(\d{4})$/);
    if (!monthMatch) return null;
    const monthToken = monthMatch[1].toLowerCase();
    const year = Number(monthMatch[2]);
    const monthMap: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };
    const month = monthMap[monthToken];
    if (month === undefined) return null;
    return new Date(Date.UTC(year, month, 1));
  }

  function suggestEndDateFromIntake(intakeValue: string, cohortType: 'learnership' | 'ydp'): string {
    const start = parseIntakeToDate(intakeValue);
    if (!start) return '';
    const years = getDefaultDurationYears(cohortType);
    const end = new Date(Date.UTC(start.getUTCFullYear() + years, start.getUTCMonth(), start.getUTCDate()));
    end.setUTCDate(end.getUTCDate() - 1);
    return end.toISOString().slice(0, 10);
  }

  const suggestedCreateEndDate = useMemo(
    () => suggestEndDateFromIntake(intake, type),
    [intake, type],
  );

  const suggestedEditEndDate = useMemo(() => {
    if (!editCohort) return '';
    return suggestEndDateFromIntake(editCohort.intake, editCohort.type);
  }, [editCohort]);

  useEffect(() => {
    if (!createAutoEndDate) return;
    if (!suggestedCreateEndDate) return;
    setEndDate(suggestedCreateEndDate);
  }, [createAutoEndDate, suggestedCreateEndDate]);

  useEffect(() => {
    if (!editAutoEndDate) return;
    if (!suggestedEditEndDate) return;
    if (!editCohortId) return;
    setEditCohortEndDate(suggestedEditEndDate);
  }, [editAutoEndDate, suggestedEditEndDate, editCohortId]);

  // ─── Validators ───────────────────────────────────────────────────────────
  function validateCohortInput() {
    const trimmedName = name.trim();
    const trimmedIntake = intake.trim();
    const trimmedEndDate = endDate.trim();
    const trimmedEmployer = employer.trim();
    const trimmedInstitute = institute.trim();
    const trimmedLocation = location.trim();
    const seatsValue = Number(seats);
    if (trimmedName.length < 5) return 'Cohort name must be at least 5 characters.';
    if (cohorts.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) return 'A cohort with this name already exists.';
    if (!/^([A-Za-z]{3,9}\s\d{4}|Q[1-4]\s\d{4})$/i.test(trimmedIntake)) return 'Intake must follow formats like "Jul 2026" or "Q3 2026".';
    if (!trimmedEndDate) return 'End date is required.';
    if (trimmedEmployer.length < 3) return 'Employer name must be at least 3 characters.';
    if (trimmedInstitute.length < 3) return 'Institute name must be at least 3 characters.';
    if (trimmedLocation.length < 2) return 'Location must be at least 2 characters.';
    if (!Number.isInteger(seatsValue) || seatsValue < 5 || seatsValue > 1000) return 'Seats must be an integer between 5 and 1000.';
    return null;
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function handleCreateCohort() {
    const err = validateCohortInput();
    if (err) { addToast(err, 'warning'); return; }
    const safeSeats = Number.isFinite(Number(seats)) && Number(seats) > 0 ? Number(seats) : 1;
    createCohortRecord({
      name: name.trim(),
      type,
      intake: intake.trim(),
      endDate: endDate.trim(),
      employer: employer.trim(),
      institute: institute.trim(),
      location: location.trim(),
      seats: safeSeats,
    });
    setCreateOpen(false);
    setName('');
    setType('learnership');
    setIntake('');
    setEndDate('');
    setCreateAutoEndDate(true);
    setEmployer('');
    setInstitute('');
    setLocation('');
    setSeats('60');
    addToast('Cohort created from ' + selectedTemplate + ' template.', 'success');
  }

  function openEditCohort(cohortId: string) {
    const detail = cohortDetails[cohortId];
    const cohort = cohorts.find((item) => item.id === cohortId);
    const fallbackDetail: CohortDetail = {
      refNumber: '',
      setaCode: '',
      nqfLevel: '4',
      fundingSource: 'SETA Funded',
      trainingSite: '',
      transport: 'no',
      transportProvider: '',
      stipendAmount: '',
      phases: [],
      learners: [],
    };
    const safeDetail = detail ?? fallbackDetail;
    const computedEndDate = cohort ? suggestEndDateFromIntake(cohort.intake, cohort.type) : '';
    const existingEndDate = cohort?.endDate ?? computedEndDate;
    setEditAutoEndDate(existingEndDate === computedEndDate);
    setEditCohortEndDate(existingEndDate);
    setEditRefNumber(safeDetail.refNumber);
    setEditSetaCode(safeDetail.setaCode);
    setEditNqfLevel(safeDetail.nqfLevel);
    setEditFundingSource(safeDetail.fundingSource);
    setEditTrainingSite(safeDetail.trainingSite);
    setEditTransport(safeDetail.transport);
    setEditTransportProvider(safeDetail.transportProvider);
    setEditStipendAmount(safeDetail.stipendAmount);
    setEditPhases(safeDetail.phases.map((p) => ({ ...p })));
    setEditTab('info');
    setEditCohortId(cohortId);
  }

  function saveEditCohort() {
    if (!editCohortId) return;
    if (!editCohortEndDate.trim()) {
      addToast('End date is required.', 'warning');
      return;
    }
    updateCohortDetail(editCohortId, {
      refNumber: editRefNumber, setaCode: editSetaCode, nqfLevel: editNqfLevel,
      fundingSource: editFundingSource, trainingSite: editTrainingSite,
      transport: editTransport, transportProvider: editTransportProvider,
      stipendAmount: editStipendAmount, phases: editPhases,
    });
    const completedCount = editPhases.filter((p) => p.completed).length;
    const ratio = editPhases.length > 0 ? completedCount / editPhases.length : 0;
    const health: 'on-track' | 'at-risk' | 'escalated' | 'completed' = ratio >= 1 ? 'completed' : ratio >= 0.5 ? 'on-track' : 'at-risk';
    const phase: 'onboarding' | 'active' | 'review' | 'completion' = ratio >= 1 ? 'completion' : ratio >= 0.5 ? 'active' : 'onboarding';
    updateCohort(editCohortId, { health, phase, endDate: editCohortEndDate });
    setEditCohortId(null);
    addToast('Cohort details and phase timeline saved.', 'success');
  }

  function handleEscalateBreach(cohortId: string, cohortName: string) {
    const timestamp = new Date().toISOString();
    updateCohort(cohortId, { health: 'escalated' });
    setEscalatedBreaches((prev) => ({ ...prev, [cohortId]: timestamp }));
    addToast('Escalation sent for ' + cohortName + '.', 'warning');
  }

  function openRemediationPlan(cohortId: string) {
    setRemediationCohortId(cohortId);
    setRemediationOwner('Programme Success Lead');
    setRemediationDueDate('');
    setRemediationNotes('');
    setRemediationOpen(true);
  }

  function submitRemediationPlan() {
    if (!remediationCohortId || !remediationCohort) return;
    if (!remediationDueDate.trim()) {
      addToast('Remediation due date is required.', 'warning');
      return;
    }
    const entry = {
      owner: remediationOwner.trim() || 'Programme Success Lead',
      dueDate: remediationDueDate,
      notes: remediationNotes.trim(),
      createdAt: new Date().toISOString(),
    };
    setRemediationByCohort((prev) => ({ ...prev, [remediationCohortId]: entry }));
    updateCohort(remediationCohortId, { health: 'at-risk' });
    setRemediationOpen(false);
    addToast('Remediation plan logged for ' + remediationCohort.name + '.', 'success');
  }

  function runBackfillAudit() {
    setBackfillAuditAt(new Date().toISOString());
    setBackfillAuditOpen(true);
  }

  function handleAddUserToCohort() {
    if (!addUserCohortId) return;
    if (newLearnerName.trim().length < 3) { addToast('Learner name must be at least 3 characters.', 'warning'); return; }
    if (newLearnerAccessCard.trim().length < 3) { addToast('Access Card ID is required.', 'warning'); return; }
    if (newLearnerLaptopSerial.trim().length < 3) { addToast('Laptop ID is required.', 'warning'); return; }
    if (newLearnerSimCard.trim().length < 3) { addToast('SIM card ID is required.', 'warning'); return; }
    addLearnerToCohort(addUserCohortId, {
      name: newLearnerName.trim(),
      accessCardId: newLearnerAccessCard.trim(),
      laptopSerialId: newLearnerLaptopSerial.trim(),
      simCardId: newLearnerSimCard.trim(),
      status: 'active',
      attendance: Number(newLearnerAttendance) || 100,
    });
    setNewLearnerName('');
    setNewLearnerAccessCard('');
    setNewLearnerLaptopSerial('');
    setNewLearnerSimCard('');
    setNewLearnerAttendance('100');
    setAddUserCohortId(null);
    addToast('Learner added to cohort.', 'success');
  }

  function handleTransferSubmit() {
    const from = cohorts.find((c) => c.id === transferFromId);
    const to = cohorts.find((c) => c.id === transferToId);
    if (!from || !to) { addToast('Select source and destination cohorts.', 'warning'); return; }
    if (from.id === to.id) { addToast('Source and destination must differ.', 'warning'); return; }
    if (transferSelectedIds.length === 0) { addToast('Select at least one learner.', 'warning'); return; }
    transferLearnersCtx(transferSelectedIds, transferFromId, transferToId);
    addToast('Transferred ' + transferSelectedIds.length + ' learner(s) from ' + from.name + ' to ' + to.name + '.', 'success');
    setTransferOpen(false);
    setTransferSelectedIds([]); setTransferSearch(''); setTransferFromId(''); setTransferToId('');
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Cohorts Dashboard</h1>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setCreateAutoEndDate(true);
            setCreateOpen(true);
          }}
        >
          + New Cohort
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card"><h3>In-Programme Cohorts</h3><p>{filtered.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Active Phase</h3><p>{totals.active}</p></div>
        <div className="kpi-card"><h3>Seats Filled</h3><p>{totals.seatsFilled}/{totals.seatsTotal}</p></div>
        <div className="kpi-card kpi-yellow"><h3>At-Risk Cohorts</h3><p>{totals.atRisk}</p></div>
        <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}><h3>Completed Cohorts</h3><p>{completedCohorts.length}</p></div>
      </div>

      {/* Lifecycle Automation & SLA Alerts */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Lifecycle Automation & SLA Alerts</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={automationEnabled}
                onChange={(e) => {
                  setAutomationEnabled(e.target.checked);
                  addToast('Lifecycle automation ' + (e.target.checked ? 'enabled' : 'paused'), 'info');
                }}
              />
              <span>Auto-transition cohorts by phase rules</span>
            </label>
            <button
              className="action-btn"
              onClick={() => {
                setTransferOpen(true);
                setTransferSelectedIds([]); setTransferSearch(''); setTransferFromId(''); setTransferToId('');
              }}
            >
              Open Transfer Wizard
            </button>
            <button className="action-btn" onClick={runBackfillAudit}>Run Legacy Backfill Audit</button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {slaBreaches.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No SLA breaches detected.</p>
          ) : (
            slaBreaches.map((breach) => (
              <div key={breach.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{breach.name}</p>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  Fill rate {breach.fillRate}% &bull; Escalation: {breach.riskLevel} &bull; Routed to {breach.owner}
                </p>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="action-btn" onClick={() => handleEscalateBreach(breach.id, breach.name)}>
                    {escalatedBreaches[breach.id] ? 'Escalated' : 'Escalate'}
                  </button>
                  <button className="action-btn" onClick={() => openRemediationPlan(breach.id)}>
                    {remediationByCohort[breach.id] ? 'View Remediation Plan' : 'Create Remediation Plan'}
                  </button>
                </div>
                {remediationByCohort[breach.id] && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Remediation owner: {remediationByCohort[breach.id].owner} • due {remediationByCohort[breach.id].dueDate}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Filters</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['all', 'learnership', 'ydp'] as const).map((t) => (
              <button key={t} className={'secondary-button' + (typeFilter === t ? ' tab-btn-active' : '')} onClick={() => setTypeFilter(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
        </div>
        <input
          className="form-input"
          placeholder="Search cohort name, employer, institute, or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Active Cohort Portfolio */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Cohort Portfolio</h2>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active cohorts match the current filters.</p>
        ) : (
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Cohort</th>
                  <th className="datatable-th">Type</th>
                  <th className="datatable-th">Duration</th>
                  <th className="datatable-th">Intake</th>
                  <th className="datatable-th">End Date</th>
                  <th className="datatable-th">Partners</th>
                  <th className="datatable-th">Capacity</th>
                  <th className="datatable-th">Health</th>
                  <th className="datatable-th">Phase</th>
                  <th className="datatable-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'grid', gap: 2 }}>
                        <strong>{c.name}</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.location}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={c.type === 'ydp' ? 'ydp' : 'learner'} /></td>
                    <td>{getCohortDurationLabel(c.type)}</td>
                    <td>{c.intake}</td>
                    <td>{c.endDate || '-'}</td>
                    <td>
                      <div style={{ display: 'grid', gap: 2 }}>
                        <span>{c.employer}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.institute}</span>
                      </div>
                    </td>
                    <td>
                      <span>{c.filled}/{c.seats}</span>
                      <div style={{ height: 6, borderRadius: 999, background: 'var(--input-border)', marginTop: 6 }}>
                        <div style={{ height: '100%', width: Math.min(100, (c.filled / c.seats) * 100) + '%', borderRadius: 999, background: 'var(--accent-cyan)' }} />
                      </div>
                    </td>
                    <td><StatusBadge status={c.health} /></td>
                    <td><span style={{ textTransform: 'capitalize' }}>{c.phase}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="action-btn" onClick={() => { setRosterCohortId(c.id); setRosterSearch(''); }}>Roster</button>
                        <button className="action-btn" onClick={() => setComplianceCohortId(c.id)}>Compliance</button>
                        <button className="action-btn" onClick={() => setAddUserCohortId(c.id)}>Add Learner</button>
                        <button className="action-btn" onClick={() => openEditCohort(c.id)}>Edit</button>
                        <button className="action-btn" onClick={() => { cloneCohort(c.id); addToast('Cloned ' + c.name, 'success'); }}>Clone</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Cohorts */}
      {completedCohorts.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 className="card-title" style={{ marginBottom: 12 }}>Completed Cohorts</h2>
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Cohort</th>
                  <th className="datatable-th">Type</th>
                  <th className="datatable-th">Duration</th>
                  <th className="datatable-th">Intake</th>
                  <th className="datatable-th">End Date</th>
                  <th className="datatable-th">Partners</th>
                  <th className="datatable-th">Enrolled</th>
                  <th className="datatable-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedCohorts.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.location}</div></td>
                    <td><StatusBadge status={c.type === 'ydp' ? 'ydp' : 'learner'} /></td>
                    <td>{getCohortDurationLabel(c.type)}</td>
                    <td>{c.intake}</td>
                    <td>{c.endDate || '-'}</td>
                    <td>{c.employer} / {c.institute}</td>
                    <td>{c.filled}/{c.seats}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="action-btn" onClick={() => { setRosterCohortId(c.id); setRosterSearch(''); }}>Roster</button>
                        <button className="action-btn" onClick={() => setComplianceCohortId(c.id)}>Compliance</button>
                        <button className="action-btn" onClick={() => openEditCohort(c.id)}>Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      {/* Create Cohort */}
      {createOpen && (
        <Modal
          title="Create New Cohort"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={handleCreateCohort}>Create Cohort</button>
              <button className="secondary-button" onClick={() => setCreateOpen(false)}>Cancel</button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <label className="form-label"><span>Cohort Name</span>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. YDP Cohort 2026-Q2" />
            </label>
            <label className="form-label"><span>Type</span>
              <select
                className="form-input"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as 'learnership' | 'ydp');
                  if (!createAutoEndDate) {
                    addToast('Manual end date override is on. Turn on auto mode to recalculate.', 'info');
                  }
                }}
              >
                <option value="learnership">Learnership</option>
                <option value="ydp">YDP</option>
              </select>
            </label>
            <label className="form-label"><span>Template</span>
              <select className="form-input" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                <option value="default-learnership">Default Learnership</option>
                <option value="default-ydp">Default YDP</option>
                <option value="high-support">High Support Intervention</option>
                <option value="employer-accelerated">Employer Accelerated Track</option>
              </select>
            </label>
            <label className="form-label"><span>Intake</span>
              <input
                className="form-input"
                value={intake}
                onChange={(e) => {
                  setIntake(e.target.value);
                }}
                placeholder='e.g. Jul 2026'
              />
            </label>
            <label className="form-label"><span>End Date</span>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCreateAutoEndDate(false);
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={createAutoEndDate}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setCreateAutoEndDate(enabled);
                    if (enabled && suggestedCreateEndDate) {
                      setEndDate(suggestedCreateEndDate);
                    }
                  }}
                />
                <span>Auto-calculate end date ({type === 'learnership' ? '1 year' : '2 years'})</span>
              </label>
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  if (!suggestedCreateEndDate) {
                    addToast('Use a valid intake format first (e.g. Jul 2026 or Q3 2026).', 'warning');
                    return;
                  }
                  setEndDate(suggestedCreateEndDate);
                  setCreateAutoEndDate(true);
                  addToast(
                    'Suggested end date applied based on default duration: ' +
                      (type === 'learnership' ? '1 year' : '2 years') +
                      '.',
                    'info',
                  );
                }}
              >
                Use Default Duration ({type === 'learnership' ? '1 year' : '2 years'})
              </button>
              {suggestedCreateEndDate ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Suggested end date: {suggestedCreateEndDate}
                </span>
              ) : null}
            </div>
            <label className="form-label"><span>Employer</span>
              <input className="form-input" value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="Employer name" />
            </label>
            <label className="form-label"><span>Institute</span>
              <input className="form-input" value={institute} onChange={(e) => setInstitute(e.target.value)} placeholder="Institute name" />
            </label>
            <label className="form-label"><span>Location</span>
              <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or Province" />
            </label>
            <label className="form-label"><span>Planned Seats</span>
              <input type="number" className="form-input" value={seats} onChange={(e) => setSeats(e.target.value)} min={1} />
            </label>
          </div>
        </Modal>
      )}

      {/* Roster Modal */}
      {rosterCohort && (
        <Modal
          title={'Learner Roster — ' + rosterCohort.name}
          onClose={() => setRosterCohortId(null)}
          footer={<button className="secondary-button" onClick={() => setRosterCohortId(null)}>Close</button>}
        >
          <div style={{ marginBottom: 10 }}>
            <input
              className="form-input"
              placeholder="Search by name, access card ID, laptop ID, or SIM ID"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
            />
          </div>
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Name</th>
                  <th className="datatable-th">Access Card ID</th>
                  <th className="datatable-th">Laptop ID</th>
                  <th className="datatable-th">SIM Card ID</th>
                  <th className="datatable-th">Attendance</th>
                  <th className="datatable-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {rosterLearners.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 14 }}>No learners found.</td></tr>
                ) : (
                  rosterLearners.map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.name}</strong></td>
                      <td style={{ fontFamily: 'monospace' }}>{l.accessCardId}</td>
                      <td style={{ fontFamily: 'monospace' }}>{l.laptopSerialId}</td>
                      <td style={{ fontFamily: 'monospace' }}>{l.simCardId}</td>
                      <td>{l.attendance}%</td>
                      <td><StatusBadge status={l.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            {rosterLearners.length} learner(s) shown &bull; {rosterCohort.filled}/{rosterCohort.seats} seats filled
          </p>
        </Modal>
      )}

      {/* Compliance Modal */}
      {complianceCohort && (
        <Modal
          title={'Compliance — ' + complianceCohort.name}
          onClose={() => setComplianceCohortId(null)}
          footer={
            <>
              <button className="primary-button" onClick={() => addToast('Compliance report exported.', 'success')}>Export Report</button>
              <button className="secondary-button" onClick={() => setComplianceCohortId(null)}>Close</button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div className="kpi-card" style={{ flex: 1, padding: '10px 14px' }}><h3>Enrolled</h3><p>{complianceCohort.filled}/{complianceCohort.seats}</p></div>
            <div className={'kpi-card ' + (complianceCohort.health === 'on-track' ? 'kpi-green' : complianceCohort.health === 'at-risk' ? 'kpi-yellow' : 'kpi-red')} style={{ flex: 1, padding: '10px 14px' }}>
              <h3>Health</h3><p style={{ textTransform: 'capitalize' }}>{complianceCohort.health}</p>
            </div>
            <div className="kpi-card" style={{ flex: 1, padding: '10px 14px' }}><h3>Phase</h3><p style={{ textTransform: 'capitalize' }}>{complianceCohort.phase}</p></div>
          </div>
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Control Area</th>
                  <th className="datatable-th">Status</th>
                  <th className="datatable-th">Due Date</th>
                  <th className="datatable-th">Owner</th>
                  <th className="datatable-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.area}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.due}</td>
                    <td>{item.owner}</td>
                    <td><button className="action-btn" onClick={() => addToast('Action opened for: ' + item.area, 'info')}>Action</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Add Learner Modal */}
      {addUserCohort && (
        <Modal
          title={'Add Learner — ' + addUserCohort.name}
          onClose={() => setAddUserCohortId(null)}
          footer={
            <>
              <button className="primary-button" onClick={handleAddUserToCohort}>Add to Cohort</button>
              <button className="secondary-button" onClick={() => setAddUserCohortId(null)}>Cancel</button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="form-label"><span>Full Name</span>
              <input className="form-input" value={newLearnerName} onChange={(e) => setNewLearnerName(e.target.value)} placeholder="Full name" />
            </label>
            <label className="form-label"><span>Access Card ID</span>
              <input className="form-input" value={newLearnerAccessCard} onChange={(e) => setNewLearnerAccessCard(e.target.value)} placeholder="e.g. AC-10099" />
            </label>
            <label className="form-label"><span>Laptop ID</span>
              <input className="form-input" value={newLearnerLaptopSerial} onChange={(e) => setNewLearnerLaptopSerial(e.target.value)} placeholder="e.g. LT-2026-0099" />
            </label>
            <label className="form-label"><span>SIM Card ID</span>
              <input className="form-input" value={newLearnerSimCard} onChange={(e) => setNewLearnerSimCard(e.target.value)} placeholder="e.g. SIM-2026-0099" />
            </label>
            <label className="form-label"><span>Initial Attendance %</span>
              <input type="number" className="form-input" min={0} max={100} value={newLearnerAttendance} onChange={(e) => setNewLearnerAttendance(e.target.value)} />
            </label>
          </div>
        </Modal>
      )}

      {/* Edit Cohort Modal */}
      {editCohort && (
        <Modal
          title={'Edit Cohort — ' + editCohort.name}
          onClose={() => setEditCohortId(null)}
          footer={
            <>
              <button className="primary-button" onClick={saveEditCohort}>Save Changes</button>
              <button className="secondary-button" onClick={() => setEditCohortId(null)}>Cancel</button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className={'tab-btn' + (editTab === 'info' ? ' tab-btn-active' : '')} onClick={() => setEditTab('info')}>Info & Admin</button>
            <button className={'tab-btn' + (editTab === 'phases' ? ' tab-btn-active' : '')} onClick={() => setEditTab('phases')}>Phase Timeline ({editPhases.filter((p) => p.completed).length}/{editPhases.length})</button>
          </div>

          {editTab === 'info' && (
            <div style={{ display: 'grid', gap: 14 }}>
              <fieldset style={{ border: '1px solid var(--input-border)', borderRadius: 10, padding: 12, margin: 0 }}>
                <legend style={{ padding: '0 6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registration &amp; Funding</legend>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label className="form-label"><span>Reference Number</span>
                    <input className="form-input" value={editRefNumber} onChange={(e) => setEditRefNumber(e.target.value)} placeholder="e.g. LA-2026-001" />
                  </label>
                  <label className="form-label"><span>SETA Code / Registration</span>
                    <input className="form-input" value={editSetaCode} onChange={(e) => setEditSetaCode(e.target.value)} placeholder="e.g. CHIETA-2026-001" />
                  </label>
                  <label className="form-label"><span>NQF Level</span>
                    <select className="form-input" value={editNqfLevel} onChange={(e) => setEditNqfLevel(e.target.value)}>
                      {['1','2','3','4','5','6','7','8'].map((l) => <option key={l} value={l}>Level {l}</option>)}
                    </select>
                  </label>
                  <label className="form-label"><span>Cohort End Date</span>
                    <input
                      type="date"
                      className="form-input"
                      value={editCohortEndDate}
                      onChange={(e) => {
                        setEditCohortEndDate(e.target.value);
                        setEditAutoEndDate(false);
                      }}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editAutoEndDate}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setEditAutoEndDate(enabled);
                          if (enabled && suggestedEditEndDate) {
                            setEditCohortEndDate(suggestedEditEndDate);
                          }
                        }}
                      />
                      <span>Auto-calculate from intake/type</span>
                    </label>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => {
                        if (!suggestedEditEndDate) {
                          addToast('Cannot infer end date because intake format is invalid.', 'warning');
                          return;
                        }
                        setEditCohortEndDate(suggestedEditEndDate);
                        setEditAutoEndDate(true);
                        addToast('Default duration end date applied (' + (editCohort?.type === 'learnership' ? '1 year' : '2 years') + ').', 'info');
                      }}
                    >
                      Recalculate Default ({editCohort?.type === 'learnership' ? '1 year' : '2 years'})
                    </button>
                    {suggestedEditEndDate ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Suggested: {suggestedEditEndDate}
                      </span>
                    ) : null}
                  </div>
                  <label className="form-label"><span>Funding Source</span>
                    <select className="form-input" value={editFundingSource} onChange={(e) => setEditFundingSource(e.target.value)}>
                      <option value="SETA Funded">SETA Funded</option>
                      <option value="Employer Co-funded">Employer Co-funded</option>
                      <option value="Government Grant">Government Grant</option>
                      <option value="Employer Funded">Employer Funded</option>
                    </select>
                  </label>
                  <label className="form-label"><span>Monthly Stipend (ZAR)</span>
                    <input className="form-input" value={editStipendAmount} onChange={(e) => setEditStipendAmount(e.target.value)} placeholder="e.g. 3500" />
                  </label>
                </div>
              </fieldset>

              <fieldset style={{ border: '1px solid var(--input-border)', borderRadius: 10, padding: 12, margin: 0 }}>
                <legend style={{ padding: '0 6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Training Site &amp; Transport</legend>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label className="form-label"><span>Training Site Address</span>
                    <input className="form-input" value={editTrainingSite} onChange={(e) => setEditTrainingSite(e.target.value)} placeholder="Full street address" />
                  </label>
                  <label className="form-label"><span>Transport Provided</span>
                    <select className="form-input" value={editTransport} onChange={(e) => setEditTransport(e.target.value as 'yes' | 'no')}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  {editTransport === 'yes' && (
                    <label className="form-label"><span>Transport Provider</span>
                      <input className="form-input" value={editTransportProvider} onChange={(e) => setEditTransportProvider(e.target.value)} placeholder="Provider name" />
                    </label>
                  )}
                </div>
              </fieldset>

              <details style={{ border: '1px solid var(--input-border)', borderRadius: 10, padding: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>What a cohort typically requires</summary>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
                  <li>Learnership / YDP registration with relevant SETA and NQF level</li>
                  <li>Signed learnership agreement (employer + learner)</li>
                  <li>Medical fitness certificate (pre-entry and exit)</li>
                  <li>SAPS background clearance</li>
                  <li>Access card issuance and equipment allocation (laptop / SIM)</li>
                  <li>Stipend schedule and payment confirmation</li>
                  <li>Transport arrangement and daily register</li>
                  <li>Quarterly review cycle signed off by employer and coach</li>
                  <li>SETA portfolio of evidence submission per unit standard</li>
                  <li>Final assessment and certification by accredited body</li>
                </ul>
              </details>
            </div>
          )}

          {editTab === 'phases' && (
            <div style={{ display: 'grid', gap: 10 }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Tick phases as they complete. Health and programme phase are auto-derived on save.
              </p>
              {editPhases.map((phase, idx) => (
                <div key={phase.key} style={{ border: '1px solid var(--input-border)', borderRadius: 10, padding: 12 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={phase.completed}
                      onChange={(e) => {
                        const next = [...editPhases];
                        next[idx] = { ...next[idx], completed: e.target.checked };
                        setEditPhases(next);
                      }}
                    />
                    <strong>{phase.label}</strong>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <label className="form-label"><span>Start Date</span>
                      <input type="date" className="form-input" value={phase.startDate}
                        onChange={(e) => { const next = [...editPhases]; next[idx] = { ...next[idx], startDate: e.target.value }; setEditPhases(next); }}
                      />
                    </label>
                    <label className="form-label"><span>End Date</span>
                      <input type="date" className="form-input" value={phase.endDate}
                        onChange={(e) => { const next = [...editPhases]; next[idx] = { ...next[idx], endDate: e.target.value }; setEditPhases(next); }}
                      />
                    </label>
                  </div>
                  <label className="form-label" style={{ marginTop: 6 }}><span>Notes</span>
                    <input className="form-input" value={phase.notes} placeholder="Optional notes"
                      onChange={(e) => { const next = [...editPhases]; next[idx] = { ...next[idx], notes: e.target.value }; setEditPhases(next); }}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Remediation Plan Modal */}
      {remediationOpen && remediationCohort && (
        <Modal
          title={'Remediation Plan — ' + remediationCohort.name}
          onClose={() => setRemediationOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={submitRemediationPlan}>Save Plan</button>
              <button className="secondary-button" onClick={() => setRemediationOpen(false)}>Cancel</button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="form-label"><span>Owner</span>
              <input className="form-input" value={remediationOwner} onChange={(e) => setRemediationOwner(e.target.value)} />
            </label>
            <label className="form-label"><span>Due Date</span>
              <input type="date" className="form-input" value={remediationDueDate} onChange={(e) => setRemediationDueDate(e.target.value)} />
            </label>
            <label className="form-label"><span>Remediation Notes</span>
              <textarea
                className="form-input"
                rows={4}
                value={remediationNotes}
                onChange={(e) => setRemediationNotes(e.target.value)}
                placeholder="What needs to happen, who is responsible, and how completion will be confirmed"
              />
            </label>
          </div>
        </Modal>
      )}

      {/* Legacy Backfill Audit Modal */}
      {backfillAuditOpen && (
        <Modal
          title="Legacy Learner ID Backfill Audit"
          onClose={() => setBackfillAuditOpen(false)}
          footer={<button className="secondary-button" onClick={() => setBackfillAuditOpen(false)}>Close</button>}
        >
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.87rem' }}>
            Last audit run: {backfillAuditAt ? new Date(backfillAuditAt).toLocaleString() : 'Not recorded'}
          </p>
          <div className="datatable-scroll">
            <table className="datatable">
              <thead>
                <tr>
                  <th className="datatable-th">Cohort</th>
                  <th className="datatable-th">Learners</th>
                  <th className="datatable-th">Missing Laptop ID</th>
                  <th className="datatable-th">Missing SIM ID</th>
                  <th className="datatable-th">Legacy Fields Detected</th>
                </tr>
              </thead>
              <tbody>
                {backfillAuditRows.map((row) => (
                  <tr key={row.cohortId}>
                    <td>{row.cohortName}</td>
                    <td>{row.learners}</td>
                    <td>{row.missingLaptop}</td>
                    <td>{row.missingSim}</td>
                    <td>{row.legacyFlagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Transfer Wizard */}
      {transferOpen && (
        <Modal
          title="Learner Transfer Wizard"
          onClose={() => setTransferOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={handleTransferSubmit}>
                Confirm Transfer ({transferSelectedIds.length} learner{transferSelectedIds.length !== 1 ? 's' : ''})
              </button>
              <button className="secondary-button" onClick={() => setTransferOpen(false)}>Cancel</button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <label className="form-label"><span>From Cohort</span>
              <select className="form-input" value={transferFromId}
                onChange={(e) => { setTransferFromId(e.target.value); setTransferSelectedIds([]); setTransferSearch(''); }}>
                <option value="">Select source cohort</option>
                {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name} ({cohortDetails[c.id]?.learners?.length ?? 0} learners)</option>)}
              </select>
            </label>
            <label className="form-label"><span>To Cohort</span>
              <select className="form-input" value={transferToId} onChange={(e) => setTransferToId(e.target.value)}>
                <option value="">Select destination cohort</option>
                {cohorts.filter((c) => c.id !== transferFromId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            {transferFromId && (
              <div style={{ borderTop: '1px solid var(--input-border)', paddingTop: 12 }}>
                <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
                  Select Learners to Transfer &mdash; {transferSelectedIds.length} selected
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <select className="form-input" style={{ maxWidth: 180 }} value={transferFilter}
                    onChange={(e) => { setTransferFilter(e.target.value as 'name' | 'accessCard' | 'serial'); setTransferSearch(''); }}>
                    <option value="name">Filter by Name</option>
                    <option value="accessCard">Filter by Access Card ID</option>
                    <option value="serial">Filter by Serial ID</option>
                  </select>
                  <input className="form-input" style={{ flex: 1 }}
                    placeholder={transferFilter === 'name' ? 'Type learner name…' : transferFilter === 'accessCard' ? 'e.g. AC-10041' : 'e.g. LT-2026-0041'}
                    value={transferSearch}
                    onChange={(e) => setTransferSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button className="action-btn" onClick={() => setTransferSelectedIds(transferSourceLearners.map((l) => l.id))}>Select All Shown</button>
                  <button className="action-btn" onClick={() => setTransferSelectedIds([])}>Clear Selection</button>
                </div>
                {transferSourceLearners.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No learners match your search.</p>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: 'auto', display: 'grid', gap: 6 }}>
                    {transferSourceLearners.map((l) => (
                      <label
                        key={l.id}
                        style={{
                          display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px',
                          border: '1px solid ' + (transferSelectedIds.includes(l.id) ? 'var(--accent-cyan)' : 'var(--input-border)'),
                          borderRadius: 8, cursor: 'pointer',
                          background: transferSelectedIds.includes(l.id) ? 'color-mix(in srgb, var(--accent-cyan) 10%, var(--surface))' : 'var(--surface)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={transferSelectedIds.includes(l.id)}
                          onChange={(e) => {
                            setTransferSelectedIds((prev) =>
                              e.target.checked ? [...prev, l.id] : prev.filter((id) => id !== l.id)
                            );
                          }}
                        />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600 }}>{l.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {l.accessCardId} &bull; Laptop: {l.laptopSerialId} &bull; SIM: {l.simCardId} &bull; {l.attendance}% attendance
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
