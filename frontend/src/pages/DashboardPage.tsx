import { DataTable } from "../components/common/DataTable";
import { Timeline } from "../components/common/Timeline";
import { mockAttendance, mockLearners } from "../data/mockData";

const activity = [
    {
        id: "T1",
        title: "Intervention opened for L-1003",
        meta: "High risk escalation · 30 min ago",
        detail: "Attendance and performance thresholds crossed.",
    },
    {
        id: "T2",
        title: "Monthly reviews due in 2 days",
        meta: "Reminder cycle",
        detail: "6 learners still pending coach submission.",
    },
    {
        id: "T3",
        title: "Course evidence uploaded",
        meta: "Compliance update",
        detail: "Cisco certificate linked to learner L-1001.",
    },
];

export function DashboardPage() {
    return (
        <section className="content-grid">
            <div className="stats-row">
                <article className="stat-card">
                    <p>Compliance</p>
                    <h2>86%</h2>
                </article>
                <article className="stat-card">
                    <p>At Risk</p>
                    <h2>14</h2>
                </article>
                <article className="stat-card">
                    <p>Pending Approvals</p>
                    <h2>22</h2>
                </article>
            </div>

            <DataTable
                title="Learner Snapshot"
                rows={mockLearners}
                columns={[
                    { key: "learnerId", label: "Learner ID" },
                    { key: "firstName", label: "First Name" },
                    { key: "lastName", label: "Last Name" },
                    { key: "status", label: "Status" },
                    { key: "programmeName", label: "Programme" },
                ]}
            />

            <DataTable
                title="Attendance Queue"
                rows={mockAttendance}
                columns={[
                    { key: "attendanceId", label: "Attendance ID" },
                    { key: "learnerId", label: "Learner ID" },
                    { key: "attendanceDate", label: "Date" },
                    { key: "status", label: "Mark" },
                    { key: "approvalStatus", label: "Approval" },
                ]}
            />

            <Timeline items={activity} />
        </section>
    );
}
