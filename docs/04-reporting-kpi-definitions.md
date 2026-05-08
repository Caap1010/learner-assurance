# Reporting and KPI Definitions

## Purpose

Creates a single source of truth for metric calculations used in SharePoint views, exports, and Power BI.

## KPI Definitions

### Learner Compliance Percent

Formula:

- compliantLearners / totalActiveLearners * 100
Where compliantLearners satisfy all:
- attendance submission complete for period
- latest monthly review submitted
- no critical open intervention beyond SLA

### Attendance Rate

Formula:

- presentDays / expectedAttendanceDays * 100
Dimensions:
- by learner
- by cohort
- by programme
- by month

### Attendance Approval Timeliness

Formula:

- approvalsWithinSLA / totalApprovals * 100
SLA:
- within 2 business days

### Performance Trend Score

Formula:

- weighted average of last 3 monthly ratings
Weights:
- current month 0.5
- previous month 0.3
- month minus two 0.2

### At Risk Learner Count

Formula:

- count of learners with status in [At Risk, On Intervention]
Breakdown:
- by trigger type
- by severity
- by programme

### Goal Completion Rate

Formula:

- completedGoals / totalGoalsDueInPeriod * 100
Include only goals with dueDate in selected period.

### Task On-Time Completion Rate

Formula:

- tasksCompletedByDueDate / tasksDueInPeriod * 100

### Course Completion Rate

Formula:

- completedCourseAssignments / totalAssignedCourseAssignments * 100

### Intervention Resolution Time

Formula:

- average(closedAt - openedAt) in business days
Also track median to reduce outlier effects.

## Dashboard Requirements

- Executive dashboard: compliance, risk, trend, intervention severity.
- Operations dashboard: pending approvals, overdue actions, SLA breaches.
- Learner dashboard: personal goals, attendance, upcoming tasks.

## Filter Standards

All dashboards must support:

- date range
- programme
- role scope
- learner status

## Export Standards

- CSV and XLSX exports required.
- Export should include generated timestamp and applied filters.
- Sensitive fields omitted for non-privileged roles.

## Data Freshness Targets

- Operational metrics: refresh every 15 minutes.
- Executive summary metrics: hourly refresh.
- Historical trend reports: daily refresh.

## Open Decisions

- Confirm final cohort grouping logic.
- Confirm whether compliance denominator excludes suspended learners.
- Confirm Power BI licensing scope for audience.
