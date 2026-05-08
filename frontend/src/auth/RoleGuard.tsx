import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { AppRole } from "../types/auth";

interface RoleGuardProps {
    allowedRoles: AppRole[];
    children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/" replace state={{ deniedFrom: location.pathname }} />;
    }

    return <>{children}</>;
}
