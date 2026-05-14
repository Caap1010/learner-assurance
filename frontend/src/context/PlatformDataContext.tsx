import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { PERMISSIONS_MATRIX, USERS_LIST } from '../data/mockData';
import type { Role } from '../types';

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  lastLogin: string;
};

export type PermissionRow = {
  feature: string;
  owner: boolean;
  admin: boolean;
  coach: boolean;
  learner: boolean;
  employer: boolean;
  mentor: boolean;
  manager: boolean;
  institute: boolean;
  ydp: boolean;
};

export type CohortType = 'learnership' | 'ydp';

export type Cohort = {
  id: string;
  name: string;
  type: CohortType;
  programmeTemplateId?: string;
  intake: string;
  endDate: string;
  employer: string;
  institute: string;
  location: string;
  seats: number;
  filled: number;
  health: 'on-track' | 'at-risk' | 'escalated' | 'completed';
  phase: 'onboarding' | 'active' | 'review' | 'completion';
};

export type CohortPhaseEntry = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  notes: string;
  completed: boolean;
};

export type CohortLearner = {
  id: string;
  name: string;
  accessCardId: string;
  laptopSerialId: string;
  simCardId: string;
  serialId?: string;
  serialType?: 'laptop' | 'sim';
  status: 'active' | 'inactive' | 'transferred';
  attendance: number;
  cohortId: string;
};

export type CohortDetail = {
  refNumber: string;
  setaCode: string;
  nqfLevel: string;
  fundingSource: string;
  trainingSite: string;
  transport: 'yes' | 'no';
  transportProvider: string;
  stipendAmount: string;
  phases: CohortPhaseEntry[];
  learners: CohortLearner[];
};

export type TemporaryGrant = {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
};

export type ProgrammeTrack = 'Learnership' | 'YDP';

export type ProgrammeTemplate = {
  id: string;
  name: string;
  institute: string;
  track: ProgrammeTrack;
  duration: string;
  milestones: number;
  evidenceItems: number;
  version: string;
  migrationRule: string;
  lastUpdatedAt: string;
};

export type ProgrammeAssignment = {
  id: string;
  programmeId: string;
  learnerId: string;
  learnerName: string;
  cohortId: string;
  cohortName: string;
  assignedAt: string;
};

export type OwnerPartner = {
  id: string;
  name: string;
  type: 'Employer' | 'Institute';
  manager: string;
  threshold: string;
  contractEndDate: string;
  status: 'active' | 'onboarding' | 'inactive';
};

export type EmployerPipelineStatus = 'shortlisted' | 'interview' | 'offered' | 'hired' | 'rejected';

export type EmployerShortlist = {
  id: string;
  partnerId: string;
  partnerName: string;
  learnerId: string;
  learnerName: string;
  cohortId: string;
  cohortName: string;
  performanceScore: number;
  roleTitle: string;
  status: EmployerPipelineStatus;
  createdAt: string;
  updatedAt: string;
};

export type InstituteOfferingStatus = 'draft' | 'active' | 'expiring' | 'expired';

export type InstituteOffering = {
  id: string;
  partnerId: string;
  partnerName: string;
  programmeName: string;
  nqfLevel: string;
  certificate: string;
  seats: number;
  accreditationCode: string;
  accreditationExpiry: string;
  status: InstituteOfferingStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalCategory = 'Access' | 'Programme' | 'Cohort' | 'Partner' | 'Compliance';

export type ApprovalRequest = {
  id: string;
  category: ApprovalCategory;
  item: string;
  linkedEntity: string;
  requester: string;
  submitted: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'approved' | 'rejected' | 'review';
  route: string[];
  currentStep: number;
  dueBy: string;
  slaHours: number;
  escalatedAt?: string;
  notes?: string;
  decidedAt?: string;
};

export type ComplianceStatus = 'on-track' | 'at-risk' | 'escalated' | 'completed';

export type ComplianceItem = {
  id: string;
  area: string;
  owner: string;
  due: string;
  status: ComplianceStatus;
  linkedCohortId?: string;
  missingEvidence: number;
  missingAppraisals: number;
  remediationStatus: 'none' | 'planned' | 'in-progress' | 'completed';
  remediationOwner?: string;
  remediationDue?: string;
  remediationNotes?: string;
};

export type CommunicationTemplate = {
  id: string;
  title: string;
  audience: string;
  channel: 'Email' | 'SMS' | 'In-App';
  body: string;
  updatedAt: string;
};

export type CommunicationCampaign = {
  id: string;
  title: string;
  target: string;
  channel: 'Email' | 'SMS' | 'In-App';
  status: 'Draft' | 'Scheduled' | 'Sent';
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  templateId?: string;
  message: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical';
  details?: string;
};

export type ContractDocument = {
  id: string;
  title: string;
  category: 'Contract' | 'Accreditation' | 'Policy' | 'Compliance Pack';
  owner: string;
  linkedEntity: string;
  uploadedAt: string;
  expiresAt: string;
  status: 'active' | 'expiring' | 'expired';
};

export type ComplianceReportSchedule = {
  id: string;
  name: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  audience: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  status: 'active' | 'paused';
  nextRun: string;
  lastRun?: string;
};

export type InterventionRisk = 'low' | 'medium' | 'high';

export type InterventionStatus = 'open' | 'in-progress' | 'resolved' | 'overdue';

export type InterventionCategory = 'Attendance' | 'Performance' | 'Behaviour' | 'Engagement' | 'Finance';

export type InterventionResolution = 'none' | 'successful' | 'partial' | 'unsuccessful';

export type InterventionCase = {
  id: string;
  learner: string;
  cohort: string;
  risk: InterventionRisk;
  status: InterventionStatus;
  category: InterventionCategory;
  owner: string;
  openedAt: string;
  dueDate: string;
  resolution: InterventionResolution;
  resolvedAt?: string;
  notes: string;
};

export type IntegrationStatus = 'connected' | 'syncing' | 'warning' | 'disconnected' | 'failed';

export type IntegrationConnector = {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  syncMode: 'realtime' | 'scheduled' | 'manual';
  status: IntegrationStatus;
  lastSync: string;
  retryPolicy: string;
  owner: string;
  notes: string;
};

export type IntegrationLog = {
  id: string;
  connectorId: string;
  connectorName: string;
  event: string;
  result: 'success' | 'warning' | 'error';
  at: string;
};

type PlatformDataContextValue = {
  users: PlatformUser[];
  addUser: (input: { name: string; email: string; role: Role }) => void;
  removeUser: (id: string) => void;
  suspendUser: (id: string) => void;
  bulkSuspend: (ids: string[]) => void;
  bulkAssignRole: (ids: string[], role: Role) => void;

  permissions: PermissionRow[];
  togglePermission: (feature: string, role: Role) => void;

  cohorts: Cohort[];
  createCohort: (input: Omit<Cohort, 'id' | 'filled' | 'health' | 'phase'>) => void;
  cloneCohort: (id: string) => void;
  updateCohort: (id: string, patch: Partial<Cohort>) => void;
  cohortDetails: Record<string, CohortDetail>;
  updateCohortDetail: (cohortId: string, patch: Partial<CohortDetail>) => void;
  addLearnerToCohort: (cohortId: string, learner: Omit<CohortLearner, 'id' | 'cohortId'>) => void;
  transferLearners: (learnerIds: string[], fromCohortId: string, toCohortId: string) => void;

  grants: TemporaryGrant[];
  addTemporaryGrant: (input: { email: string; role: Role; expiresAt: string }) => void;
  approveTemporaryGrant: (id: string) => void;
  rejectTemporaryGrant: (id: string) => void;

  programmeTemplates: ProgrammeTemplate[];
  createProgrammeTemplate: (input: Omit<ProgrammeTemplate, 'id' | 'lastUpdatedAt'>) => void;
  updateProgrammeTemplate: (id: string, patch: Partial<Omit<ProgrammeTemplate, 'id'>>) => void;
  cloneProgrammeTemplate: (id: string) => void;
  publishProgrammeTemplateVersion: (id: string) => void;
  programmeAssignments: ProgrammeAssignment[];
  assignLearnersToProgramme: (programmeId: string, learners: Array<{ learnerId: string; learnerName: string; cohortId: string; cohortName: string }>) => void;
  removeProgrammeAssignment: (assignmentId: string) => void;

  partners: OwnerPartner[];
  addPartner: (input: Omit<OwnerPartner, 'id'>) => void;
  updatePartner: (id: string, patch: Partial<Omit<OwnerPartner, 'id'>>) => void;

  employerShortlists: EmployerShortlist[];
  addEmployerShortlist: (input: Omit<EmployerShortlist, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: EmployerPipelineStatus }) => void;
  updateEmployerShortlistStatus: (id: string, status: EmployerPipelineStatus) => void;

  instituteOfferings: InstituteOffering[];
  upsertInstituteOffering: (input: Omit<InstituteOffering, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: InstituteOfferingStatus }, id?: string) => void;
  updateInstituteOfferingStatus: (id: string, status: InstituteOfferingStatus) => void;

  approvalRequests: ApprovalRequest[];
  addApprovalRequest: (input: Omit<ApprovalRequest, 'id' | 'submitted' | 'status' | 'route' | 'currentStep' | 'dueBy' | 'slaHours'> & { dueBy?: string; route?: string[]; slaHours?: number }) => void;
  decideApprovalRequest: (id: string, decision: 'approved' | 'rejected' | 'review', notes?: string) => void;

  complianceItems: ComplianceItem[];
  createComplianceItem: (input: Omit<ComplianceItem, 'id' | 'remediationStatus'>) => void;
  updateComplianceStatus: (id: string, status: ComplianceStatus) => void;
  createRemediationPlan: (id: string, input: { owner: string; due: string; notes: string }) => void;
  resolveRemediationPlan: (id: string) => void;

  communicationTemplates: CommunicationTemplate[];
  upsertCommunicationTemplate: (input: Omit<CommunicationTemplate, 'id' | 'updatedAt'>, id?: string) => void;
  communicationCampaigns: CommunicationCampaign[];
  createCommunicationCampaign: (input: Omit<CommunicationCampaign, 'id' | 'createdAt' | 'status'> & { status?: 'Draft' | 'Scheduled' | 'Sent' }) => void;
  markCampaignSent: (id: string) => void;

  auditEvents: AuditEvent[];
  appendAuditEvent: (input: Omit<AuditEvent, 'id' | 'timestamp'>) => void;

  contractDocuments: ContractDocument[];
  addContractDocument: (input: Omit<ContractDocument, 'id' | 'uploadedAt' | 'status'>) => void;
  updateContractDocumentStatus: (id: string, status: ContractDocument['status']) => void;

  complianceReportSchedules: ComplianceReportSchedule[];
  upsertComplianceReportSchedule: (input: Omit<ComplianceReportSchedule, 'id' | 'lastRun'>, id?: string) => void;
  runComplianceReportNow: (id: string) => void;

  interventionCases: InterventionCase[];
  addInterventionCase: (input: Omit<InterventionCase, 'id' | 'openedAt' | 'status'> & { status?: InterventionStatus }) => void;
  updateInterventionCase: (id: string, patch: Partial<Omit<InterventionCase, 'id' | 'openedAt'>>) => void;
  updateInterventionStatus: (id: string, status: InterventionStatus) => void;

  integrationConnectors: IntegrationConnector[];
  integrationLogs: IntegrationLog[];
  addIntegrationConnector: (input: Omit<IntegrationConnector, 'id' | 'lastSync'>) => void;
  updateIntegrationConnector: (id: string, patch: Partial<Omit<IntegrationConnector, 'id' | 'lastSync'>>) => void;
  syncIntegrationConnector: (id: string) => void;
  retryIntegrationConnector: (id: string) => void;
  updateIntegrationConnectorStatus: (id: string, status: IntegrationStatus) => void;
};

