export type Role = 'owner' | 'admin' | 'coach' | 'learner' | 'employer' | 'mentor' | 'manager' | 'institute' | 'ydp';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export type LearnerStatus = 'on-track' | 'at-risk' | 'escalated' | 'completed';

export interface Learner {
  id: string;
  name: string;
  email: string;
  status: LearnerStatus;
  programme: string;
  startDate: string;
  coach: string;
  employer: string;
  attendance: number;
}

export interface AttendanceRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface CoachingSession {
  id: string;
  learnerId: string;
  learnerName: string;
  date: string;
  duration: number;
  notes: string;
  followUps: string[];
  sessionStatus: 'scheduled' | 'completed' | 'cancelled';
}

export interface Review {
  id: string;
  learnerId: string;
  learnerName: string;
  period: string;
  score: number;
  comments: string;
  targets: string;
  createdAt: string;
}

export interface Intervention {
  id: string;
  learnerId: string;
  learnerName: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  assignedTo: string;
  daysOpen: number;
  description: string;
}

export interface Goal {
  id: string;
  learnerId: string;
  title: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
}

export interface Evidence {
  id: string;
  learnerId: string;
  title: string;
  fileType: string;
  linkedTo: string;
  uploadedAt: string;
  fileSize: string;
}

export interface Appraisal {
  id: string;
  cycle: string;
  learnerId: string;
  learnerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  contributors: string[];
  overallScore: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
