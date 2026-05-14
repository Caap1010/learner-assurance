import type {
  Learner, AttendanceRecord, CoachingSession, Review,
  Intervention, Goal, Evidence, Appraisal, Notification
} from '../types';

export const LEARNERS: Learner[] = [
  { id: 'l1', name: 'Priya Sharma', email: 'priya@example.com', status: 'on-track', programme: 'Digital Marketing L3', startDate: '2025-09-01', coach: 'Chris Coach', employer: 'TechCorp Ltd', attendance: 94 },
  { id: 'l2', name: 'Daniel Okafor', email: 'daniel@example.com', status: 'at-risk', programme: 'Data Analytics L4', startDate: '2025-09-01', coach: 'Chris Coach', employer: 'DataWorks Inc', attendance: 72 },
  { id: 'l3', name: 'Sofia Reyes', email: 'sofia@example.com', status: 'escalated', programme: 'Project Management L5', startDate: '2025-06-15', coach: 'Chris Coach', employer: 'BuildRight Co', attendance: 58 },
  { id: 'l4', name: 'Marcus Webb', email: 'marcus@example.com', status: 'completed', programme: 'Software Dev L4', startDate: '2024-09-01', coach: 'Chris Coach', employer: 'CodeBase Ltd', attendance: 98 },
  { id: 'l5', name: 'Amara Johnson', email: 'amara@example.com', status: 'on-track', programme: 'Accounting L3', startDate: '2025-09-01', coach: 'Chris Coach', employer: 'Finance Hub', attendance: 91 },
  { id: 'l6', name: 'Ethan Clarke', email: 'ethan@example.com', status: 'at-risk', programme: 'Digital Marketing L3', startDate: '2025-09-01', coach: 'Chris Coach', employer: 'MediaWave', attendance: 68 },
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', learnerId: 'l1', learnerName: 'Priya Sharma', date: '2026-05-08', status: 'present', approvalStatus: 'approved' },
  { id: 'a2', learnerId: 'l2', learnerName: 'Daniel Okafor', date: '2026-05-08', status: 'absent', approvalStatus: 'pending', notes: 'Reported sick' },
  { id: 'a3', learnerId: 'l3', learnerName: 'Sofia Reyes', date: '2026-05-08', status: 'late', approvalStatus: 'pending', notes: 'Arrived 45 min late' },
  { id: 'a4', learnerId: 'l4', learnerName: 'Marcus Webb', date: '2026-05-07', status: 'present', approvalStatus: 'approved' },
  { id: 'a5', learnerId: 'l5', learnerName: 'Amara Johnson', date: '2026-05-07', status: 'present', approvalStatus: 'approved' },
  { id: 'a6', learnerId: 'l6', learnerName: 'Ethan Clarke', date: '2026-05-07', status: 'absent', approvalStatus: 'rejected', notes: 'No notification given' },
];

export const SESSIONS: CoachingSession[] = [
  { id: 's1', learnerId: 'l1', learnerName: 'Priya Sharma', date: '2026-05-06', duration: 60, notes: 'Discussed Q2 goals and upcoming assessment. Priya is progressing well.', followUps: ['Submit portfolio draft by 15 May', 'Book next session'], sessionStatus: 'completed' },
  { id: 's2', learnerId: 'l2', learnerName: 'Daniel Okafor', date: '2026-05-09', duration: 45, notes: '', followUps: [], sessionStatus: 'scheduled' },
  { id: 's3', learnerId: 'l3', learnerName: 'Sofia Reyes', date: '2026-05-03', duration: 90, notes: 'Escalation review. Action plan agreed. Employer informed.', followUps: ['Weekly check-in for 4 weeks', 'Review intervention plan'], sessionStatus: 'completed' },
  { id: 's4', learnerId: 'l5', learnerName: 'Amara Johnson', date: '2026-05-12', duration: 60, notes: '', followUps: [], sessionStatus: 'scheduled' },
];