const USERS_KEY = 'la_users';
const PERMISSIONS_KEY = 'la_permissions';
const COHORTS_KEY = 'la_cohorts';
const GRANTS_KEY = 'la_temp_grants';
const COHORT_DETAILS_KEY = 'la_cohort_details';
const PROGRAMME_TEMPLATES_KEY = 'la_programme_templates';
const PROGRAMME_ASSIGNMENTS_KEY = 'la_programme_assignments';
const PARTNERS_KEY = 'la_partners';
const EMPLOYER_SHORTLISTS_KEY = 'la_employer_shortlists';
const INSTITUTE_OFFERINGS_KEY = 'la_institute_offerings';
const APPROVAL_REQUESTS_KEY = 'la_approval_requests';
const COMPLIANCE_ITEMS_KEY = 'la_compliance_items';
const COMMUNICATION_TEMPLATES_KEY = 'la_comm_templates';
const COMMUNICATION_CAMPAIGNS_KEY = 'la_comm_campaigns';
const AUDIT_EVENTS_KEY = 'la_audit_events';
const CONTRACT_DOCUMENTS_KEY = 'la_contract_documents';
const COMPLIANCE_REPORT_SCHEDULES_KEY = 'la_compliance_report_schedules';
const INTERVENTION_CASES_KEY = 'la_intervention_cases';
const INTEGRATION_CONNECTORS_KEY = 'la_integration_connectors';
const INTEGRATION_LOGS_KEY = 'la_integration_logs';

const INITIAL_PROGRAMME_TEMPLATES: ProgrammeTemplate[] = [
  {
    id: 'p1',
    name: 'Business Administration NQF4',
    institute: 'North Skills Institute',
    track: 'Learnership',
    duration: '12 months',
    milestones: 8,
    evidenceItems: 15,
    version: 'v4.2',
    migrationRule: 'Auto-migrate if < 40% complete',
    lastUpdatedAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Digital Sales Readiness',
    institute: 'Metro Academy',
    track: 'YDP',
    duration: '9 months',
    milestones: 6,
    evidenceItems: 12,
    version: 'v3.8',
    migrationRule: 'Manual approval only',
    lastUpdatedAt: '2026-04-26T10:30:00.000Z',
  },
  {
    id: 'p3',
    name: 'Warehouse Operations',
    institute: 'Westlands TVET',
    track: 'Learnership',
    duration: '12 months',
    milestones: 9,
    evidenceItems: 16,
    version: 'v2.5',
    migrationRule: 'Auto-migrate with evidence remap',
    lastUpdatedAt: '2026-03-19T08:15:00.000Z',
  },
];

const INITIAL_PROGRAMME_ASSIGNMENTS: ProgrammeAssignment[] = [
  {
    id: 'pa1',
    programmeId: 'p1',
    learnerId: 'cl1',
    learnerName: 'Thabo Molefe',
    cohortId: 'c1',
    cohortName: 'Learnership Cohort 2026-A',
    assignedAt: '2026-05-02T08:00:00.000Z',
  },
  {
    id: 'pa2',
    programmeId: 'p1',
    learnerId: 'cl2',
    learnerName: 'Naledi Dlamini',
    cohortId: 'c1',
    cohortName: 'Learnership Cohort 2026-A',
    assignedAt: '2026-05-02T08:05:00.000Z',
  },
  {
    id: 'pa3',
    programmeId: 'p2',
    learnerId: 'cl6',
    learnerName: 'Zanele Mokoena',
    cohortId: 'c2',
    cohortName: 'YDP Cohort 2026-Q1',
    assignedAt: '2026-05-03T11:00:00.000Z',
  },
];

const INITIAL_PARTNERS: OwnerPartner[] = [
  {
    id: 'pt1',
    name: 'Acme Manufacturing',
    type: 'Employer',
    manager: 'Naledi Khoza',
    threshold: '95%',
    contractEndDate: '2027-06-30',
    status: 'active',
  },
  {
    id: 'pt2',
    name: 'North Skills Institute',
    type: 'Institute',
    manager: 'Thabo Mokoena',
    threshold: '95%',
    contractEndDate: '2028-01-31',
    status: 'active',
  },
  {
    id: 'pt3',
    name: 'Future Finance Group',
    type: 'Employer',
    manager: 'Ayesha Patel',
    threshold: '95%',
    contractEndDate: '2026-12-31',
    status: 'onboarding',
  },
  {
    id: 'pt4',
    name: 'Metro Academy',
    type: 'Institute',
    manager: 'Sipho Dlamini',
    threshold: '95%',
    contractEndDate: '2027-09-30',
    status: 'active',
  },
];

const INITIAL_EMPLOYER_SHORTLISTS: EmployerShortlist[] = [
  {
    id: 'es1',
    partnerId: 'pt1',
    partnerName: 'Acme Manufacturing',
    learnerId: 'cl1',
    learnerName: 'Thabo Molefe',
    cohortId: 'c1',
    cohortName: 'Learnership Cohort 2026-A',
    performanceScore: 92,
    roleTitle: 'Junior Operations Analyst',
    status: 'interview',
    createdAt: '2026-05-08T10:15:00.000Z',
    updatedAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'es2',
    partnerId: 'pt3',
    partnerName: 'Future Finance Group',
    learnerId: 'cl8',
    learnerName: 'Lindiwe Ntuli',
    cohortId: 'c2',
    cohortName: 'YDP Cohort 2026-Q1',
    performanceScore: 91,
    roleTitle: 'Customer Success Trainee',
    status: 'offered',
    createdAt: '2026-05-09T11:00:00.000Z',
    updatedAt: '2026-05-11T14:25:00.000Z',
  },
];

const INITIAL_INSTITUTE_OFFERINGS: InstituteOffering[] = [
  {
    id: 'io1',
    partnerId: 'pt2',
    partnerName: 'North Skills Institute',
    programmeName: 'Business Administration NQF4',
    nqfLevel: '4',
    certificate: 'Occupational Certificate',
    seats: 120,
    accreditationCode: 'NSI-QCTO-1102',
    accreditationExpiry: '2027-12-31',
    status: 'active',
    createdAt: '2026-04-01T08:30:00.000Z',
    updatedAt: '2026-05-01T08:30:00.000Z',
  },
  {
    id: 'io2',
    partnerId: 'pt4',
    partnerName: 'Metro Academy',
    programmeName: 'Digital Sales Readiness',
    nqfLevel: '3',
    certificate: 'Certificate in Digital Sales',
    seats: 80,
    accreditationCode: 'MA-SETA-7781',
    accreditationExpiry: '2026-06-20',
    status: 'expiring',
    createdAt: '2026-03-14T10:45:00.000Z',
    updatedAt: '2026-05-02T10:45:00.000Z',
  },
];

const INITIAL_APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'a1',
    category: 'Access',
    item: 'Role upgrade: coach -> manager',
    linkedEntity: 'Manager Role',
    requester: 'Alex Admin',
    submitted: '2026-05-08T10:44:00.000Z',
    priority: 'High',
    status: 'pending',
    route: ['Operations Lead', 'Compliance Lead', 'Platform Owner'],
    currentStep: 1,
    dueBy: '2026-05-09T16:00:00.000Z',
    slaHours: 24,
  },
  {
    id: 'a2',
    category: 'Access',
    item: 'Permission change: Export executive report',
    linkedEntity: 'Executive Dashboard',
    requester: 'Naledi Khoza',
    submitted: '2026-05-08T14:22:00.000Z',
    priority: 'Medium',
    status: 'pending',
    route: ['Access Governance Lead', 'Platform Owner'],
    currentStep: 0,
    dueBy: '2026-05-10T14:22:00.000Z',
    slaHours: 48,
  },
  {
    id: 'a3',
    category: 'Cohort',
    item: 'Cohort transfer request (YDP 2026-Q1)',
    linkedEntity: 'YDP Cohort 2026-Q1',
    requester: 'Ayesha Patel',
    submitted: '2026-05-09T08:11:00.000Z',
    priority: 'High',
    status: 'pending',
    route: ['Programme Success Lead', 'Compliance Lead', 'Platform Owner'],
    currentStep: 0,
    dueBy: '2026-05-10T08:11:00.000Z',
    slaHours: 24,
  },
  {
    id: 'a4',
    category: 'Partner',
    item: 'User invite approval: institute supervisor',
    linkedEntity: 'Metro Academy',
    requester: 'Mark Manager',
    submitted: '2026-05-09T09:29:00.000Z',
    priority: 'Low',
    status: 'pending',
    route: ['Platform Owner'],
    currentStep: 0,
    dueBy: '2026-05-12T09:29:00.000Z',
    slaHours: 72,
  },
];

const INITIAL_COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: 'cp1', area: 'Attendance SLA', owner: 'Institute Ops', due: '2026-05-15', status: 'on-track', linkedCohortId: 'c1', missingEvidence: 2, missingAppraisals: 0, remediationStatus: 'none' },
  { id: 'cp2', area: 'Evidence Completeness', owner: 'Programme Team', due: '2026-05-12', status: 'at-risk', linkedCohortId: 'c2', missingEvidence: 12, missingAppraisals: 4, remediationStatus: 'planned', remediationOwner: 'QA Office', remediationDue: '2026-05-19', remediationNotes: 'Daily catch-up uploads and reviewer pairing.' },
  { id: 'cp3', area: 'Quarterly Audit Sampling', owner: 'QA Office', due: '2026-05-10', status: 'escalated', linkedCohortId: 'c2', missingEvidence: 6, missingAppraisals: 2, remediationStatus: 'in-progress', remediationOwner: 'Partner Success Lead', remediationDue: '2026-05-14', remediationNotes: 'Escalated audit stream with institute leads.' },
  { id: 'cp4', area: 'Appraisal Closeout', owner: 'Partner Success', due: '2026-05-21', status: 'on-track', linkedCohortId: 'c1', missingEvidence: 1, missingAppraisals: 1, remediationStatus: 'none' },
];

const INITIAL_COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'ct1',
    title: 'Attendance Reminder',
    audience: 'All Cohorts',
    channel: 'Email',
    body: 'Please submit attendance before 16:00 today to stay within SLA.',
    updatedAt: '2026-05-08T07:00:00.000Z',
  },
  {
    id: 'ct2',
    title: 'Evidence Deadline Alert',
    audience: 'YDP Cohort 2026-Q1',
    channel: 'In-App',
    body: 'Evidence pack submission closes at end of day. Upload now to avoid escalation.',
    updatedAt: '2026-05-08T11:45:00.000Z',
  },
];

