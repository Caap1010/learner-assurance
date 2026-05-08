import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RoleGuard } from "./auth/RoleGuard";
import { DashboardPage } from "./pages/DashboardPage";
import { LearnerProfilePage } from "./pages/LearnerProfilePage";
import { AttendancePage } from "./pages/AttendancePage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { InterventionsPage } from "./pages/InterventionsPage";

function NotFoundPage() {
    return (
        <section className="panel">
            <h2>Page Not Found</h2>
            <p>The requested module route does not exist.</p>
        </section>
    );
}

export default function App() {
    return (
        <AppShell>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/learners" element={<LearnerProfilePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route
                    path="/reviews"
                    element={
                        <RoleGuard allowedRoles={["Coach", "Supervisor", "Manager", "AssuranceOfficer", "Admin", "Auditor"]}>
                            <ReviewsPage />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/interventions"
                    element={
                        <RoleGuard allowedRoles={["Coach", "Supervisor", "Manager", "AssuranceOfficer", "Admin", "Auditor"]}>
                            <InterventionsPage />
                        </RoleGuard>
                    }
                />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AppShell>
    );
}
