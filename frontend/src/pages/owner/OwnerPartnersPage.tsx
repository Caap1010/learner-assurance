import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { EmployerPipelineStatus, InstituteOfferingStatus, OwnerPartner } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

type PartnerForm = {
  name: string;
  type: 'Employer' | 'Institute';
  manager: string;
  threshold: string;
  contractEndDate: string;
  status: 'active' | 'onboarding' | 'inactive';
};

const EMPTY_FORM: PartnerForm = {
  name: '',
  type: 'Employer',
  manager: '',
  threshold: '95%',
  contractEndDate: '',
  status: 'onboarding',
};

function toForm(partner?: OwnerPartner | null): PartnerForm {
  if (!partner) return EMPTY_FORM;
  return {
    name: partner.name,
    type: partner.type,
    manager: partner.manager,
    threshold: partner.threshold,
    contractEndDate: partner.contractEndDate,
    status: partner.status,
  };
}

function toStatus(slaScore: number) {
  if (slaScore >= 95) return 'on-track';
  if (slaScore >= 88) return 'at-risk';
  return 'escalated';
}

function offeringStatusToBadge(status: InstituteOfferingStatus) {
  if (status === 'active') return 'on-track';
  if (status === 'expiring') return 'at-risk';
  if (status === 'expired') return 'escalated';
  return 'review';
}

type ShortlistForm = {
  partnerId: string;
  learnerId: string;
  roleTitle: string;
};

type OfferingForm = {
  id?: string;
  partnerId: string;
  programmeName: string;
  nqfLevel: string;
  certificate: string;
  seats: string;
  accreditationCode: string;
  accreditationExpiry: string;
};