const INITIAL_COMMUNICATION_CAMPAIGNS: CommunicationCampaign[] = [
  { id: 'cm1', title: 'Attendance Reminder', target: 'All Cohorts', channel: 'Email', status: 'Sent', createdAt: '2026-05-08T07:20:00.000Z', sentAt: '2026-05-08T07:30:00.000Z', templateId: 'ct1', message: 'Please submit attendance before 16:00 today to stay within SLA.' },
  { id: 'cm2', title: 'Evidence Deadline Alert', target: 'YDP Cohort 2026-Q1', channel: 'In-App', status: 'Sent', createdAt: '2026-05-08T12:05:00.000Z', sentAt: '2026-05-08T12:15:00.000Z', templateId: 'ct2', message: 'Evidence pack submission closes at end of day. Upload now to avoid escalation.' },
  { id: 'cm3', title: 'Partner SLA Update', target: 'Institute Managers', channel: 'Email', status: 'Scheduled', createdAt: '2026-05-09T08:40:00.000Z', scheduledAt: '2026-05-09T09:00:00.000Z', message: 'Weekly SLA roll-up report is scheduled for release.' },
];

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  { id: 'lg1', timestamp: '2026-05-09T09:40:00.000Z', actor: 'Platform Owner', action: 'Updated permission template', target: 'Manager Role', severity: 'info' },
  { id: 'lg2', timestamp: '2026-05-09T09:14:00.000Z', actor: 'Alex Admin', action: 'Invited user', target: 'mentor@learnerassurance.com', severity: 'info' },
  { id: 'lg3', timestamp: '2026-05-09T08:58:00.000Z', actor: 'Mark Manager', action: 'Approved attendance batch', target: 'Learnership 2026-A', severity: 'info' },
  { id: 'lg4', timestamp: '2026-05-09T08:23:00.000Z', actor: 'Maya Mentor', action: 'Opened intervention', target: 'Jordan Learner', severity: 'warning' },
  { id: 'lg5', timestamp: '2026-05-08T17:05:00.000Z', actor: 'Institute Admin', action: 'Uploaded evidence pack', target: 'YDP Cohort 2026-Q1', severity: 'info' },
];

const INITIAL_CONTRACT_DOCUMENTS: ContractDocument[] = [
  {
    id: 'cd1',
    title: 'North Skills Institute MoA 2026-2028',
    category: 'Contract',
    owner: 'Partner Success Lead',
    linkedEntity: 'North Skills Institute',
    uploadedAt: '2026-05-01T09:00:00.000Z',
    expiresAt: '2028-01-31',
    status: 'active',
  },
  {
    id: 'cd2',
    title: 'Metro Academy Accreditation Certificate',
    category: 'Accreditation',
    owner: 'Compliance Officer',
    linkedEntity: 'Metro Academy',
    uploadedAt: '2026-04-10T12:00:00.000Z',
    expiresAt: '2026-06-15',
    status: 'expiring',
  },
  {
    id: 'cd3',
    title: 'Acme Manufacturing Data Processing Addendum',
    category: 'Policy',
    owner: 'Security Counsel',
    linkedEntity: 'Acme Manufacturing',
    uploadedAt: '2025-12-01T08:30:00.000Z',
    expiresAt: '2026-04-30',
    status: 'expired',
  },
];

const INITIAL_COMPLIANCE_REPORT_SCHEDULES: ComplianceReportSchedule[] = [
  {
    id: 'rs1',
    name: 'Weekly Compliance Exception Pack',
    frequency: 'weekly',
    audience: 'Platform Owner, Compliance Lead',
    format: 'PDF',
    status: 'active',
    nextRun: '2026-05-16T07:00:00.000Z',
    lastRun: '2026-05-09T07:00:00.000Z',
  },
  {
    id: 'rs2',
    name: 'Monthly Institute SLA Summary',
    frequency: 'monthly',
    audience: 'Partner Success Leads',
    format: 'XLSX',
    status: 'active',
    nextRun: '2026-06-01T06:30:00.000Z',
    lastRun: '2026-05-01T06:30:00.000Z',
  },
];

const INITIAL_INTERVENTION_CASES: InterventionCase[] = [
  {
    id: 'iv1',
    learner: 'Jordan Learner',
    cohort: 'YDP Cohort 2026-Q1',
    risk: 'high',
    status: 'open',
    category: 'Attendance',
    owner: 'Maya Mentor',
    openedAt: '2026-05-09T08:23:00.000Z',
    dueDate: '2026-05-16',
    resolution: 'none',
    notes: 'Attendance dropped below 70% and appraisal evidence is missing.',
  },
  {
    id: 'iv2',
    learner: 'Themba Nkosi',
    cohort: 'Learnership Cohort 2026-A',
    risk: 'medium',
    status: 'in-progress',
    category: 'Performance',
    owner: 'Mark Manager',
    openedAt: '2026-05-10T07:40:00.000Z',
    dueDate: '2026-05-18',
    resolution: 'none',
    notes: 'Weekly coaching and attendance recovery plan active.',
  },
  {
    id: 'iv3',
    learner: 'Lebo Maseko',
    cohort: 'YDP Cohort 2026-Q1',
    risk: 'low',
    status: 'resolved',
    category: 'Engagement',
    owner: 'Chris Coach',
    openedAt: '2026-05-05T12:00:00.000Z',
    dueDate: '2026-05-12',
    resolution: 'successful',
    resolvedAt: '2026-05-12T16:30:00.000Z',
    notes: 'Learner stabilized and evidence backlog closed.',
  },
];

const INITIAL_INTEGRATION_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'ig1',
    name: 'HRIS Connector',
    provider: 'Workday',
    endpoint: 'workday/api/v2',
    syncMode: 'scheduled',
    status: 'connected',
    lastSync: '2026-05-09T07:10:00.000Z',
    retryPolicy: '3 attempts with 10m backoff',
    owner: 'Platform Owner',
    notes: 'Learner employment and role updates.',
  },
  {
    id: 'ig2',
    name: 'LMS Connector',
    provider: 'Moodle',
    endpoint: 'moodle/api/rest',
    syncMode: 'realtime',
    status: 'connected',
    lastSync: '2026-05-09T06:55:00.000Z',
    retryPolicy: '5 attempts with 5m backoff',
    owner: 'Learning Ops',
    notes: 'Attendance and assessment sync.',
  },
  {
    id: 'ig3',
    name: 'Storage Connector',
    provider: 'SharePoint',
    endpoint: 'sharepoint/sites/learners',
    syncMode: 'scheduled',
    status: 'warning',
    lastSync: '2026-05-08T22:30:00.000Z',
    retryPolicy: 'Manual retry only',
    owner: 'Compliance Officer',
    notes: 'Document vault archive and evidence packs.',
  },
  {
    id: 'ig4',
    name: 'Messaging Connector',
    provider: 'Twilio',
    endpoint: 'twilio/messages',
    syncMode: 'manual',
    status: 'disconnected',
    lastSync: '2026-05-07T17:12:00.000Z',
    retryPolicy: '2 attempts with 15m backoff',
    owner: 'Communications Lead',
    notes: 'Notifications and escalation alerts.',
  },
];

const INITIAL_INTEGRATION_LOGS: IntegrationLog[] = [
  { id: 'sl1', connectorId: 'ig1', connectorName: 'HRIS Connector', event: 'Delta sync completed', result: 'success', at: '2026-05-09T07:10:00.000Z' },
  { id: 'sl2', connectorId: 'ig3', connectorName: 'Storage Connector', event: 'Token refresh failed', result: 'warning', at: '2026-05-08T22:30:00.000Z' },
  { id: 'sl3', connectorId: 'ig4', connectorName: 'Messaging Connector', event: 'Webhook signature mismatch', result: 'error', at: '2026-05-07T17:12:00.000Z' },
];

const DEFAULT_PHASES: CohortPhaseEntry[] = [
  { key: 'recruitment', label: 'Recruitment & Advertising', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'interviews', label: 'Interview Period', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'medical', label: 'Medical Check', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'background', label: 'Background / SAPS Clearance', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'offer', label: 'Offer & Acceptance', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'signing', label: 'Contract Signing', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'onboarding', label: 'Induction & Onboarding', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'equipment', label: 'Equipment Issuance (Access Card, Laptop, SIM)', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'training', label: 'Training Commencement', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'q1review', label: 'Q1 Review', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'q2review', label: 'Q2 Review', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'q3review', label: 'Q3 Review', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'medicalexit', label: 'Medical Exit', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'completion', label: 'Programme Completion', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'certification', label: 'Certification Issuance', startDate: '', endDate: '', notes: '', completed: false },
  { key: 'placement', label: 'Post-Programme Placement', startDate: '', endDate: '', notes: '', completed: false },
];

function createDefaultCohortDetail(): CohortDetail {
  return {
    refNumber: '',
    setaCode: '',
    nqfLevel: '4',
    fundingSource: 'SETA Funded',
    trainingSite: '',
    transport: 'no',
    transportProvider: '',
    stipendAmount: '',
    phases: DEFAULT_PHASES.map((p) => ({ ...p })),
    learners: [],
  };
}

function normalizeLearner(raw: Partial<CohortLearner>, cohortId: string): CohortLearner {
  const laptopSerialId = raw.laptopSerialId ?? (raw.serialType === 'laptop' ? raw.serialId ?? '' : '');
  const simCardId = raw.simCardId ?? (raw.serialType === 'sim' ? raw.serialId ?? '' : '');
  return {
    id: raw.id ?? `cl-${crypto.randomUUID()}`,
    name: raw.name ?? '',
    accessCardId: raw.accessCardId ?? '',
    laptopSerialId,
    simCardId,
    status: raw.status ?? 'active',
    attendance: Number.isFinite(raw.attendance) ? (raw.attendance as number) : 0,
    cohortId: raw.cohortId ?? cohortId,
  };
}

function normalizeCohortDetail(raw: Partial<CohortDetail> | undefined, cohortId: string): CohortDetail {
  const defaults = createDefaultCohortDetail();
  const phases = (raw?.phases ?? defaults.phases).map((phase, index) => ({
    key: phase.key ?? defaults.phases[index]?.key ?? `phase-${index}`,
    label: phase.label ?? defaults.phases[index]?.label ?? `Phase ${index + 1}`,
    startDate: phase.startDate ?? '',
    endDate: phase.endDate ?? '',
    notes: phase.notes ?? '',
    completed: Boolean(phase.completed),
  }));

  return {
    refNumber: raw?.refNumber ?? defaults.refNumber,
    setaCode: raw?.setaCode ?? defaults.setaCode,
    nqfLevel: raw?.nqfLevel ?? defaults.nqfLevel,
    fundingSource: raw?.fundingSource ?? defaults.fundingSource,
    trainingSite: raw?.trainingSite ?? defaults.trainingSite,
    transport: raw?.transport ?? defaults.transport,
    transportProvider: raw?.transportProvider ?? defaults.transportProvider,
    stipendAmount: raw?.stipendAmount ?? defaults.stipendAmount,
    phases,
    learners: (raw?.learners ?? []).map((learner) => normalizeLearner(learner, cohortId)),
  };
}

