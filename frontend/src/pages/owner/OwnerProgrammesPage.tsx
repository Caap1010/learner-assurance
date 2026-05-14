import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { ProgrammeTemplate, ProgrammeTrack } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

type TemplateFormState = {
  name: string;
  institute: string;
  track: ProgrammeTrack;
  duration: string;
  milestones: string;
  evidenceItems: string;
  version: string;
  migrationRule: string;
};

const EMPTY_FORM: TemplateFormState = {
  name: '',
  institute: '',
  track: 'Learnership',
  duration: '12 months',
  milestones: '8',
  evidenceItems: '15',
  version: 'v1.0',
  migrationRule: 'Manual approval only',
};

function daysSince(dateValue: string) {
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
}

function toFormState(template?: ProgrammeTemplate | null): TemplateFormState {
  if (!template) return EMPTY_FORM;
  return {
    name: template.name,
    institute: template.institute,
    track: template.track,
    duration: template.duration,
    milestones: String(template.milestones),
    evidenceItems: String(template.evidenceItems),
    version: template.version,
    migrationRule: template.migrationRule,
  };
}

export default function OwnerProgrammesPage() {
  const { addToast } = useToast();
  const {
    cohorts,
    cohortDetails,
    programmeTemplates,
    createProgrammeTemplate,
    updateProgrammeTemplate,
    cloneProgrammeTemplate,
    publishProgrammeTemplateVersion,
    programmeAssignments,
    assignLearnersToProgramme,
    removeProgrammeAssignment,
  } = usePlatformData();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProgrammeId, setEditProgrammeId] = useState<string | null>(null);
  const [assignProgrammeId, setAssignProgrammeId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(EMPTY_FORM);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);

  const editProgramme = useMemo(
    () => programmeTemplates.find((template) => template.id === editProgrammeId) ?? null,
    [programmeTemplates, editProgrammeId],
  );

  const assignProgramme = useMemo(
    () => programmeTemplates.find((template) => template.id === assignProgrammeId) ?? null,
    [programmeTemplates, assignProgrammeId],
  );

  const assignmentCounts = useMemo(() => {
    return programmeAssignments.reduce<Record<string, number>>((acc, assignment) => {
      acc[assignment.programmeId] = (acc[assignment.programmeId] ?? 0) + 1;
      return acc;
    }, {});
  }, [programmeAssignments]);

  const templatesDueReview = useMemo(
    () => programmeTemplates.filter((template) => daysSince(template.lastUpdatedAt) >= 30).length,
    [programmeTemplates],
  );

  const availableLearners = useMemo(() => {
    const allLearners = cohorts.flatMap((cohort) => {
      const learners = cohortDetails[cohort.id]?.learners ?? [];
      return learners.map((learner) => ({
        learnerId: learner.id,
        learnerName: learner.name,
        cohortId: cohort.id,
        cohortName: cohort.name,
        attendance: learner.attendance,
        status: learner.status,
      }));
    });

    const assignedToCurrent = new Set(
      programmeAssignments
        .filter((assignment) => assignment.programmeId === assignProgrammeId)
        .map((assignment) => assignment.learnerId),
    );

    const q = learnerSearch.trim().toLowerCase();
    return allLearners.filter((learner) => {
      if (assignedToCurrent.has(learner.learnerId)) return false;
      if (!q) return true;
      return `${learner.learnerName} ${learner.cohortName} ${learner.status}`.toLowerCase().includes(q);
    });
  }, [assignProgrammeId, cohortDetails, cohorts, learnerSearch, programmeAssignments]);

  const currentAssignments = useMemo(
    () => programmeAssignments.filter((assignment) => assignment.programmeId === assignProgrammeId),
    [programmeAssignments, assignProgrammeId],
  );

  useEffect(() => {
    if (!createOpen && !editProgramme) {
      setTemplateForm(EMPTY_FORM);
    }
  }, [createOpen, editProgramme]);

  useEffect(() => {
    if (editProgramme) {
      setTemplateForm(toFormState(editProgramme));
    }
  }, [editProgramme]);

  useEffect(() => {
    if (!assignProgrammeId) {
      setLearnerSearch('');
      setSelectedLearnerIds([]);
    }
  }, [assignProgrammeId]);

  function updateForm<K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K]) {
    setTemplateForm((prev) => ({ ...prev, [key]: value }));
  }

  function closeTemplateModal() {
    setCreateOpen(false);
    setEditProgrammeId(null);
    setTemplateForm(EMPTY_FORM);
  }

  function handleTemplateSubmit() {
    const name = templateForm.name.trim();
    const institute = templateForm.institute.trim();
    const duration = templateForm.duration.trim();
    const version = templateForm.version.trim();
    const migrationRule = templateForm.migrationRule.trim();
    const milestones = Number(templateForm.milestones);
    const evidenceItems = Number(templateForm.evidenceItems);

    if (!name || !institute || !duration || !version || !migrationRule) {
      addToast('Complete all programme template fields before saving.', 'warning');
      return;
    }
    if (!Number.isFinite(milestones) || milestones <= 0 || !Number.isFinite(evidenceItems) || evidenceItems <= 0) {
      addToast('Milestones and evidence checklist counts must be greater than zero.', 'warning');
      return;
    }

    const payload = {
      name,
      institute,
      track: templateForm.track,
      duration,
      milestones,
      evidenceItems,
      version,
      migrationRule,
    };

    if (editProgrammeId) {
      updateProgrammeTemplate(editProgrammeId, payload);
      addToast(`${name} updated.`, 'success');
    } else {
      createProgrammeTemplate(payload);
      addToast(`${name} created.`, 'success');
    }

    closeTemplateModal();
  }

  function handleAssignLearners() {
    if (!assignProgrammeId) return;
    const pickedLearners = availableLearners.filter((learner) => selectedLearnerIds.includes(learner.learnerId));
    if (pickedLearners.length === 0) {
      addToast('Select at least one learner to assign.', 'warning');
      return;
    }
    assignLearnersToProgramme(assignProgrammeId, pickedLearners);
    addToast(`${pickedLearners.length} learner${pickedLearners.length === 1 ? '' : 's'} assigned.`, 'success');
    setSelectedLearnerIds([]);
    setLearnerSearch('');
  }

  function handleExport(template: ProgrammeTemplate) {
    addToast(`${template.name} export queued with ${assignmentCounts[template.id] ?? 0} assigned learners.`, 'info');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Programmes</h1>
        </div>
        <button className="primary-button" onClick={() => { setTemplateForm(EMPTY_FORM); setCreateOpen(true); }}>
          + New Template
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Templates</h3><p>{programmeTemplates.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Active Learnership Tracks</h3><p>{programmeTemplates.filter((template) => template.track === 'Learnership').length}</p></div>
        <div className="kpi-card"><h3>Active YDP Tracks</h3><p>{programmeTemplates.filter((template) => template.track === 'YDP').length}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Templates Due Review</h3><p>{templatesDueReview}</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Catalog Versioning & Migration Rules</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {programmeTemplates.map((programme) => (
            <div key={programme.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{programme.name} • {programme.version}</p>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>Offered by {programme.institute}</p>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{programme.migrationRule}</p>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Last updated {daysSince(programme.lastUpdatedAt)} day{daysSince(programme.lastUpdatedAt) === 1 ? '' : 's'} ago
                  </p>
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {assignmentCounts[programme.id] ?? 0} learners assigned
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="action-btn" onClick={() => { publishProgrammeTemplateVersion(programme.id); addToast(`Published ${programme.name} ${programme.version}.`, 'success'); }}>
                  Publish New Version
                </button>
                <button className="action-btn" onClick={() => addToast(`${assignmentCounts[programme.id] ?? 0} learner assignments will be reviewed before migration.`, 'info')}>
                  Preview Migration Impact
                </button>
                <button className="action-btn" onClick={() => setEditProgrammeId(programme.id)}>
                  Edit Migration Rules
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Programme Templates</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Assign learners directly from cohort rosters and maintain versioned templates.
          </p>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Programme</th>
                <th className="datatable-th">Institute</th>
                <th className="datatable-th">Track</th>
                <th className="datatable-th">Duration</th>
                <th className="datatable-th">Version</th>
                <th className="datatable-th">Milestones</th>
                <th className="datatable-th">Evidence Checklist</th>
                <th className="datatable-th">Assigned Learners</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmeTemplates.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.institute}</td>
                  <td>{row.track}</td>
                  <td>{row.duration}</td>
                  <td>{row.version}</td>
                  <td>{row.milestones}</td>
                  <td>{row.evidenceItems}</td>
                  <td>{assignmentCounts[row.id] ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => setEditProgrammeId(row.id)}>Edit</button>
                      <button className="action-btn" onClick={() => setAssignProgrammeId(row.id)}>Learners</button>
                      <button className="action-btn" onClick={() => { cloneProgrammeTemplate(row.id); addToast(`Cloned ${row.name}.`, 'success'); }}>Clone</button>
                      <button className="action-btn" onClick={() => handleExport(row)}>Export</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(createOpen || editProgramme) && (
        <Modal
          title={editProgramme ? `Edit ${editProgramme.name}` : 'Create Programme Template'}
          onClose={closeTemplateModal}
          footer={(
            <>
              <button className="secondary-button" onClick={closeTemplateModal}>Cancel</button>
              <button className="primary-button" onClick={handleTemplateSubmit}>{editProgramme ? 'Save Changes' : 'Create Template'}</button>
            </>
          )}
        >
          <label className="form-label">
            Programme name
            <input className="form-input" value={templateForm.name} onChange={(event) => updateForm('name', event.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Institute
              <input className="form-input" value={templateForm.institute} onChange={(event) => updateForm('institute', event.target.value)} placeholder="e.g. North Skills Institute" />
            </label>
            <label className="form-label">
              Track
              <select className="form-input" value={templateForm.track} onChange={(event) => updateForm('track', event.target.value as ProgrammeTrack)}>
                <option value="Learnership">Learnership</option>
                <option value="YDP">YDP</option>
              </select>
            </label>
            <label className="form-label">
              Duration
              <input className="form-input" value={templateForm.duration} onChange={(event) => updateForm('duration', event.target.value)} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Version
              <input className="form-input" value={templateForm.version} onChange={(event) => updateForm('version', event.target.value)} />
            </label>
            <label className="form-label">
              Milestones
              <input className="form-input" type="number" min="1" value={templateForm.milestones} onChange={(event) => updateForm('milestones', event.target.value)} />
            </label>
            <label className="form-label">
              Evidence items
              <input className="form-input" type="number" min="1" value={templateForm.evidenceItems} onChange={(event) => updateForm('evidenceItems', event.target.value)} />
            </label>
          </div>
          <label className="form-label">
            Migration rule
            <textarea className="form-input" rows={4} value={templateForm.migrationRule} onChange={(event) => updateForm('migrationRule', event.target.value)} />
          </label>
        </Modal>
      )}

      {assignProgramme && (
        <Modal
          title={`Manage Learners · ${assignProgramme.name}`}
          onClose={() => setAssignProgrammeId(null)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setAssignProgrammeId(null)}>Close</button>
              <button className="primary-button" onClick={handleAssignLearners}>Assign Selected Learners</button>
            </>
          )}
        >
          <label className="form-label">
            Search cohort learners
            <input className="form-input" value={learnerSearch} onChange={(event) => setLearnerSearch(event.target.value)} placeholder="Search by learner or cohort" />
          </label>

          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Available learners</p>
              <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {availableLearners.length === 0 && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No matching learners available.</p>
                )}
                {availableLearners.map((learner) => {
                  const checked = selectedLearnerIds.includes(learner.learnerId);
                  return (
                    <label key={`${learner.cohortId}:${learner.learnerId}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid var(--input-border)', borderRadius: 10, padding: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedLearnerIds((prev) => (
                          checked ? prev.filter((id) => id !== learner.learnerId) : [...prev, learner.learnerId]
                        ))}
                      />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{learner.learnerName}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{learner.cohortName}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Attendance {learner.attendance}% · {learner.status}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Assigned learners</p>
              <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {currentAssignments.length === 0 && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No learners assigned yet.</p>
                )}
                {currentAssignments.map((assignment) => (
                  <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid var(--input-border)', borderRadius: 10, padding: 10 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{assignment.learnerName}</p>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{assignment.cohortName}</p>
                    </div>
                    <button className="action-btn action-btn-danger" onClick={() => { removeProgrammeAssignment(assignment.id); addToast(`${assignment.learnerName} removed from ${assignProgramme.name}.`, 'info'); }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
