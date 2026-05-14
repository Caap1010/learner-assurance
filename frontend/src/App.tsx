import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import ToastContainer from './components/common/ToastContainer';
import AppShell from './components/layout/AppShell';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RecoverPasswordPage = lazy(() => import('./pages/auth/RecoverPasswordPage'));
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const CohortsDashboard = lazy(() => import('./pages/owner/CohortsDashboard'));
const OwnerProgrammesPage = lazy(() => import('./pages/owner/OwnerProgrammesPage'));
const OwnerPartnersPage = lazy(() => import('./pages/owner/OwnerPartnersPage'));
const OwnerApprovalsPage = lazy(() => import('./pages/owner/OwnerApprovalsPage'));
const OwnerCompliancePage = lazy(() => import('./pages/owner/OwnerCompliancePage'));
const OwnerInterventionsPage = lazy(() => import('./pages/owner/OwnerInterventionsPage'));
const OwnerCommunicationsPage = lazy(() => import('./pages/owner/OwnerCommunicationsPage'));
const OwnerAuditLogPage = lazy(() => import('./pages/owner/OwnerAuditLogPage'));
const OwnerSettingsPage = lazy(() => import('./pages/owner/OwnerSettingsPage'));
const OwnerIntegrationsPage = lazy(() => import('./pages/owner/OwnerIntegrationsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CoachDashboard = lazy(() => import('./pages/coach/CoachDashboard'));
const LearnerDashboard = lazy(() => import('./pages/learner/LearnerDashboard'));
const EmployerDashboard = lazy(() => import('./pages/employer/EmployerDashboard'));
const MentorDashboard = lazy(() => import('./pages/mentor/MentorDashboard'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const InstituteDashboard = lazy(() => import('./pages/institute/InstituteDashboard'));
const LearnersPage = lazy(() => import('./pages/shared/LearnersPage'));
const LearnerProfile = lazy(() => import('./pages/shared/LearnerProfile'));
const AttendancePage = lazy(() => import('./pages/shared/AttendancePage'));
const CoachingPage = lazy(() => import('./pages/shared/CoachingPage'));
const ReviewsPage = lazy(() => import('./pages/shared/ReviewsPage'));
const AppraisalsPage = lazy(() => import('./pages/shared/AppraisalsPage'));
const GoalsPage = lazy(() => import('./pages/shared/GoalsPage'));
const InterventionsPage = lazy(() => import('./pages/shared/InterventionsPage'));
const EvidencePage = lazy(() => import('./pages/shared/EvidencePage'));
const ExecutiveDashboard = lazy(() => import('./pages/shared/ExecutiveDashboard'));
const ExecutiveDrilldownPage = lazy(() => import('./pages/shared/ExecutiveDrilldownPage'));
const OperationsDashboard = lazy(() => import('./pages/shared/OperationsDashboard'));

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <AppShell>{children}</AppShell> : <Navigate to="/login" replace />;
}

function OwnerRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'owner') {
    const dashPath: Record<string, string> = {
      owner: '/owner/dashboard', admin: '/admin/dashboard', coach: '/coach/dashboard',
      learner: '/learner/dashboard', employer: '/employer/dashboard',
      mentor: '/mentor/dashboard', manager: '/manager/dashboard', institute: '/institute/dashboard',
      ydp: '/ydp/dashboard',
    };
    return <Navigate to={dashPath[user.role] ?? '/'} replace />;
  }
  return <AppShell>{children}</AppShell>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dashPath: Record<string, string> = {
    owner: '/owner/dashboard', admin: '/admin/dashboard', coach: '/coach/dashboard',
    learner: '/learner/dashboard', employer: '/employer/dashboard',
    mentor: '/mentor/dashboard', manager: '/manager/dashboard', institute: '/institute/dashboard',
    ydp: '/ydp/dashboard',
  };
  return <Navigate to={dashPath[user.role] ?? '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recover-password" element={<RecoverPasswordPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="/owner/cohorts" element={<OwnerRoute><CohortsDashboard /></OwnerRoute>} />
      <Route path="/owner/users" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="/owner/permissions" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="/owner/activity" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="/owner/reports" element={<OwnerRoute><ExecutiveDashboard /></OwnerRoute>} />
      <Route path="/owner/programmes" element={<OwnerRoute><OwnerProgrammesPage /></OwnerRoute>} />
      <Route path="/owner/partners" element={<OwnerRoute><OwnerPartnersPage /></OwnerRoute>} />
      <Route path="/owner/approvals" element={<OwnerRoute><OwnerApprovalsPage /></OwnerRoute>} />
      <Route path="/owner/compliance" element={<OwnerRoute><OwnerCompliancePage /></OwnerRoute>} />
      <Route path="/owner/interventions" element={<OwnerRoute><OwnerInterventionsPage /></OwnerRoute>} />
      <Route path="/owner/communications" element={<OwnerRoute><OwnerCommunicationsPage /></OwnerRoute>} />
      <Route path="/owner/audit-log" element={<OwnerRoute><OwnerAuditLogPage /></OwnerRoute>} />
      <Route path="/owner/settings" element={<OwnerRoute><OwnerSettingsPage /></OwnerRoute>} />
      <Route path="/owner/integrations" element={<OwnerRoute><OwnerIntegrationsPage /></OwnerRoute>} />
      <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/admin/learners/:id" element={<PrivateRoute><LearnerProfile /></PrivateRoute>} />
      <Route path="/admin/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/admin/coaching" element={<PrivateRoute><CoachingPage /></PrivateRoute>} />
      <Route path="/admin/reviews" element={<PrivateRoute><ReviewsPage /></PrivateRoute>} />
      <Route path="/admin/appraisals" element={<PrivateRoute><AppraisalsPage /></PrivateRoute>} />
      <Route path="/admin/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/admin/interventions" element={<PrivateRoute><InterventionsPage /></PrivateRoute>} />
      <Route path="/admin/evidence" element={<PrivateRoute><EvidencePage /></PrivateRoute>} />
      <Route path="/admin/operations" element={<PrivateRoute><OperationsDashboard /></PrivateRoute>} />
      <Route path="/coach/dashboard" element={<PrivateRoute><CoachDashboard /></PrivateRoute>} />
      <Route path="/coach/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/coach/learners/:id" element={<PrivateRoute><LearnerProfile /></PrivateRoute>} />
      <Route path="/coach/coaching" element={<PrivateRoute><CoachingPage /></PrivateRoute>} />
      <Route path="/coach/reviews" element={<PrivateRoute><ReviewsPage /></PrivateRoute>} />
      <Route path="/coach/interventions" element={<PrivateRoute><InterventionsPage /></PrivateRoute>} />
      <Route path="/learner/dashboard" element={<PrivateRoute><LearnerDashboard /></PrivateRoute>} />
      <Route path="/learner/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/learner/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/learner/evidence" element={<PrivateRoute><EvidencePage /></PrivateRoute>} />
      <Route path="/learner/reviews" element={<PrivateRoute><ReviewsPage /></PrivateRoute>} />
      <Route path="/employer/dashboard" element={<PrivateRoute><EmployerDashboard /></PrivateRoute>} />
      <Route path="/employer/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/employer/reports" element={<PrivateRoute><ExecutiveDashboard /></PrivateRoute>} />
      <Route path="/mentor/dashboard" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
      <Route path="/mentor/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/mentor/learners/:id" element={<PrivateRoute><LearnerProfile /></PrivateRoute>} />
      <Route path="/mentor/coaching" element={<PrivateRoute><CoachingPage /></PrivateRoute>} />
      <Route path="/mentor/reviews" element={<PrivateRoute><ReviewsPage /></PrivateRoute>} />
      <Route path="/mentor/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/manager/dashboard" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
      <Route path="/manager/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/manager/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/manager/interventions" element={<PrivateRoute><InterventionsPage /></PrivateRoute>} />
      <Route path="/manager/reports" element={<PrivateRoute><ExecutiveDashboard /></PrivateRoute>} />
      <Route path="/institute/dashboard" element={<PrivateRoute><InstituteDashboard /></PrivateRoute>} />
      <Route path="/institute/learners" element={<PrivateRoute><LearnersPage /></PrivateRoute>} />
      <Route path="/institute/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/institute/operations" element={<PrivateRoute><OperationsDashboard /></PrivateRoute>} />
      <Route path="/institute/reports" element={<PrivateRoute><ExecutiveDashboard /></PrivateRoute>} />
      <Route path="/reports/learners" element={<PrivateRoute><ExecutiveDrilldownPage view="learners" /></PrivateRoute>} />
      <Route path="/reports/completion" element={<PrivateRoute><ExecutiveDrilldownPage view="completion" /></PrivateRoute>} />
      <Route path="/reports/compliance" element={<PrivateRoute><ExecutiveDrilldownPage view="compliance" /></PrivateRoute>} />
      <Route path="/reports/risk" element={<PrivateRoute><ExecutiveDrilldownPage view="risk" /></PrivateRoute>} />
      <Route path="/ydp/dashboard" element={<PrivateRoute><LearnerDashboard /></PrivateRoute>} />
      <Route path="/ydp/profile" element={<PrivateRoute><LearnerProfile /></PrivateRoute>} />
      <Route path="/ydp/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/ydp/progress" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/ydp/resources" element={<PrivateRoute><EvidencePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlatformDataProvider>
          <ToastProvider>
            <Suspense fallback={<div style={{ padding: 24 }}><LoadingSkeleton rows={6} cols={4} /></div>}>
              <AppRoutes />
            </Suspense>
            <ToastContainer />
          </ToastProvider>
        </PlatformDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