export const REVIEWS: Review[] = [
  { id: 'r1', learnerId: 'l1', learnerName: 'Priya Sharma', period: 'April 2026', score: 88, comments: 'Excellent progress, engaged and proactive.', targets: 'Complete unit 4 assessment.', createdAt: '2026-04-30' },
  { id: 'r2', learnerId: 'l2', learnerName: 'Daniel Okafor', period: 'April 2026', score: 61, comments: 'Attendance concerns. Needs more support.', targets: 'Improve attendance to 80%+.', createdAt: '2026-04-30' },
  { id: 'r3', learnerId: 'l3', learnerName: 'Sofia Reyes', period: 'March 2026', score: 45, comments: 'Significant concerns raised. Escalation in progress.', targets: 'Meet weekly with coach.', createdAt: '2026-03-31' },
  { id: 'r4', learnerId: 'l1', learnerName: 'Priya Sharma', period: 'March 2026', score: 82, comments: 'Strong month. Good engagement.', targets: 'Start unit 4 reading.', createdAt: '2026-03-31' },
  { id: 'r5', learnerId: 'l1', learnerName: 'Priya Sharma', period: 'February 2026', score: 75, comments: 'Good effort on assessments.', targets: 'Focus on written work.', createdAt: '2026-02-28' },
];

export const INTERVENTIONS: Intervention[] = [
  { id: 'i1', learnerId: 'l3', learnerName: 'Sofia Reyes', riskLevel: 'high', status: 'in-progress', assignedTo: 'Chris Coach', daysOpen: 18, description: 'Persistent attendance failure and lack of engagement with coursework.' },
  { id: 'i2', learnerId: 'l2', learnerName: 'Daniel Okafor', riskLevel: 'medium', status: 'open', assignedTo: 'Chris Coach', daysOpen: 6, description: 'Attendance dropped below threshold. Initial contact made.' },
  { id: 'i3', learnerId: 'l6', learnerName: 'Ethan Clarke', riskLevel: 'medium', status: 'open', assignedTo: 'Chris Coach', daysOpen: 4, description: 'Two consecutive unexplained absences.' },
];

export const GOALS: Goal[] = [
  { id: 'g1', learnerId: 'l1', title: 'Complete Unit 4 Assessment', dueDate: '2026-05-30', status: 'in-progress', progress: 65 },
  { id: 'g2', learnerId: 'l1', title: 'Achieve 90% attendance for the term', dueDate: '2026-07-01', status: 'in-progress', progress: 94 },
  { id: 'g3', learnerId: 'l2', title: 'Submit overdue portfolio evidence', dueDate: '2026-05-10', status: 'overdue', progress: 20 },
  { id: 'g4', learnerId: 'l2', title: 'Complete data visualisation module', dueDate: '2026-06-15', status: 'not-started', progress: 0 },
  { id: 'g5', learnerId: 'l5', title: 'Pass mock end-point assessment', dueDate: '2026-06-01', status: 'not-started', progress: 0 },
  { id: 'g6', learnerId: 'l4', title: 'Achieve distinction grade', dueDate: '2025-08-30', status: 'completed', progress: 100 },
];

export const EVIDENCE: Evidence[] = [
  { id: 'e1', learnerId: 'l1', title: 'Unit 3 Project Report.pdf', fileType: 'PDF', linkedTo: 'Unit 3', uploadedAt: '2026-04-18', fileSize: '2.4 MB' },
  { id: 'e2', learnerId: 'l1', title: 'Campaign Analysis Slides.pptx', fileType: 'PPTX', linkedTo: 'Unit 4', uploadedAt: '2026-05-02', fileSize: '5.1 MB' },
  { id: 'e3', learnerId: 'l2', title: 'Data Dashboard Screenshot.png', fileType: 'PNG', linkedTo: 'Unit 2', uploadedAt: '2026-03-22', fileSize: '980 KB' },
  { id: 'e4', learnerId: 'l4', title: 'Final Project GitHub Link.pdf', fileType: 'PDF', linkedTo: 'EPA', uploadedAt: '2025-08-01', fileSize: '145 KB' },
];

