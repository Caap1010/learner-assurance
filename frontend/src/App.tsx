import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/common/ToastContainer';
import AppShell from './components/layout/AppShell';

import LoginPage from './pages/auth/LoginPage';
import RecoverPasswordPage from './pages/auth/RecoverPasswordPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CohortsDashboard from './pages/owner/CohortsDashboard';
import OwnerProgrammesPage from './pages/owner/OwnerProgrammesPage';
import OwnerPartnersPage from './pages/owner/OwnerPartnersPage';
import OwnerApprovalsPage from './pages/owner/OwnerApprovalsPage';
import OwnerCompliancePage from './pages/owner/OwnerCompliancePage';
import OwnerInterventionsPage from './pages/owner/OwnerInterventionsPage';
import OwnerCommunicationsPage from './pages/owner/OwnerCommunicationsPage';
import OwnerAuditLogPage from './pages/owner/OwnerAuditLogPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import OwnerIntegrationsPage from './pages/owner/OwnerIntegrationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CoachDashboard from './pages/coach/CoachDashboard';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import InstituteDashboard from './pages/institute/InstituteDashboard';
import LearnersPage from './pages/shared/LearnersPage';
import LearnerProfile from './pages/shared/LearnerProfile';
import AttendancePage from './pages/shared/AttendancePage';
import CoachingPage from './pages/shared/CoachingPage';
import ReviewsPage from './pages/shared/ReviewsPage';
import AppraisalsPage from './pages/shared/AppraisalsPage';
import GoalsPage from './pages/shared/GoalsPage';
import InterventionsPage from './pages/shared/InterventionsPage';
import EvidencePage from './pages/shared/EvidencePage';
import ExecutiveDashboard from './pages/shared/ExecutiveDashboard';
import ExecutiveDrilldownPage from './pages/shared/ExecutiveDrilldownPage';
import OperationsDashboard from './pages/shared/OperationsDashboard';

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
            <AppRoutes />
            <ToastContainer />
          </ToastProvider>
        </PlatformDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
