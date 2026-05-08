import { createContext, useContext, useMemo, useState } from "react";
import type { AppRole, AuthUser } from "../types/auth";

interface AuthContextValue {
    currentUser: AuthUser;
    setRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const baseUser: AuthUser = {
    id: "U-1",
    fullName: "Portal User",
    role: "AssuranceOfficer",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AuthUser>(baseUser);

    const value = useMemo(
        () => ({
            currentUser,
            setRole: (role: AppRole) => setCurrentUser((prev) => ({ ...prev, role })),
        }),
        [currentUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}