export const APPRAISALS: Appraisal[] = [
  { id: 'ap1', cycle: 'Mid-Year 2026', learnerId: 'l1', learnerName: 'Priya Sharma', status: 'in-progress', contributors: ['Chris Coach', 'Employer Rep', 'Peer'], overallScore: 84 },
  { id: 'ap2', cycle: 'Mid-Year 2026', learnerId: 'l2', learnerName: 'Daniel Okafor', status: 'pending', contributors: ['Chris Coach', 'Employer Rep'], overallScore: 0 },
  { id: 'ap3', cycle: 'Q1 2026', learnerId: 'l1', learnerName: 'Priya Sharma', status: 'completed', contributors: ['Chris Coach', 'Employer Rep', 'Peer'], overallScore: 79 },
  { id: 'ap4', cycle: 'Q1 2026', learnerId: 'l5', learnerName: 'Amara Johnson', status: 'completed', contributors: ['Chris Coach', 'Employer Rep'], overallScore: 88 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', message: 'Sofia Reyes missed their 3rd session this month', type: 'alert', read: false, createdAt: '2026-05-09T09:00:00' },
  { id: 'n2', message: 'Intervention for Daniel Okafor is overdue for review', type: 'warning', read: false, createdAt: '2026-05-08T14:30:00' },
  { id: 'n3', message: 'Ethan Clarke has an unexcused absence', type: 'warning', read: false, createdAt: '2026-05-08T09:00:00' },
  { id: 'n4', message: 'Marcus Webb completed their programme — congratulations!', type: 'info', read: true, createdAt: '2026-05-07T11:00:00' },
  { id: 'n5', message: 'Amara Johnson submitted new evidence for Unit 3', type: 'info', read: true, createdAt: '2026-05-06T16:00:00' },
];

export const COMPLIANCE_TREND = [
  { month: 'Nov', compliance: 91 },
  { month: 'Dec', compliance: 89 },
  { month: 'Jan', compliance: 93 },
  { month: 'Feb', compliance: 95 },
  { month: 'Mar', compliance: 92 },
  { month: 'Apr', compliance: 97 },
];

export const STATUS_DISTRIBUTION = [
  { name: 'On Track', value: 820, fill: '#10b981' },
  { name: 'At Risk', value: 310, fill: '#f59e0b' },
  { name: 'Escalated', value: 74, fill: '#ef4444' },
  { name: 'Completed', value: 44, fill: '#3b82f6' },
];

export const USERS_LIST = [
  { id: 'u1', name: 'Alex Admin', email: 'admin@learnerassurance.com', role: 'admin', status: 'active', lastLogin: '2026-05-09' },
  { id: 'u2', name: 'Chris Coach', email: 'coach@learnerassurance.com', role: 'coach', status: 'active', lastLogin: '2026-05-09' },
  { id: 'u3', name: 'Jordan Learner', email: 'learner@learnerassurance.com', role: 'learner', status: 'active', lastLogin: '2026-05-08' },
  { id: 'u4', name: 'Emma Employer', email: 'employer@learnerassurance.com', role: 'employer', status: 'active', lastLogin: '2026-05-07' },
  { id: 'u5', name: 'Sarah Smith', email: 'sarah@example.com', role: 'coach', status: 'inactive', lastLogin: '2026-04-30' },
  { id: 'u6', name: 'Maya Mentor', email: 'mentor@learnerassurance.com', role: 'mentor', status: 'active', lastLogin: '2026-05-09' },
  { id: 'u7', name: 'Mark Manager', email: 'manager@learnerassurance.com', role: 'manager', status: 'active', lastLogin: '2026-05-09' },
  { id: 'u8', name: 'Yuki YDP Candidate', email: 'ydp@learnerassurance.com', role: 'ydp', status: 'active', lastLogin: '2026-05-08' },
  { id: 'u9', name: 'Institute Admin', email: 'institute@learnerassurance.com', role: 'institute', status: 'active', lastLogin: '2026-05-08' },
];

export const PERMISSIONS_MATRIX = [
  { feature: 'View Learner Profiles', owner: true, admin: true, coach: true, learner: false, employer: true, mentor: true, manager: true, institute: true, ydp: false },
  { feature: 'Edit Learner Data', owner: true, admin: true, coach: true, learner: false, employer: false, mentor: false, manager: true, institute: false, ydp: false },
  { feature: 'Submit Attendance', owner: true, admin: true, coach: true, learner: true, employer: false, mentor: false, manager: false, institute: false, ydp: true },
  { feature: 'Approve Attendance', owner: true, admin: true, coach: false, learner: false, employer: false, mentor: false, manager: true, institute: true, ydp: false },
  { feature: 'Create Coaching Sessions', owner: true, admin: true, coach: true, learner: false, employer: false, mentor: true, manager: false, institute: false, ydp: false },
  { feature: 'View Own Sessions', owner: true, admin: true, coach: true, learner: true, employer: false, mentor: true, manager: false, institute: false, ydp: true },
  { feature: 'Create Interventions', owner: true, admin: true, coach: false, learner: false, employer: false, mentor: false, manager: true, institute: true, ydp: false },
  { feature: 'Upload Evidence', owner: true, admin: true, coach: true, learner: true, employer: false, mentor: true, manager: false, institute: false, ydp: true },
  { feature: 'Run Reports', owner: true, admin: true, coach: false, learner: false, employer: true, mentor: false, manager: true, institute: true, ydp: false },
  { feature: 'Manage Users', owner: true, admin: false, coach: false, learner: false, employer: false, mentor: false, manager: false, institute: true, ydp: false },
];
