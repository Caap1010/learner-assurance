import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { AppRole } from "../../types/auth";

const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/learners", label: "Learners" },
    { to: "/attendance", label: "Attendance" },
    { to: "/reviews", label: "Reviews" },
    { to: "/interventions", label: "Interventions" },
];

const roleOptions: AppRole[] = [
    "Learner",
    "Coach",
    "Mentor",
    "Supervisor",
    "Manager",
    "AssuranceOfficer",
    "Admin",
    "Auditor",
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const { currentUser, setRole } = useAuth();

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link to="/" className="brand">
                    Learner Assurance
                </Link>
                <nav>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => (isActive ? "active-link" : "")}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="role-switcher">
                    <label htmlFor="role">Role Preview</label>
                    <select
                        id="role"
                        value={currentUser.role}
                        onChange={(event) => setRole(event.target.value as AppRole)}
                    >
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div>
                        <h1>Learner Assurance Portal</h1>
                        <p>Operational insight, learner growth, and governance in one view.</p>
                    </div>
                    <div className="user-pill">
                        <strong>{currentUser.fullName}</strong>
                        <span>{currentUser.role}</span>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