const INITIAL_COHORT_DETAILS: Record<string, CohortDetail> = {
  c1: {
    refNumber: 'LA-2026-001',
    setaCode: 'CHIETA-2026-001',
    nqfLevel: '4',
    fundingSource: 'SETA Funded',
    trainingSite: '14 Industry Road, Johannesburg',
    transport: 'yes',
    transportProvider: 'City Link Shuttle',
    stipendAmount: '3500',
    phases: DEFAULT_PHASES.map((p) => ({
      ...p,
      completed: ['recruitment', 'interviews', 'medical', 'background', 'offer', 'signing', 'onboarding', 'equipment', 'training'].includes(p.key),
      startDate: p.key === 'training' ? '2026-01-06' : '',
      endDate: '',
    })),
    learners: [
      { id: 'cl1', name: 'Thabo Molefe', accessCardId: 'AC-10041', laptopSerialId: 'LT-2026-0041', simCardId: 'SIM-2026-0141', status: 'active', attendance: 92, cohortId: 'c1' },
      { id: 'cl2', name: 'Naledi Dlamini', accessCardId: 'AC-10042', laptopSerialId: 'LT-2026-0042', simCardId: 'SIM-2026-0142', status: 'active', attendance: 88, cohortId: 'c1' },
      { id: 'cl3', name: 'Sipho Khumalo', accessCardId: 'AC-10043', laptopSerialId: 'LT-2026-0043', simCardId: 'SIM-2026-0143', status: 'active', attendance: 76, cohortId: 'c1' },
      { id: 'cl4', name: 'Ayasha Patel', accessCardId: 'AC-10044', laptopSerialId: 'LT-2026-0044', simCardId: 'SIM-2026-0144', status: 'active', attendance: 95, cohortId: 'c1' },
      { id: 'cl5', name: 'Kagiso Sithole', accessCardId: 'AC-10045', laptopSerialId: 'LT-2026-0045', simCardId: 'SIM-2026-0145', status: 'inactive', attendance: 54, cohortId: 'c1' },
    ],
  },
  c2: {
    refNumber: 'LA-2026-002',
    setaCode: 'FASSET-2026-007',
    nqfLevel: '3',
    fundingSource: 'Employer Co-funded',
    trainingSite: '8 Harbour Drive, Cape Town',
    transport: 'no',
    transportProvider: '',
    stipendAmount: '2800',
    phases: DEFAULT_PHASES.map((p) => ({
      ...p,
      completed: ['recruitment', 'interviews', 'medical', 'signing', 'onboarding'].includes(p.key),
    })),
    learners: [
      { id: 'cl6', name: 'Zanele Mokoena', accessCardId: 'AC-20061', laptopSerialId: 'LT-2026-0061', simCardId: 'SIM-2026-0161', status: 'active', attendance: 85, cohortId: 'c2' },
      { id: 'cl7', name: 'Ruan Botha', accessCardId: 'AC-20062', laptopSerialId: 'LT-2026-0062', simCardId: 'SIM-2026-0162', status: 'active', attendance: 63, cohortId: 'c2' },
      { id: 'cl8', name: 'Lindiwe Ntuli', accessCardId: 'AC-20063', laptopSerialId: 'LT-2026-0063', simCardId: 'SIM-2026-0163', status: 'active', attendance: 91, cohortId: 'c2' },
    ],
  },
  c3: {
    refNumber: 'LA-2025-009',
    setaCode: 'W&RSETA-2025-009',
    nqfLevel: '3',
    fundingSource: 'SETA Funded',
    trainingSite: '5 Port Road, Durban',
    transport: 'yes',
    transportProvider: 'eThekwini Transit',
    stipendAmount: '3200',
    phases: DEFAULT_PHASES.map((p) => ({ ...p, completed: true, startDate: '', endDate: '' })),
    learners: [
      { id: 'cl9', name: 'Bongani Mthembu', accessCardId: 'AC-30091', laptopSerialId: 'LT-2025-0091', simCardId: 'SIM-2025-0191', status: 'inactive', attendance: 97, cohortId: 'c3' },
      { id: 'cl10', name: 'Fatima Isaacs', accessCardId: 'AC-30092', laptopSerialId: 'LT-2025-0092', simCardId: 'SIM-2025-0192', status: 'inactive', attendance: 94, cohortId: 'c3' },
    ],
  },
};