export default function OwnerPartnersPage() {
  const { addToast } = useToast();
  const {
    partners,
    addPartner,
    updatePartner,
    cohorts,
    cohortDetails,
    employerShortlists,
    addEmployerShortlist,
    updateEmployerShortlistStatus,
    instituteOfferings,
    upsertInstituteOffering,
    updateInstituteOfferingStatus,
  } = usePlatformData();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Employer' | 'Institute'>('all');
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [shortlistForm, setShortlistForm] = useState<ShortlistForm>({ partnerId: '', learnerId: '', roleTitle: '' });
  const [offeringModalOpen, setOfferingModalOpen] = useState(false);
  const [offeringForm, setOfferingForm] = useState<OfferingForm>({
    partnerId: '',
    programmeName: '',
    nqfLevel: '',
    certificate: '',
    seats: '',
    accreditationCode: '',
    accreditationExpiry: '',
  });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const partnerCohortStats = useMemo(() => {
    return partners.map((partner) => {
      const linked = cohorts.filter((cohort) =>
        partner.type === 'Employer'
          ? cohort.employer.toLowerCase() === partner.name.toLowerCase()
          : cohort.institute.toLowerCase() === partner.name.toLowerCase(),
      );
      const healthScore = linked.length === 0
        ? 100
        : linked.reduce((acc, cohort) => {
          if (cohort.health === 'on-track' || cohort.health === 'completed') return acc + 98;
          if (cohort.health === 'at-risk') return acc + 90;
          return acc + 82;
        }, 0) / linked.length;

      return {
        ...partner,
        cohorts: linked.length,
        slaScore: Number(healthScore.toFixed(1)),
      };
    });
  }, [partners, cohorts]);

  const filteredPartners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partnerCohortStats.filter((partner) => {
      if (typeFilter !== 'all' && partner.type !== typeFilter) return false;
      if (!q) return true;
      return `${partner.name} ${partner.manager} ${partner.type}`.toLowerCase().includes(q);
    });
  }, [partnerCohortStats, query, typeFilter]);

  const employerPartners = useMemo(
    () => partners.filter((partner) => partner.type === 'Employer'),
    [partners],
  );

  const institutePartners = useMemo(
    () => partners.filter((partner) => partner.type === 'Institute'),
    [partners],
  );

  const learnerPool = useMemo(() => {
    return Object.entries(cohortDetails).flatMap(([cohortId, detail]) => {
      const cohort = cohorts.find((entry) => entry.id === cohortId);
      const cohortName = cohort?.name ?? cohortId;
      return detail.learners
        .filter((learner) => learner.status === 'active')
        .map((learner) => ({
          learnerId: learner.id,
          learnerName: learner.name,
          cohortId,
          cohortName,
          performanceScore: learner.attendance,
        }));
    }).sort((a, b) => b.performanceScore - a.performanceScore);
  }, [cohortDetails, cohorts]);

  const employerScorecards = useMemo(() => {
    return employerPartners.map((partner) => {
      const pipeline = employerShortlists.filter((entry) => entry.partnerId === partner.id);
      const hired = pipeline.filter((entry) => entry.status === 'hired').length;
      const offered = pipeline.filter((entry) => entry.status === 'offered' || entry.status === 'hired').length;
      const conversion = pipeline.length === 0 ? 0 : (hired / pipeline.length) * 100;
      const offerRate = pipeline.length === 0 ? 0 : (offered / pipeline.length) * 100;
      return {
        partner,
        pipelineCount: pipeline.length,
        hired,
        conversion: conversion.toFixed(1),
        offerRate: offerRate.toFixed(1),
      };
    });
  }, [employerPartners, employerShortlists]);

  const instituteScorecards = useMemo(() => {
    return institutePartners.map((partner) => {
      const offerings = instituteOfferings.filter((offering) => offering.partnerId === partner.id);
      const active = offerings.filter((offering) => offering.status === 'active').length;
      const expiring = offerings.filter((offering) => offering.status === 'expiring').length;
      const expired = offerings.filter((offering) => offering.status === 'expired').length;
      const accreditationHealth = offerings.length === 0
        ? 100
        : ((active + expiring * 0.5) / offerings.length) * 100;
      return {
        partner,
        offerings: offerings.length,
        active,
        expiring,
        expired,
        accreditationHealth: accreditationHealth.toFixed(1),
      };
    });
  }, [instituteOfferings, institutePartners]);

  const kpis = useMemo(() => {
    const institutes = partnerCohortStats.filter((partner) => partner.type === 'Institute').length;
    const employers = partnerCohortStats.filter((partner) => partner.type === 'Employer').length;
    const active = partnerCohortStats.filter((partner) => partner.status === 'active').length;
    const avgSla = partnerCohortStats.length === 0
      ? 0
      : partnerCohortStats.reduce((acc, partner) => acc + partner.slaScore, 0) / partnerCohortStats.length;
    const shortlisted = employerShortlists.length;
    const hired = employerShortlists.filter((entry) => entry.status === 'hired').length;
    const expiringAccreditations = instituteOfferings.filter((offering) => offering.status === 'expiring').length;
    return { institutes, employers, active, avgSla: avgSla.toFixed(1), shortlisted, hired, expiringAccreditations };
  }, [employerShortlists, instituteOfferings, partnerCohortStats]);

  function openCreatePartner() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPartnerModalOpen(true);
  }

  function openEditPartner(id: string) {
    const partner = partners.find((item) => item.id === id);
    if (!partner) return;
    setEditingId(id);
    setForm(toForm(partner));
    setPartnerModalOpen(true);
  }

  function closeModal() {
    setPartnerModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function submitPartner() {
    const name = form.name.trim();
    const manager = form.manager.trim();
    const threshold = form.threshold.trim();
    if (name.length < 3) {
      addToast('Partner name must be at least 3 characters.', 'warning');
      return;
    }
    if (manager.length < 3) {
      addToast('Account manager must be at least 3 characters.', 'warning');
      return;
    }
    if (!/^\d{2,3}%$/.test(threshold)) {
      addToast('Threshold format should look like 95%.', 'warning');
      return;
    }

    const payload = {
      name,
      type: form.type,
      manager,
      threshold,
      contractEndDate: form.contractEndDate,
      status: form.status,
    };

    if (editingId) {
      updatePartner(editingId, payload);
      addToast('Partner profile updated.', 'success');
    } else {
      addPartner(payload);
      addToast('Partner onboarded.', 'success');
    }
    closeModal();
  }

  function submitShortlist() {
    const roleTitle = shortlistForm.roleTitle.trim();
    const partner = employerPartners.find((entry) => entry.id === shortlistForm.partnerId);
    const learner = learnerPool.find((entry) => entry.learnerId === shortlistForm.learnerId);
    if (!partner || !learner) {
      addToast('Select both employer and learner.', 'warning');
      return;
    }
    if (roleTitle.length < 3) {
      addToast('Role title must be at least 3 characters.', 'warning');
      return;
    }
    addEmployerShortlist({
      partnerId: partner.id,
      partnerName: partner.name,
      learnerId: learner.learnerId,
      learnerName: learner.learnerName,
      cohortId: learner.cohortId,
      cohortName: learner.cohortName,
      performanceScore: learner.performanceScore,
      roleTitle,
    });
    setShortlistModalOpen(false);
    setShortlistForm({ partnerId: '', learnerId: '', roleTitle: '' });
    addToast('Learner added to employer pipeline.', 'success');
  }

  function openCreateOffering() {
    setOfferingForm({
      partnerId: '',
      programmeName: '',
      nqfLevel: '',
      certificate: '',
      seats: '',
      accreditationCode: '',
      accreditationExpiry: '',
    });
    setOfferingModalOpen(true);
  }

  function openEditOffering(id: string) {
    const offering = instituteOfferings.find((entry) => entry.id === id);
    if (!offering) return;
    setOfferingForm({
      id: offering.id,
      partnerId: offering.partnerId,
      programmeName: offering.programmeName,
      nqfLevel: offering.nqfLevel,
      certificate: offering.certificate,
      seats: String(offering.seats),
      accreditationCode: offering.accreditationCode,
      accreditationExpiry: offering.accreditationExpiry,
    });
    setOfferingModalOpen(true);
  }

  function submitOffering() {
    const partner = institutePartners.find((entry) => entry.id === offeringForm.partnerId);
    const programmeName = offeringForm.programmeName.trim();
    const certificate = offeringForm.certificate.trim();
    const accreditationCode = offeringForm.accreditationCode.trim();
    const seats = Number(offeringForm.seats);
    if (!partner) {
      addToast('Choose an institute partner.', 'warning');
      return;
    }
    if (programmeName.length < 3 || certificate.length < 3) {
      addToast('Programme and certificate fields must be at least 3 characters.', 'warning');
      return;
    }
    if (!offeringForm.nqfLevel.trim()) {
      addToast('Provide NQF level.', 'warning');
      return;
    }
    if (!accreditationCode || !offeringForm.accreditationExpiry) {
      addToast('Provide accreditation code and expiry date.', 'warning');
      return;
    }
    if (!Number.isFinite(seats) || seats <= 0) {
      addToast('Seats must be a positive number.', 'warning');
      return;
    }
    upsertInstituteOffering({
      partnerId: partner.id,
      partnerName: partner.name,
      programmeName,
      nqfLevel: offeringForm.nqfLevel.trim(),
      certificate,
      seats,
      accreditationCode,
      accreditationExpiry: offeringForm.accreditationExpiry,
    }, offeringForm.id);
    setOfferingModalOpen(false);
    addToast(offeringForm.id ? 'Institute offering updated.' : 'Institute offering created.', 'success');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Partners</h1>
        </div>
        <button className="primary-button" onClick={openCreatePartner}>+ Add Partner</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Partners</h3><p>{partnerCohortStats.length}</p></div>
        <div className="kpi-card"><h3>Institutes</h3><p>{kpis.institutes}</p></div>
        <div className="kpi-card"><h3>Employers</h3><p>{kpis.employers}</p></div>
        <div className="kpi-card kpi-green"><h3>Average SLA</h3><p>{kpis.avgSla}%</p></div>
        <div className="kpi-card"><h3>Employer Shortlists</h3><p>{kpis.shortlisted}</p></div>
        <div className="kpi-card kpi-green"><h3>Hires Confirmed</h3><p>{kpis.hired}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Expiring Accreditations</h3><p>{kpis.expiringAccreditations}</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Owner Scorecards by Partner Type</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Employer Performance</h3>
            {employerScorecards.map((entry) => (
              <div key={entry.partner.id} style={{ display: 'grid', gap: 4, padding: '8px 0', borderBottom: '1px dashed var(--input-border)' }}>
                <strong>{entry.partner.name}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>Pipeline: {entry.pipelineCount} • Offer Rate: {entry.offerRate}% • Hire Conversion: {entry.conversion}%</span>
              </div>
            ))}
          </div>
          <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Institute Accreditation Health</h3>
            {instituteScorecards.map((entry) => (
              <div key={entry.partner.id} style={{ display: 'grid', gap: 4, padding: '8px 0', borderBottom: '1px dashed var(--input-border)' }}>
                <strong>{entry.partner.name}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>Programmes: {entry.offerings} • Active: {entry.active} • Expiring: {entry.expiring} • Health: {entry.accreditationHealth}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Employer & Institute Network</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={'secondary-button' + (typeFilter === 'all' ? ' tab-btn-active' : '')} onClick={() => setTypeFilter('all')}>All</button>
            <button className={'secondary-button' + (typeFilter === 'Employer' ? ' tab-btn-active' : '')} onClick={() => setTypeFilter('Employer')}>Employers</button>
            <button className={'secondary-button' + (typeFilter === 'Institute' ? ' tab-btn-active' : '')} onClick={() => setTypeFilter('Institute')}>Institutes</button>
          </div>
        </div>
        <input
          className="form-input"
          placeholder="Search partner or account manager"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Partner</th>
                <th className="datatable-th">Type</th>
                <th className="datatable-th">Active Cohorts</th>
                <th className="datatable-th">SLA</th>
                <th className="datatable-th">KPI Threshold</th>
                <th className="datatable-th">Contract End</th>
                <th className="datatable-th">Account Manager</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.cohorts}</td>
                  <td>
                    <div style={{ display: 'grid', gap: 3 }}>
                      <span>{row.slaScore}%</span>
                      <StatusBadge status={toStatus(row.slaScore)} />
                    </div>
                  </td>
                  <td>{row.threshold}</td>
                  <td>{row.contractEndDate || '-'}</td>
                  <td>{row.manager}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => addToast(`Opened ${row.name} scorecard`, 'info')}>Scorecard</button>
                      <button className="action-btn" onClick={() => openEditPartner(row.id)}>Edit</button>
                      <button
                        className="action-btn"
                        onClick={() => {
                          updatePartner(row.id, { status: row.status === 'active' ? 'inactive' : 'active' });
                          addToast(`${row.name} set to ${row.status === 'active' ? 'inactive' : 'active'}.`, 'success');
                        }}
                      >
                        {row.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Employer Shortlist & Hiring Pipeline</h2>
          <button className="primary-button" onClick={() => setShortlistModalOpen(true)}>+ Add Learner to Pipeline</button>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Employer</th>
                <th className="datatable-th">Learner</th>
                <th className="datatable-th">Cohort</th>
                <th className="datatable-th">Performance</th>
                <th className="datatable-th">Target Role</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Updated</th>
              </tr>
            </thead>
            <tbody>
              {employerShortlists.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.partnerName}</td>
                  <td>{entry.learnerName}</td>
                  <td>{entry.cohortName}</td>
                  <td>{entry.performanceScore}%</td>
                  <td>{entry.roleTitle}</td>
                  <td>
                    <select
                      className="form-input"
                      value={entry.status}
                      onChange={(event) => updateEmployerShortlistStatus(entry.id, event.target.value as EmployerPipelineStatus)}
                    >
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Institute Programmes & Accreditation Tracker</h2>
          <button className="primary-button" onClick={openCreateOffering}>+ Add Programme Offering</button>
        </div>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Institute</th>
                <th className="datatable-th">Programme</th>
                <th className="datatable-th">NQF</th>
                <th className="datatable-th">Certificate</th>
                <th className="datatable-th">Seats</th>
                <th className="datatable-th">Accreditation Code</th>
                <th className="datatable-th">Expiry</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instituteOfferings.map((offering) => (
                <tr key={offering.id}>
                  <td>{offering.partnerName}</td>
                  <td>{offering.programmeName}</td>
                  <td>{offering.nqfLevel}</td>
                  <td>{offering.certificate}</td>
                  <td>{offering.seats}</td>
                  <td>{offering.accreditationCode}</td>
                  <td>{offering.accreditationExpiry}</td>
                  <td><StatusBadge status={offeringStatusToBadge(offering.status)} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => openEditOffering(offering.id)}>Edit</button>
                      <button className="action-btn" onClick={() => updateInstituteOfferingStatus(offering.id, 'active')}>Active</button>
                      <button className="action-btn" onClick={() => updateInstituteOfferingStatus(offering.id, 'expiring')}>Expiring</button>
                      <button className="action-btn action-btn-danger" onClick={() => updateInstituteOfferingStatus(offering.id, 'expired')}>Expired</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {partnerModalOpen && (
        <Modal
          title={editingId ? 'Update Partner' : 'Add Partner'}
          onClose={closeModal}
          footer={(
            <>
              <button className="secondary-button" onClick={closeModal}>Cancel</button>
              <button className="primary-button" onClick={submitPartner}>{editingId ? 'Save Partner' : 'Create Partner'}</button>
            </>
          )}
        >
          <label className="form-label">
            Partner name
            <input className="form-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Partner type
              <select className="form-input" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as 'Employer' | 'Institute' }))}>
                <option value="Employer">Employer</option>
                <option value="Institute">Institute</option>
              </select>
            </label>
            <label className="form-label">
              Status
              <select className="form-input" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as 'active' | 'onboarding' | 'inactive' }))}>
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            Account manager
            <input className="form-input" value={form.manager} onChange={(event) => setForm((prev) => ({ ...prev, manager: event.target.value }))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label className="form-label">
              SLA threshold
              <input className="form-input" value={form.threshold} onChange={(event) => setForm((prev) => ({ ...prev, threshold: event.target.value }))} placeholder="95%" />
            </label>
            <label className="form-label">
              Contract end date
              <input type="date" className="form-input" value={form.contractEndDate} onChange={(event) => setForm((prev) => ({ ...prev, contractEndDate: event.target.value }))} />
            </label>
          </div>
        </Modal>
      )}

      {shortlistModalOpen && (
        <Modal
          title="Add Learner to Employer Pipeline"
          onClose={() => setShortlistModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setShortlistModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={submitShortlist}>Add to Pipeline</button>
            </>
          )}
        >
          <label className="form-label">
            Employer
            <select className="form-input" value={shortlistForm.partnerId} onChange={(event) => setShortlistForm((prev) => ({ ...prev, partnerId: event.target.value }))}>
              <option value="">Select employer</option>
              {employerPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Learner
            <select className="form-input" value={shortlistForm.learnerId} onChange={(event) => setShortlistForm((prev) => ({ ...prev, learnerId: event.target.value }))}>
              <option value="">Select learner</option>
              {learnerPool.map((learner) => (
                <option key={learner.learnerId} value={learner.learnerId}>{learner.learnerName} ({learner.cohortName}) - {learner.performanceScore}%</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Target role
            <input className="form-input" value={shortlistForm.roleTitle} onChange={(event) => setShortlistForm((prev) => ({ ...prev, roleTitle: event.target.value }))} placeholder="e.g. Junior Operations Analyst" />
          </label>
        </Modal>
      )}

      {offeringModalOpen && (
        <Modal
          title={offeringForm.id ? 'Update Institute Offering' : 'Add Institute Offering'}
          onClose={() => setOfferingModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setOfferingModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={submitOffering}>{offeringForm.id ? 'Save Offering' : 'Create Offering'}</button>
            </>
          )}
        >
          <label className="form-label">
            Institute
            <select className="form-input" value={offeringForm.partnerId} onChange={(event) => setOfferingForm((prev) => ({ ...prev, partnerId: event.target.value }))}>
              <option value="">Select institute</option>
              {institutePartners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Programme name
            <input className="form-input" value={offeringForm.programmeName} onChange={(event) => setOfferingForm((prev) => ({ ...prev, programmeName: event.target.value }))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <label className="form-label">
              NQF level
              <input className="form-input" value={offeringForm.nqfLevel} onChange={(event) => setOfferingForm((prev) => ({ ...prev, nqfLevel: event.target.value }))} placeholder="e.g. 4" />
            </label>
            <label className="form-label">
              Seats
              <input type="number" min={1} className="form-input" value={offeringForm.seats} onChange={(event) => setOfferingForm((prev) => ({ ...prev, seats: event.target.value }))} />
            </label>
          </div>
          <label className="form-label">
            Certificate
            <input className="form-input" value={offeringForm.certificate} onChange={(event) => setOfferingForm((prev) => ({ ...prev, certificate: event.target.value }))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            <label className="form-label">
              Accreditation code
              <input className="form-input" value={offeringForm.accreditationCode} onChange={(event) => setOfferingForm((prev) => ({ ...prev, accreditationCode: event.target.value }))} />
            </label>
            <label className="form-label">
              Accreditation expiry
              <input type="date" min={today} className="form-input" value={offeringForm.accreditationExpiry} onChange={(event) => setOfferingForm((prev) => ({ ...prev, accreditationExpiry: event.target.value }))} />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
