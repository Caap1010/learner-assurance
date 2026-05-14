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
};

const USERS_KEY = 'la_users';
const PERMISSIONS_KEY = 'la_permissions';
const COHORTS_KEY = 'la_cohorts';
const GRANTS_KEY = 'la_temp_grants';
const COHORT_DETAILS_KEY = 'la_cohort_details';

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

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PlatformUser[]>(() => readStorage(USERS_KEY, USERS_LIST as PlatformUser[]));
  const [permissions, setPermissions] = useState<PermissionRow[]>(() => readStorage(PERMISSIONS_KEY, PERMISSIONS_MATRIX as PermissionRow[]));
  const [cohorts, setCohorts] = useState<Cohort[]>(() => {
    const storedCohorts = readStorage<Partial<Cohort>[]>(COHORTS_KEY, INITIAL_COHORTS);
    return storedCohorts.map((cohort) => normalizeCohort(cohort));
  });
  const [grants, setGrants] = useState<TemporaryGrant[]>(() => readStorage(GRANTS_KEY, []));
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
    }),
    [users, permissions, cohorts, cohortDetails, grants],
  );

  return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>;
}

export function usePlatformData() {
  const ctx = useContext(PlatformDataContext);
  if (!ctx) throw new Error('usePlatformData must be used inside PlatformDataProvider');
  return ctx;
}
