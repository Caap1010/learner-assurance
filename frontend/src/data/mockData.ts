import type { AttendanceRecord, Learner } from "../types/contracts";

export const mockLearners: Learner[] = [
    {
        learnerId: "L-1001",
        firstName: "Anele",
        lastName: "Mokoena",
        programmeName: "Cloud Support Learnership",
        status: "Active",
        expectedCompletionDate: "2026-11-30",
    },
    {
        learnerId: "L-1002",
        firstName: "Lindiwe",
        lastName: "Nkosi",
        programmeName: "Data Analyst Learnership",
        status: "At Risk",
        expectedCompletionDate: "2026-09-15",
    },
    {
        learnerId: "L-1003",
        firstName: "Thabo",
        lastName: "Mahlangu",
        programmeName: "Network Engineering Learnership",
        status: "On Intervention",
        expectedCompletionDate: "2027-01-31",
    },
];

export const mockAttendance: AttendanceRecord[] = [
    {
        attendanceId: "A-2001",
        learnerId: "L-1001",
        attendanceDate: "2026-05-06",
        status: "Present",
        approvalStatus: "Approved",
    },
    {
        attendanceId: "A-2002",
        learnerId: "L-1002",
        attendanceDate: "2026-05-06",
        status: "Absent",
        approvalStatus: "Submitted",
    },
    {
        attendanceId: "A-2003",
        learnerId: "L-1003",
        attendanceDate: "2026-05-06",
        status: "Late",
        approvalStatus: "Submitted",
    },
];
