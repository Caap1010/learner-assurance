export type AppRole =
    | "Learner"
    | "Coach"
    | "Mentor"
    | "Supervisor"
    | "Manager"
    | "AssuranceOfficer"
    | "Admin"
    | "Auditor";

export interface AuthUser {
    id: string;
    fullName: string;
    role: AppRole;
}
