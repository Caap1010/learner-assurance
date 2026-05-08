export type LearnerStatus = "Active" | "At Risk" | "On Intervention" | "Completed";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

export interface Learner {
    learnerId: string;
    firstName: string;
    lastName: string;
    programmeName: string;
    status: LearnerStatus;
    expectedCompletionDate: string;
}

export interface AttendanceRecord {
    attendanceId: string;
    learnerId: string;
    attendanceDate: string;
    status: AttendanceStatus;
    approvalStatus: "Draft" | "Submitted" | "Approved" | "Rejected";
}

export interface ApiEnvelope<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
    };
}