const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'c1',
    name: 'Learnership Cohort 2026-A',
    type: 'learnership',
    intake: 'Jan 2026',
    endDate: '2026-12-15',
    employer: 'Acme Manufacturing',
    institute: 'North Skills Institute',
    location: 'Johannesburg',
    seats: 120,
    filled: 108,
    health: 'on-track',
    phase: 'active',
  },
  {
    id: 'c2',
    name: 'YDP Cohort 2026-Q1',
    type: 'ydp',
    intake: 'Feb 2026',
    endDate: '2026-11-30',
    employer: 'Future Finance Group',
    institute: 'Metro Academy',
    location: 'Cape Town',
    seats: 80,
    filled: 73,
    health: 'at-risk',
    phase: 'review',
  },
  {
    id: 'c3',
    name: 'Learnership Cohort 2025-B',
    type: 'learnership',
    intake: 'Aug 2025',
    endDate: '2026-07-31',
    employer: 'Ubuntu Retail',
    institute: 'Westlands TVET',
    location: 'Durban',
    seats: 95,
    filled: 95,
    health: 'completed',
    phase: 'completion',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeCohort(raw: Partial<Cohort>): Cohort {
  return {
    id: raw.id ?? `c-${crypto.randomUUID()}`,
    name: raw.name ?? 'Untitled Cohort',
    type: raw.type ?? 'learnership',
    programmeTemplateId: raw.programmeTemplateId ?? undefined,
    intake: raw.intake ?? '',
    endDate: raw.endDate ?? '',
    employer: raw.employer ?? '',
    institute: raw.institute ?? '',
    location: raw.location ?? '',
    seats: typeof raw.seats === 'number' ? raw.seats : 0,
    filled: typeof raw.filled === 'number' ? raw.filled : 0,
    health: raw.health ?? 'on-track',
    phase: raw.phase ?? 'onboarding',
  };
}

function normalizeProgrammeTemplate(raw: Partial<ProgrammeTemplate>): ProgrammeTemplate {
  return {
    id: raw.id ?? `p-${crypto.randomUUID()}`,
    name: raw.name ?? 'Untitled Programme',
    institute: raw.institute ?? 'Unassigned Institute',
    track: raw.track ?? 'Learnership',
    duration: raw.duration ?? '12 months',
    milestones: typeof raw.milestones === 'number' ? raw.milestones : 0,
    evidenceItems: typeof raw.evidenceItems === 'number' ? raw.evidenceItems : 0,
    version: raw.version ?? 'v1.0',
    migrationRule: raw.migrationRule ?? 'Manual approval only',
    lastUpdatedAt: raw.lastUpdatedAt ?? new Date().toISOString(),
  };
}

function normalizeProgrammeAssignment(raw: Partial<ProgrammeAssignment>): ProgrammeAssignment {
  return {
    id: raw.id ?? `pa-${crypto.randomUUID()}`,
    programmeId: raw.programmeId ?? '',
    learnerId: raw.learnerId ?? '',
    learnerName: raw.learnerName ?? '',
    cohortId: raw.cohortId ?? '',
    cohortName: raw.cohortName ?? '',
    assignedAt: raw.assignedAt ?? new Date().toISOString(),
  };
}

function normalizePartner(raw: Partial<OwnerPartner>): OwnerPartner {
  return {
    id: raw.id ?? `pt-${crypto.randomUUID()}`,
    name: raw.name ?? 'Untitled Partner',
    type: raw.type ?? 'Employer',
    manager: raw.manager ?? '',
    threshold: raw.threshold ?? '95%',
    contractEndDate: raw.contractEndDate ?? '',
    status: raw.status ?? 'onboarding',
  };
}

function normalizeEmployerShortlist(raw: Partial<EmployerShortlist>): EmployerShortlist {
  return {
    id: raw.id ?? `es-${crypto.randomUUID()}`,
    partnerId: raw.partnerId ?? '',
    partnerName: raw.partnerName ?? 'Unknown Employer',
    learnerId: raw.learnerId ?? '',
    learnerName: raw.learnerName ?? 'Unknown Learner',
    cohortId: raw.cohortId ?? '',
    cohortName: raw.cohortName ?? '',
    performanceScore: typeof raw.performanceScore === 'number' ? raw.performanceScore : 0,
    roleTitle: raw.roleTitle ?? 'Unassigned Role',
    status: raw.status ?? 'shortlisted',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeInstituteOffering(raw: Partial<InstituteOffering>): InstituteOffering {
  const expiry = raw.accreditationExpiry ?? '';
  let status: InstituteOfferingStatus = raw.status ?? 'draft';
  if (!raw.status && expiry) {
    const now = Date.now();
    const expiryTimestamp = new Date(expiry).getTime();
    if (expiryTimestamp <= now) status = 'expired';
    else if (expiryTimestamp - now <= 45 * 24 * 60 * 60 * 1000) status = 'expiring';
    else status = 'active';
  }
  return {
    id: raw.id ?? `io-${crypto.randomUUID()}`,
    partnerId: raw.partnerId ?? '',
    partnerName: raw.partnerName ?? 'Unknown Institute',
    programmeName: raw.programmeName ?? 'Untitled Programme',
    nqfLevel: raw.nqfLevel ?? '',
    certificate: raw.certificate ?? '',
    seats: typeof raw.seats === 'number' ? raw.seats : 0,
    accreditationCode: raw.accreditationCode ?? '',
    accreditationExpiry: expiry,
    status,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeApprovalRequest(raw: Partial<ApprovalRequest>): ApprovalRequest {
  const defaultRoute = getDefaultApprovalRoute(raw.category, raw.priority);
  const route = raw.route && raw.route.length > 0 ? raw.route : defaultRoute;
  const submitted = raw.submitted ?? new Date().toISOString();
  const slaHours = typeof raw.slaHours === 'number' ? raw.slaHours : raw.priority === 'High' ? 24 : raw.priority === 'Low' ? 72 : 48;
  const dueBy = raw.dueBy ?? new Date(new Date(submitted).getTime() + slaHours * 60 * 60 * 1000).toISOString();
  const currentStep = typeof raw.currentStep === 'number' ? raw.currentStep : 0;
  const clampedStep = Math.max(0, Math.min(currentStep, Math.max(route.length - 1, 0)));
  return {
    id: raw.id ?? `ar-${crypto.randomUUID()}`,
    category: raw.category ?? 'Access',
    item: raw.item ?? 'Untitled request',
    linkedEntity: raw.linkedEntity ?? 'Unlinked item',
    requester: raw.requester ?? 'Unknown',
    submitted,
    priority: raw.priority ?? 'Medium',
    status: raw.status ?? 'pending',
    route,
    currentStep: clampedStep,
    dueBy,
    slaHours,
    escalatedAt: raw.escalatedAt,
    notes: raw.notes,
    decidedAt: raw.decidedAt,
  };
}

function getDefaultApprovalRoute(category: ApprovalCategory | undefined, priority: ApprovalRequest['priority'] | undefined) {
  if (category === 'Access') return ['Access Governance Lead', 'Platform Owner'];
  if (category === 'Programme') return ['Programme Success Lead', 'Compliance Lead', 'Platform Owner'];
  if (category === 'Cohort') return ['Operations Lead', 'Programme Success Lead', 'Platform Owner'];
  if (category === 'Partner') return ['Partner Success Lead', 'Compliance Lead', 'Platform Owner'];
  if (category === 'Compliance') return ['Compliance Lead', 'Platform Owner'];
  if (priority === 'High') return ['Operations Lead', 'Compliance Lead', 'Platform Owner'];
  if (priority === 'Low') return ['Platform Owner'];
  return ['Operations Lead', 'Platform Owner'];
}

function normalizeContractDocument(raw: Partial<ContractDocument>): ContractDocument {
  const expiresAt = raw.expiresAt ?? '';
  let status: ContractDocument['status'] = raw.status ?? 'active';
  if (!raw.status && expiresAt) {
    const today = new Date().toISOString().slice(0, 10);
    if (expiresAt < today) status = 'expired';
    else if (new Date(expiresAt).getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000) status = 'expiring';
  }
  return {
    id: raw.id ?? `cd-${crypto.randomUUID()}`,
    title: raw.title ?? 'Untitled document',
    category: raw.category ?? 'Contract',
    owner: raw.owner ?? 'Unassigned',
    linkedEntity: raw.linkedEntity ?? 'Unlinked',
    uploadedAt: raw.uploadedAt ?? new Date().toISOString(),
    expiresAt,
    status,
  };
}

function normalizeComplianceReportSchedule(raw: Partial<ComplianceReportSchedule>): ComplianceReportSchedule {
  return {
    id: raw.id ?? `rs-${crypto.randomUUID()}`,
    name: raw.name ?? 'Untitled report schedule',
    frequency: raw.frequency ?? 'monthly',
    audience: raw.audience ?? 'Platform Owner',
    format: raw.format ?? 'PDF',
    status: raw.status ?? 'active',
    nextRun: raw.nextRun ?? new Date().toISOString(),
    lastRun: raw.lastRun,
  };
}

function normalizeInterventionCase(raw: Partial<InterventionCase>): InterventionCase {
  return {
    id: raw.id ?? `iv-${crypto.randomUUID()}`,
    learner: raw.learner ?? 'Unknown Learner',
    cohort: raw.cohort ?? 'Unknown Cohort',
    risk: raw.risk ?? 'medium',
    status: raw.status ?? 'open',
    category: raw.category ?? 'Attendance',
    owner: raw.owner ?? 'Unassigned',
    openedAt: raw.openedAt ?? new Date().toISOString(),
    dueDate: raw.dueDate ?? new Date().toISOString().slice(0, 10),
    resolution: raw.resolution ?? 'none',
    resolvedAt: raw.resolvedAt,
    notes: raw.notes ?? '',
  };
}

function normalizeIntegrationConnector(raw: Partial<IntegrationConnector>): IntegrationConnector {
  return {
    id: raw.id ?? `ig-${crypto.randomUUID()}`,
    name: raw.name ?? 'Untitled integration',
    provider: raw.provider ?? 'Unknown provider',
    endpoint: raw.endpoint ?? '',
    syncMode: raw.syncMode ?? 'manual',
    status: raw.status ?? 'disconnected',
    lastSync: raw.lastSync ?? new Date().toISOString(),
    retryPolicy: raw.retryPolicy ?? 'Manual retry only',
    owner: raw.owner ?? 'Platform Owner',
    notes: raw.notes ?? '',
  };
}

function normalizeIntegrationLog(raw: Partial<IntegrationLog>): IntegrationLog {
  return {
    id: raw.id ?? `sl-${crypto.randomUUID()}`,
    connectorId: raw.connectorId ?? '',
    connectorName: raw.connectorName ?? 'Unknown connector',
    event: raw.event ?? 'Unknown event',
    result: raw.result ?? 'success',
    at: raw.at ?? new Date().toISOString(),
  };
}

function normalizeComplianceItem(raw: Partial<ComplianceItem>): ComplianceItem {
  return {
    id: raw.id ?? `cp-${crypto.randomUUID()}`,
    area: raw.area ?? 'Unnamed control',
    owner: raw.owner ?? 'Unassigned',
    due: raw.due ?? '',
    status: raw.status ?? 'on-track',
    linkedCohortId: raw.linkedCohortId,
    missingEvidence: typeof raw.missingEvidence === 'number' ? raw.missingEvidence : 0,
    missingAppraisals: typeof raw.missingAppraisals === 'number' ? raw.missingAppraisals : 0,
    remediationStatus: raw.remediationStatus ?? 'none',
    remediationOwner: raw.remediationOwner,
    remediationDue: raw.remediationDue,
    remediationNotes: raw.remediationNotes,
  };
}

function normalizeCommunicationTemplate(raw: Partial<CommunicationTemplate>): CommunicationTemplate {
  return {
    id: raw.id ?? `ct-${crypto.randomUUID()}`,
    title: raw.title ?? 'Untitled template',
    audience: raw.audience ?? 'All users',
    channel: raw.channel ?? 'Email',
    body: raw.body ?? '',
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeCommunicationCampaign(raw: Partial<CommunicationCampaign>): CommunicationCampaign {
  return {
    id: raw.id ?? `cm-${crypto.randomUUID()}`,
    title: raw.title ?? 'Untitled campaign',
    target: raw.target ?? 'All users',
    channel: raw.channel ?? 'Email',
    status: raw.status ?? 'Draft',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    scheduledAt: raw.scheduledAt,
    sentAt: raw.sentAt,
    templateId: raw.templateId,
    message: raw.message ?? '',
  };
}

function normalizeAuditEvent(raw: Partial<AuditEvent>): AuditEvent {
  return {
    id: raw.id ?? `ae-${crypto.randomUUID()}`,
    timestamp: raw.timestamp ?? new Date().toISOString(),
    actor: raw.actor ?? 'System',
    action: raw.action ?? 'Unknown action',
    target: raw.target ?? 'N/A',
    severity: raw.severity ?? 'info',
    details: raw.details,
  };
}

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PlatformUser[]>(() => readStorage(USERS_KEY, USERS_LIST as PlatformUser[]));
  const [permissions, setPermissions] = useState<PermissionRow[]>(() => readStorage(PERMISSIONS_KEY, PERMISSIONS_MATRIX as PermissionRow[]));
  const [cohorts, setCohorts] = useState<Cohort[]>(() => {
    const storedCohorts = readStorage<Partial<Cohort>[]>(COHORTS_KEY, INITIAL_COHORTS);
    return storedCohorts.map((cohort) => normalizeCohort(cohort));
  });
  const [grants, setGrants] = useState<TemporaryGrant[]>(() => readStorage(GRANTS_KEY, []));
  const [programmeTemplates, setProgrammeTemplates] = useState<ProgrammeTemplate[]>(() => {
    const storedTemplates = readStorage<Partial<ProgrammeTemplate>[]>(PROGRAMME_TEMPLATES_KEY, INITIAL_PROGRAMME_TEMPLATES);
    return storedTemplates.map((template) => normalizeProgrammeTemplate(template));
  });
  const [programmeAssignments, setProgrammeAssignments] = useState<ProgrammeAssignment[]>(() => {
    const storedAssignments = readStorage<Partial<ProgrammeAssignment>[]>(PROGRAMME_ASSIGNMENTS_KEY, INITIAL_PROGRAMME_ASSIGNMENTS);
    return storedAssignments.map((assignment) => normalizeProgrammeAssignment(assignment));
  });
  const [partners, setPartners] = useState<OwnerPartner[]>(() => {
    const storedPartners = readStorage<Partial<OwnerPartner>[]>(PARTNERS_KEY, INITIAL_PARTNERS);
    return storedPartners.map((partner) => normalizePartner(partner));
  });
  const [employerShortlists, setEmployerShortlists] = useState<EmployerShortlist[]>(() => {
    const storedShortlists = readStorage<Partial<EmployerShortlist>[]>(EMPLOYER_SHORTLISTS_KEY, INITIAL_EMPLOYER_SHORTLISTS);
    return storedShortlists.map((shortlist) => normalizeEmployerShortlist(shortlist));
  });
  const [instituteOfferings, setInstituteOfferings] = useState<InstituteOffering[]>(() => {
    const storedOfferings = readStorage<Partial<InstituteOffering>[]>(INSTITUTE_OFFERINGS_KEY, INITIAL_INSTITUTE_OFFERINGS);
    return storedOfferings.map((offering) => normalizeInstituteOffering(offering));
  });
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => {
    const storedRequests = readStorage<Partial<ApprovalRequest>[]>(APPROVAL_REQUESTS_KEY, INITIAL_APPROVAL_REQUESTS);
    return storedRequests.map((request) => normalizeApprovalRequest(request));
  });
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(() => {
    const storedItems = readStorage<Partial<ComplianceItem>[]>(COMPLIANCE_ITEMS_KEY, INITIAL_COMPLIANCE_ITEMS);
    return storedItems.map((item) => normalizeComplianceItem(item));
  });
  const [communicationTemplates, setCommunicationTemplates] = useState<CommunicationTemplate[]>(() => {
    const storedTemplates = readStorage<Partial<CommunicationTemplate>[]>(COMMUNICATION_TEMPLATES_KEY, INITIAL_COMMUNICATION_TEMPLATES);
    return storedTemplates.map((template) => normalizeCommunicationTemplate(template));
  });
  const [communicationCampaigns, setCommunicationCampaigns] = useState<CommunicationCampaign[]>(() => {
    const storedCampaigns = readStorage<Partial<CommunicationCampaign>[]>(COMMUNICATION_CAMPAIGNS_KEY, INITIAL_COMMUNICATION_CAMPAIGNS);
    return storedCampaigns.map((campaign) => normalizeCommunicationCampaign(campaign));
  });
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    const storedEvents = readStorage<Partial<AuditEvent>[]>(AUDIT_EVENTS_KEY, INITIAL_AUDIT_EVENTS);
    return storedEvents.map((event) => normalizeAuditEvent(event));
  });
  const [contractDocuments, setContractDocuments] = useState<ContractDocument[]>(() => {
    const storedDocs = readStorage<Partial<ContractDocument>[]>(CONTRACT_DOCUMENTS_KEY, INITIAL_CONTRACT_DOCUMENTS);
    return storedDocs.map((doc) => normalizeContractDocument(doc));
  });
  const [complianceReportSchedules, setComplianceReportSchedules] = useState<ComplianceReportSchedule[]>(() => {
    const storedSchedules = readStorage<Partial<ComplianceReportSchedule>[]>(COMPLIANCE_REPORT_SCHEDULES_KEY, INITIAL_COMPLIANCE_REPORT_SCHEDULES);
    return storedSchedules.map((schedule) => normalizeComplianceReportSchedule(schedule));
  });
  const [interventionCases, setInterventionCases] = useState<InterventionCase[]>(() => {
    const storedCases = readStorage<Partial<InterventionCase>[]>(INTERVENTION_CASES_KEY, INITIAL_INTERVENTION_CASES);
    return storedCases.map((entry) => normalizeInterventionCase(entry));
  });
  const [integrationConnectors, setIntegrationConnectors] = useState<IntegrationConnector[]>(() => {
    const storedConnectors = readStorage<Partial<IntegrationConnector>[]>(INTEGRATION_CONNECTORS_KEY, INITIAL_INTEGRATION_CONNECTORS);
    return storedConnectors.map((connector) => normalizeIntegrationConnector(connector));
  });
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>(() => {
    const storedLogs = readStorage<Partial<IntegrationLog>[]>(INTEGRATION_LOGS_KEY, INITIAL_INTEGRATION_LOGS);
    return storedLogs.map((log) => normalizeIntegrationLog(log));
  });
  const [cohortDetails, setCohortDetails] = useState<Record<string, CohortDetail>>(() => {
    const storedCohorts = readStorage(COHORTS_KEY, INITIAL_COHORTS);
    const storedDetails = readStorage<Record<string, Partial<CohortDetail>>>(COHORT_DETAILS_KEY, INITIAL_COHORT_DETAILS);
    const normalized: Record<string, CohortDetail> = {};
    storedCohorts.forEach((cohort) => {
      normalized[cohort.id] = normalizeCohortDetail(storedDetails[cohort.id] ?? INITIAL_COHORT_DETAILS[cohort.id], cohort.id);
    });
    return normalized;
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem(COHORTS_KEY, JSON.stringify(cohorts));
  }, [cohorts]);

  useEffect(() => {
    localStorage.setItem(COHORT_DETAILS_KEY, JSON.stringify(cohortDetails));
  }, [cohortDetails]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setGrants((prev) => {
      let changed = false;
      const next = prev.map((grant) => {
        if (grant.status !== 'expired' && grant.status !== 'rejected' && grant.expiresAt < today) {
          changed = true;
          return { ...grant, status: 'expired' as const };
        }
        return grant;
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(GRANTS_KEY, JSON.stringify(grants));
  }, [grants]);

  useEffect(() => {
    localStorage.setItem(PROGRAMME_TEMPLATES_KEY, JSON.stringify(programmeTemplates));
  }, [programmeTemplates]);

  useEffect(() => {
    localStorage.setItem(PROGRAMME_ASSIGNMENTS_KEY, JSON.stringify(programmeAssignments));
  }, [programmeAssignments]);

  useEffect(() => {
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem(EMPLOYER_SHORTLISTS_KEY, JSON.stringify(employerShortlists));
  }, [employerShortlists]);

  useEffect(() => {
    localStorage.setItem(INSTITUTE_OFFERINGS_KEY, JSON.stringify(instituteOfferings));
  }, [instituteOfferings]);

  useEffect(() => {
    localStorage.setItem(APPROVAL_REQUESTS_KEY, JSON.stringify(approvalRequests));
  }, [approvalRequests]);

  useEffect(() => {
    localStorage.setItem(COMPLIANCE_ITEMS_KEY, JSON.stringify(complianceItems));
  }, [complianceItems]);

  useEffect(() => {
    localStorage.setItem(COMMUNICATION_TEMPLATES_KEY, JSON.stringify(communicationTemplates));
  }, [communicationTemplates]);

  useEffect(() => {
    localStorage.setItem(COMMUNICATION_CAMPAIGNS_KEY, JSON.stringify(communicationCampaigns));
  }, [communicationCampaigns]);

  useEffect(() => {
    localStorage.setItem(AUDIT_EVENTS_KEY, JSON.stringify(auditEvents));
  }, [auditEvents]);

  useEffect(() => {
    localStorage.setItem(CONTRACT_DOCUMENTS_KEY, JSON.stringify(contractDocuments));
  }, [contractDocuments]);

  useEffect(() => {
    localStorage.setItem(COMPLIANCE_REPORT_SCHEDULES_KEY, JSON.stringify(complianceReportSchedules));
  }, [complianceReportSchedules]);

  useEffect(() => {
    localStorage.setItem(INTERVENTION_CASES_KEY, JSON.stringify(interventionCases));
  }, [interventionCases]);

  useEffect(() => {
    localStorage.setItem(INTEGRATION_CONNECTORS_KEY, JSON.stringify(integrationConnectors));
  }, [integrationConnectors]);

  useEffect(() => {
    localStorage.setItem(INTEGRATION_LOGS_KEY, JSON.stringify(integrationLogs));
  }, [integrationLogs]);

  useEffect(() => {
    const now = new Date().toISOString();
    setApprovalRequests((prev) => {
      let changed = false;
      const next = prev.map((request) => {
        if (request.status === 'pending' && request.dueBy < now && !request.escalatedAt) {
          changed = true;
          return {
            ...request,
            status: 'review' as const,
            escalatedAt: now,
            notes: request.notes ? `${request.notes} | Auto-escalated due to SLA breach.` : 'Auto-escalated due to SLA breach.',
          };
        }
        return request;
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setInterventionCases((prev) => {
      let changed = false;
      const next = prev.map((entry) => {
        if ((entry.status === 'open' || entry.status === 'in-progress') && entry.dueDate < today) {
          changed = true;
          return { ...entry, status: 'overdue' as const };
        }
        return entry;
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    const now = new Date().toISOString();
    setIntegrationConnectors((prev) => {
      let changed = false;
      const next = prev.map((connector) => {
        if (connector.status === 'disconnected' && new Date(connector.lastSync).getTime() < Date.now() - 2 * 24 * 60 * 60 * 1000) {
          changed = true;
          return { ...connector, status: 'failed' as const };
        }
        if (connector.status === 'warning' && new Date(connector.lastSync).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
          changed = true;
          return { ...connector, status: 'failed' as const };
        }
        return connector;
      });
      if (changed) {
        setIntegrationLogs((prevLogs) => [
          normalizeIntegrationLog({
            connectorId: 'system',
            connectorName: 'Integration Monitor',
            event: 'Detected stale or disconnected connector state',
            result: 'warning',
            at: now,
          }),
          ...prevLogs,
        ]);
      }
      return changed ? next : prev;
    });
  }, []);

  function appendAuditEvent(input: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const next = normalizeAuditEvent({ ...input, id: `ae-${crypto.randomUUID()}`, timestamp: new Date().toISOString() });
    setAuditEvents((prev) => [next, ...prev]);
  }

  function addUser(input: { name: string; email: string; role: Role }) {
    const today = new Date().toISOString().slice(0, 10);
    const next: PlatformUser = {
      id: `u-${crypto.randomUUID()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      status: 'active',
      lastLogin: today,
    };
    setUsers((prev) => [next, ...prev]);
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function suspendUser(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u)));
  }

  function bulkSuspend(ids: string[]) {
    if (ids.length === 0) return;
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, status: 'inactive' } : u)));
  }

  function bulkAssignRole(ids: string[], role: Role) {
    if (ids.length === 0) return;
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, role } : u)));
  }

  function togglePermission(feature: string, role: Role) {
    setPermissions((prev) => prev.map((row) => row.feature === feature ? { ...row, [role]: !row[role] } : row));
  }

  function createCohort(input: Omit<Cohort, 'id' | 'filled' | 'health' | 'phase'>) {
    const next: Cohort = {
      id: `c-${crypto.randomUUID()}`,
      ...input,
      filled: 0,
      health: 'on-track',
      phase: 'onboarding',
    };
    setCohorts((prev) => [next, ...prev]);
    setCohortDetails((prev) => ({
      ...prev,
      [next.id]: createDefaultCohortDetail(),
    }));
  }

  function cloneCohort(id: string) {
    setCohorts((prev) => {
      const source = prev.find((c) => c.id === id);
      if (!source) return prev;
      const cloned: Cohort = {
        ...source,
        id: `c-${crypto.randomUUID()}`,
        name: `${source.name} (Copy)`,
        filled: 0,
        phase: 'onboarding',
        health: 'on-track',
      };
      setCohortDetails((prevDetails) => ({
        ...prevDetails,
        [cloned.id]: {
          ...normalizeCohortDetail(prevDetails[id], id),
          learners: [],
          phases: normalizeCohortDetail(prevDetails[id], id).phases.map((phase) => ({ ...phase, completed: false })),
        },
      }));
      return [cloned, ...prev];
    });
  }

  function updateCohort(id: string, patch: Partial<Cohort>) {
    setCohorts((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  }

  function updateCohortDetail(cohortId: string, patch: Partial<CohortDetail>) {
    const nextPatch: Partial<CohortDetail> = patch.learners
      ? { ...patch, learners: patch.learners.map((learner) => normalizeLearner(learner, cohortId)) }
      : patch;
    setCohortDetails((prev) => ({
      ...prev,
      [cohortId]: {
        ...normalizeCohortDetail(prev[cohortId], cohortId),
        ...nextPatch,
      },
    }));
  }

  function addLearnerToCohort(cohortId: string, learner: Omit<CohortLearner, 'id' | 'cohortId'>) {
    const newLearner: CohortLearner = normalizeLearner({ ...learner, id: `cl-${crypto.randomUUID()}`, cohortId }, cohortId);
    setCohortDetails((prev) => ({
      ...prev,
      [cohortId]: {
        ...normalizeCohortDetail(prev[cohortId], cohortId),
        learners: [...(prev[cohortId]?.learners ?? []), newLearner],
      },
    }));
    setCohorts((prev) => prev.map((c) => c.id === cohortId ? { ...c, filled: c.filled + 1 } : c));
  }

  function transferLearners(learnerIds: string[], fromCohortId: string, toCohortId: string) {
    setCohortDetails((prev) => {
      const fromDetail = normalizeCohortDetail(prev[fromCohortId], fromCohortId);
      const toDetail = normalizeCohortDetail(prev[toCohortId], toCohortId);
      const moving = fromDetail.learners.filter((l) => learnerIds.includes(l.id));
      const updatedMoving = moving.map((l) => ({ ...l, cohortId: toCohortId, status: 'transferred' as const }));
      return {
        ...prev,
        [fromCohortId]: { ...fromDetail, learners: fromDetail.learners.filter((l) => !learnerIds.includes(l.id)) },
        [toCohortId]: { ...toDetail, learners: [...toDetail.learners, ...updatedMoving] },
      };
    });
    setCohorts((prev) => prev.map((c) => {
      if (c.id === fromCohortId) return { ...c, filled: Math.max(0, c.filled - learnerIds.length) };
      if (c.id === toCohortId) return { ...c, filled: c.filled + learnerIds.length };
      return c;
    }));
  }

  function addTemporaryGrant(input: { email: string; role: Role; expiresAt: string }) {
    const now = new Date().toISOString();
    const next: TemporaryGrant = {
      id: `g-${crypto.randomUUID()}`,
      email: input.email.toLowerCase(),
      role: input.role,
      expiresAt: input.expiresAt,
      createdAt: now,
      status: 'pending',
    };
    setGrants((prev) => [next, ...prev]);
  }

  function approveTemporaryGrant(id: string) {
    setGrants((prev) => prev.map((grant) => {
      if (grant.id !== id) return grant;
      if (grant.status !== 'pending') return grant;
      return { ...grant, status: 'approved' };
    }));
  }

  function rejectTemporaryGrant(id: string) {
    setGrants((prev) => prev.map((grant) => {
      if (grant.id !== id) return grant;
      if (grant.status !== 'pending') return grant;
      return { ...grant, status: 'rejected' };
    }));
  }

  function createProgrammeTemplate(input: Omit<ProgrammeTemplate, 'id' | 'lastUpdatedAt'>) {
    const next = normalizeProgrammeTemplate({
      ...input,
      id: `p-${crypto.randomUUID()}`,
      lastUpdatedAt: new Date().toISOString(),
    });
    setProgrammeTemplates((prev) => [next, ...prev]);
  }

  function updateProgrammeTemplate(id: string, patch: Partial<Omit<ProgrammeTemplate, 'id'>>) {
    setProgrammeTemplates((prev) => prev.map((template) => (
      template.id === id
        ? normalizeProgrammeTemplate({ ...template, ...patch, id, lastUpdatedAt: new Date().toISOString() })
        : template
    )));
  }

  function incrementVersion(version: string) {
    const match = version.match(/^v(\d+)(?:\.(\d+))?$/i);
    if (!match) return 'v1.0';
    const major = Number(match[1]);
    const minor = Number(match[2] ?? '0') + 1;
    return `v${major}.${minor}`;
  }

  function cloneProgrammeTemplate(id: string) {
    setProgrammeTemplates((prev) => {
      const source = prev.find((template) => template.id === id);
      if (!source) return prev;
      const clone = normalizeProgrammeTemplate({
        ...source,
        id: `p-${crypto.randomUUID()}`,
        name: `${source.name} (Copy)`,
        version: 'v1.0',
        lastUpdatedAt: new Date().toISOString(),
      });
      return [clone, ...prev];
    });
  }

  function publishProgrammeTemplateVersion(id: string) {
    setProgrammeTemplates((prev) => prev.map((template) => (
      template.id === id
        ? {
            ...template,
            version: incrementVersion(template.version),
            lastUpdatedAt: new Date().toISOString(),
          }
        : template
    )));
  }

  function assignLearnersToProgramme(programmeId: string, learners: Array<{ learnerId: string; learnerName: string; cohortId: string; cohortName: string }>) {
    if (learners.length === 0) return;
    setProgrammeAssignments((prev) => {
      const existingKeys = new Set(prev.map((assignment) => `${assignment.programmeId}:${assignment.learnerId}`));
      const nextAssignments = learners
        .filter((learner) => !existingKeys.has(`${programmeId}:${learner.learnerId}`))
        .map((learner) => normalizeProgrammeAssignment({
          id: `pa-${crypto.randomUUID()}`,
          programmeId,
          learnerId: learner.learnerId,
          learnerName: learner.learnerName,
          cohortId: learner.cohortId,
          cohortName: learner.cohortName,
          assignedAt: new Date().toISOString(),
        }));
      return nextAssignments.length > 0 ? [...nextAssignments, ...prev] : prev;
    });
  }

  function removeProgrammeAssignment(assignmentId: string) {
    setProgrammeAssignments((prev) => prev.filter((assignment) => assignment.id !== assignmentId));
  }

  function addPartner(input: Omit<OwnerPartner, 'id'>) {
    const next = normalizePartner({ ...input, id: `pt-${crypto.randomUUID()}` });
    setPartners((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Added partner', target: next.name, severity: 'info' });
  }

  function updatePartner(id: string, patch: Partial<Omit<OwnerPartner, 'id'>>) {
    setPartners((prev) => prev.map((partner) => (
      partner.id === id ? normalizePartner({ ...partner, ...patch, id }) : partner
    )));
    const partnerName = partners.find((partner) => partner.id === id)?.name ?? id;
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated partner', target: partnerName, severity: 'info' });
  }

  function addEmployerShortlist(input: Omit<EmployerShortlist, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: EmployerPipelineStatus }) {
    const now = new Date().toISOString();
    const next = normalizeEmployerShortlist({
      ...input,
      id: `es-${crypto.randomUUID()}`,
      status: input.status ?? 'shortlisted',
      createdAt: now,
      updatedAt: now,
    });
    setEmployerShortlists((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Added employer shortlist', target: `${next.learnerName} -> ${next.partnerName}`, severity: 'info' });
  }

  function updateEmployerShortlistStatus(id: string, status: EmployerPipelineStatus) {
    const now = new Date().toISOString();
    setEmployerShortlists((prev) => prev.map((entry) => (
      entry.id === id
        ? { ...entry, status, updatedAt: now }
        : entry
    )));
    const item = employerShortlists.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated employer pipeline status', target: item ? `${item.learnerName} (${item.partnerName})` : id, severity: status === 'rejected' ? 'warning' : status === 'hired' ? 'info' : 'info', details: `Status: ${status}` });
  }

  function upsertInstituteOffering(input: Omit<InstituteOffering, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: InstituteOfferingStatus }, id?: string) {
    const now = new Date().toISOString();
    if (id) {
      setInstituteOfferings((prev) => prev.map((offering) => (
        offering.id === id
          ? normalizeInstituteOffering({ ...offering, ...input, status: input.status ?? offering.status, updatedAt: now, id })
          : offering
      )));
      appendAuditEvent({ actor: 'Platform Owner', action: 'Updated institute offering', target: input.programmeName, severity: 'info' });
      return;
    }
    const next = normalizeInstituteOffering({
      ...input,
      id: `io-${crypto.randomUUID()}`,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    });
    setInstituteOfferings((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created institute offering', target: `${next.partnerName}: ${next.programmeName}`, severity: next.status === 'expired' ? 'critical' : next.status === 'expiring' ? 'warning' : 'info' });
  }

  function updateInstituteOfferingStatus(id: string, status: InstituteOfferingStatus) {
    const now = new Date().toISOString();
    setInstituteOfferings((prev) => prev.map((offering) => (
      offering.id === id
        ? { ...offering, status, updatedAt: now }
        : offering
    )));
    const item = instituteOfferings.find((offering) => offering.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated accreditation status', target: item ? `${item.partnerName}: ${item.programmeName}` : id, severity: status === 'expired' ? 'critical' : status === 'expiring' ? 'warning' : 'info' });
  }

  function addApprovalRequest(input: Omit<ApprovalRequest, 'id' | 'submitted' | 'status' | 'route' | 'currentStep' | 'dueBy' | 'slaHours'> & { dueBy?: string; route?: string[]; slaHours?: number }) {
    const submitted = new Date().toISOString();
    const slaHours = input.slaHours ?? (input.priority === 'High' ? 24 : input.priority === 'Low' ? 72 : 48);
    const computedDueBy = new Date(new Date(submitted).getTime() + slaHours * 60 * 60 * 1000).toISOString();
    const parsedDueBy = input.dueBy ? Date.parse(input.dueBy) : NaN;
    const dueBy = Number.isFinite(parsedDueBy) && parsedDueBy > Date.now() ? new Date(parsedDueBy).toISOString() : computedDueBy;
    const route = input.route && input.route.length > 0 ? input.route : getDefaultApprovalRoute(input.category, input.priority);
    const next = normalizeApprovalRequest({
      ...input,
      id: `ar-${crypto.randomUUID()}`,
      submitted,
      status: 'pending',
      route,
      currentStep: 0,
      slaHours,
      dueBy,
    });
    setApprovalRequests((prev) => [next, ...prev]);
    appendAuditEvent({ actor: input.requester, action: `Created ${input.category.toLowerCase()} approval request`, target: `${input.linkedEntity}: ${input.item}`, severity: input.priority === 'High' ? 'warning' : 'info' });
  }

  function decideApprovalRequest(id: string, decision: 'approved' | 'rejected' | 'review', notes?: string) {
    setApprovalRequests((prev) => prev.map((request) => (
      request.id === id
        ? (() => {
            if (request.status === 'approved' || request.status === 'rejected') {
              return request;
            }
            const nextNotes = notes === undefined ? request.notes : notes;
            if (decision === 'approved') {
              const isFinalStep = request.currentStep >= request.route.length - 1;
              return {
                ...request,
                currentStep: isFinalStep ? request.currentStep : request.currentStep + 1,
                status: isFinalStep ? ('approved' as const) : ('pending' as const),
                notes: nextNotes,
                decidedAt: isFinalStep ? new Date().toISOString() : request.decidedAt,
              };
            }
            return {
              ...request,
              status: decision,
              notes: nextNotes,
              decidedAt: decision === 'rejected' ? new Date().toISOString() : request.decidedAt,
            };
          })()
        : request
    )));
    const requestTitle = approvalRequests.find((request) => request.id === id)?.item ?? id;
    appendAuditEvent({ actor: 'Platform Owner', action: `Approval ${decision}`, target: requestTitle, severity: decision === 'rejected' ? 'critical' : decision === 'review' ? 'warning' : 'info', details: notes });
  }

  function addContractDocument(input: Omit<ContractDocument, 'id' | 'uploadedAt' | 'status'>) {
    const next = normalizeContractDocument({
      ...input,
      id: `cd-${crypto.randomUUID()}`,
      uploadedAt: new Date().toISOString(),
    });
    setContractDocuments((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Added contract document', target: next.title, severity: next.status === 'expired' ? 'critical' : next.status === 'expiring' ? 'warning' : 'info' });
  }

  function updateContractDocumentStatus(id: string, status: ContractDocument['status']) {
    setContractDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status } : doc)));
    const docTitle = contractDocuments.find((doc) => doc.id === id)?.title ?? id;
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated document status', target: docTitle, severity: status === 'expired' ? 'critical' : status === 'expiring' ? 'warning' : 'info' });
  }

  function upsertComplianceReportSchedule(input: Omit<ComplianceReportSchedule, 'id' | 'lastRun'>, id?: string) {
    const parsedNextRun = Date.parse(input.nextRun);
    const safeNextRun = Number.isFinite(parsedNextRun) ? new Date(parsedNextRun).toISOString() : new Date().toISOString();
    if (id) {
      setComplianceReportSchedules((prev) => prev.map((schedule) => (
        schedule.id === id
          ? normalizeComplianceReportSchedule({ ...schedule, ...input, nextRun: safeNextRun, id })
          : schedule
      )));
      appendAuditEvent({ actor: 'Platform Owner', action: 'Updated report schedule', target: input.name, severity: 'info' });
      return;
    }
    const next = normalizeComplianceReportSchedule({ ...input, nextRun: safeNextRun, id: `rs-${crypto.randomUUID()}` });
    setComplianceReportSchedules((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created report schedule', target: next.name, severity: 'info' });
  }

  function runComplianceReportNow(id: string) {
    const now = new Date().toISOString();
    setComplianceReportSchedules((prev) => prev.map((schedule) => {
      if (schedule.id !== id) return schedule;
      const nextRun = new Date(schedule.nextRun);
      if (schedule.frequency === 'weekly') nextRun.setUTCDate(nextRun.getUTCDate() + 7);
      if (schedule.frequency === 'monthly') nextRun.setUTCMonth(nextRun.getUTCMonth() + 1);
      if (schedule.frequency === 'quarterly') nextRun.setUTCMonth(nextRun.getUTCMonth() + 3);
      return {
        ...schedule,
        lastRun: now,
        nextRun: nextRun.toISOString(),
      };
    }));
    const scheduleName = complianceReportSchedules.find((schedule) => schedule.id === id)?.name ?? id;
    appendAuditEvent({ actor: 'Platform Owner', action: 'Ran compliance report pack', target: scheduleName, severity: 'info' });
  }

  function addInterventionCase(input: Omit<InterventionCase, 'id' | 'openedAt' | 'status'> & { status?: InterventionStatus }) {
    const next = normalizeInterventionCase({
      ...input,
      id: `iv-${crypto.randomUUID()}`,
      openedAt: new Date().toISOString(),
      status: input.status ?? 'open',
    });
    setInterventionCases((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created intervention case', target: `${next.learner} (${next.cohort})`, severity: next.risk === 'high' ? 'warning' : 'info' });
  }

  function updateInterventionCase(id: string, patch: Partial<Omit<InterventionCase, 'id' | 'openedAt'>>) {
    setInterventionCases((prev) => prev.map((entry) => (
      entry.id === id ? normalizeInterventionCase({ ...entry, ...patch, id, openedAt: entry.openedAt }) : entry
    )));
    const target = interventionCases.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated intervention case', target: target ? `${target.learner} (${target.cohort})` : id, severity: 'info' });
  }

  function updateInterventionStatus(id: string, status: InterventionStatus) {
    setInterventionCases((prev) => prev.map((entry) => (
      entry.id === id ? { ...entry, status } : entry
    )));
    const target = interventionCases.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated intervention status', target: target ? `${target.learner} (${target.cohort})` : id, severity: status === 'overdue' ? 'critical' : status === 'resolved' ? 'info' : 'warning' });
  }

  function addIntegrationConnector(input: Omit<IntegrationConnector, 'id' | 'lastSync'>) {
    const next = normalizeIntegrationConnector({
      ...input,
      id: `ig-${crypto.randomUUID()}`,
      lastSync: new Date().toISOString(),
    });
    setIntegrationConnectors((prev) => [next, ...prev]);
    setIntegrationLogs((prev) => [
      normalizeIntegrationLog({ connectorId: next.id, connectorName: next.name, event: 'Connector created', result: 'success', at: new Date().toISOString() }),
      ...prev,
    ]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created integration connector', target: `${next.name} (${next.provider})`, severity: 'info' });
  }

  function updateIntegrationConnector(id: string, patch: Partial<Omit<IntegrationConnector, 'id' | 'lastSync'>>) {
    const now = new Date().toISOString();
    setIntegrationConnectors((prev) => prev.map((connector) => (
      connector.id === id
        ? normalizeIntegrationConnector({ ...connector, ...patch, id, lastSync: now })
        : connector
    )));
    const connector = integrationConnectors.find((entry) => entry.id === id);
    setIntegrationLogs((prev) => [
      normalizeIntegrationLog({
        connectorId: id,
        connectorName: connector?.name ?? id,
        event: 'Configuration updated',
        result: 'success',
        at: now,
      }),
      ...prev,
    ]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated integration connector', target: connector?.name ?? id, severity: 'info' });
  }

  function syncIntegrationConnector(id: string) {
    const now = new Date().toISOString();
    setIntegrationConnectors((prev) => prev.map((connector) => (
      connector.id === id
        ? { ...connector, status: 'connected', lastSync: now }
        : connector
    )));
    const connector = integrationConnectors.find((entry) => entry.id === id);
    setIntegrationLogs((prev) => [
      normalizeIntegrationLog({
        connectorId: id,
        connectorName: connector?.name ?? id,
        event: 'Sync completed',
        result: 'success',
        at: now,
      }),
      ...prev,
    ]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Synced integration connector', target: connector?.name ?? id, severity: 'info' });
  }

  function retryIntegrationConnector(id: string) {
    const now = new Date().toISOString();
    setIntegrationConnectors((prev) => prev.map((connector) => (
      connector.id === id
        ? { ...connector, status: 'syncing', lastSync: now }
        : connector
    )));
    const connector = integrationConnectors.find((entry) => entry.id === id);
    setIntegrationLogs((prev) => [
      normalizeIntegrationLog({
        connectorId: id,
        connectorName: connector?.name ?? id,
        event: 'Retry triggered',
        result: 'warning',
        at: now,
      }),
      ...prev,
    ]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Retried integration connector', target: connector?.name ?? id, severity: 'warning' });
  }

  function updateIntegrationConnectorStatus(id: string, status: IntegrationStatus) {
    const now = new Date().toISOString();
    setIntegrationConnectors((prev) => prev.map((connector) => (
      connector.id === id
        ? { ...connector, status, lastSync: now }
        : connector
    )));
    const connector = integrationConnectors.find((entry) => entry.id === id);
    setIntegrationLogs((prev) => [
      normalizeIntegrationLog({
        connectorId: id,
        connectorName: connector?.name ?? id,
        event: `Status changed to ${status}`,
        result: status === 'failed' || status === 'disconnected' ? 'error' : status === 'warning' ? 'warning' : 'success',
        at: now,
      }),
      ...prev,
    ]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated integration status', target: connector?.name ?? id, severity: status === 'failed' || status === 'disconnected' ? 'critical' : status === 'warning' ? 'warning' : 'info' });
  }

  function createComplianceItem(input: Omit<ComplianceItem, 'id' | 'remediationStatus'>) {
    const next = normalizeComplianceItem({ ...input, id: `cp-${crypto.randomUUID()}`, remediationStatus: 'none' });
    setComplianceItems((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created compliance control', target: next.area, severity: next.status === 'escalated' ? 'critical' : 'info' });
  }

  function updateComplianceStatus(id: string, status: ComplianceStatus) {
    setComplianceItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    const item = complianceItems.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Updated compliance status', target: item?.area ?? id, severity: status === 'escalated' ? 'critical' : status === 'at-risk' ? 'warning' : 'info' });
  }

  function createRemediationPlan(id: string, input: { owner: string; due: string; notes: string }) {
    setComplianceItems((prev) => prev.map((item) => (
      item.id === id
        ? {
            ...item,
            remediationStatus: 'planned',
            remediationOwner: input.owner,
            remediationDue: input.due,
            remediationNotes: input.notes,
          }
        : item
    )));
    const item = complianceItems.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created remediation plan', target: item?.area ?? id, severity: 'warning', details: input.notes });
  }

  function resolveRemediationPlan(id: string) {
    setComplianceItems((prev) => prev.map((item) => (
      item.id === id
        ? {
            ...item,
            remediationStatus: 'completed',
            status: 'completed',
          }
        : item
    )));
    const item = complianceItems.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Resolved remediation plan', target: item?.area ?? id, severity: 'info' });
  }

  function upsertCommunicationTemplate(input: Omit<CommunicationTemplate, 'id' | 'updatedAt'>, id?: string) {
    if (id) {
      setCommunicationTemplates((prev) => prev.map((template) => (
        template.id === id
          ? normalizeCommunicationTemplate({ ...template, ...input, id, updatedAt: new Date().toISOString() })
          : template
      )));
      appendAuditEvent({ actor: 'Platform Owner', action: 'Updated communication template', target: input.title, severity: 'info' });
      return;
    }
    const next = normalizeCommunicationTemplate({ ...input, id: `ct-${crypto.randomUUID()}`, updatedAt: new Date().toISOString() });
    setCommunicationTemplates((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Created communication template', target: next.title, severity: 'info' });
  }

  function createCommunicationCampaign(input: Omit<CommunicationCampaign, 'id' | 'createdAt' | 'status'> & { status?: 'Draft' | 'Scheduled' | 'Sent' }) {
    const now = new Date().toISOString();
    const status = input.status ?? 'Draft';
    const next = normalizeCommunicationCampaign({
      ...input,
      id: `cm-${crypto.randomUUID()}`,
      createdAt: now,
      status,
      sentAt: status === 'Sent' ? now : input.sentAt,
    });
    setCommunicationCampaigns((prev) => [next, ...prev]);
    appendAuditEvent({ actor: 'Platform Owner', action: `Created ${status.toLowerCase()} campaign`, target: next.title, severity: 'info' });
  }

  function markCampaignSent(id: string) {
    const now = new Date().toISOString();
    setCommunicationCampaigns((prev) => prev.map((campaign) => (
      campaign.id === id ? { ...campaign, status: 'Sent', sentAt: now } : campaign
    )));
    const campaign = communicationCampaigns.find((entry) => entry.id === id);
    appendAuditEvent({ actor: 'Platform Owner', action: 'Sent campaign', target: campaign?.title ?? id, severity: 'info' });
  }

  const value = useMemo(
    () => ({
      users,
      addUser,
      removeUser,
      suspendUser,
      bulkSuspend,
      bulkAssignRole,
      permissions,
      togglePermission,
      cohorts,
      createCohort,
      cloneCohort,
      updateCohort,
      cohortDetails,
      updateCohortDetail,
      addLearnerToCohort,
      transferLearners,
      grants,
      addTemporaryGrant,
      approveTemporaryGrant,
      rejectTemporaryGrant,
      programmeTemplates,
      createProgrammeTemplate,
      updateProgrammeTemplate,
      cloneProgrammeTemplate,
      publishProgrammeTemplateVersion,
      programmeAssignments,
      assignLearnersToProgramme,
      removeProgrammeAssignment,
      partners,
      addPartner,
      updatePartner,
      employerShortlists,
      addEmployerShortlist,
      updateEmployerShortlistStatus,
      instituteOfferings,
      upsertInstituteOffering,
      updateInstituteOfferingStatus,
      approvalRequests,
      addApprovalRequest,
      decideApprovalRequest,
      complianceItems,
      createComplianceItem,
      updateComplianceStatus,
      createRemediationPlan,
      resolveRemediationPlan,
      communicationTemplates,
      upsertCommunicationTemplate,
      communicationCampaigns,
      createCommunicationCampaign,
      markCampaignSent,
      auditEvents,
      appendAuditEvent,
      contractDocuments,
      addContractDocument,
      updateContractDocumentStatus,
      complianceReportSchedules,
      upsertComplianceReportSchedule,
      runComplianceReportNow,
      interventionCases,
      addInterventionCase,
      updateInterventionCase,
      updateInterventionStatus,
      integrationConnectors,
      integrationLogs,
      addIntegrationConnector,
      updateIntegrationConnector,
      syncIntegrationConnector,
      retryIntegrationConnector,
      updateIntegrationConnectorStatus,
    }),
    [
      users,
      permissions,
      cohorts,
      cohortDetails,
      grants,
      programmeTemplates,
      programmeAssignments,
      partners,
      employerShortlists,
      instituteOfferings,
      approvalRequests,
      complianceItems,
      communicationTemplates,
      communicationCampaigns,
      auditEvents,
      contractDocuments,
      complianceReportSchedules,
      interventionCases,
      integrationConnectors,
      integrationLogs,
    ],
  );

  return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>;
}

export function usePlatformData() {
  const ctx = useContext(PlatformDataContext);
  if (!ctx) throw new Error('usePlatformData must be used inside PlatformDataProvider');
  return ctx;
}
