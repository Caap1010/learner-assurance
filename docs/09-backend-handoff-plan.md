# Backend Handoff Plan for Codespaces

## Target Platform

- SharePoint Online site as data backbone
- Power Apps as app runtime and forms host (if applicable)
- Power Automate for approvals, reminders, escalations
- Power BI for reporting where licensed

## SharePoint List and Library Blueprint

- Learners
- AttendanceRecords
- CoachingSessions
- PerformanceReviews
- AppraisalCycles
- AppraisalFeedback
- Goals
- Tasks
- CourseAssignments
- Interventions
- Notifications
- AuditEvents
- EvidenceLibrary (document library)

## Key Column Standards

- Use stable internal names matching data contract field names.
- Enforce choice columns for status and enum values.
- Use person/group columns for ownership and approvals.
- Use lookup columns only where lifecycle coupling is stable.

## Workflow Build Sequence

1. Attendance submit and approval flow
2. Monthly review creation and approval flow
3. Appraisal request and reminder flow
4. Goal/task reminder flow
5. Risk trigger and intervention auto-creation flow
6. Escalation and breach notification flow

## Required Flow Controls

- Concurrency control for duplicate submissions
- Retry policy and dead-letter handling
- Idempotency keys for trigger actions
- Full error handling with support ticket hook

## Security Implementation Checklist

- Create Entra groups per role and map to SharePoint permissions
- Break inheritance on restricted lists and evidence library
- Restrict export capabilities by role
- Enable versioning and retention labels

## Reporting Implementation Checklist

- Build canonical views for each module
- Publish export templates with filter metadata
- Implement KPI semantic layer for consistency

## Operational Handoff Checklist

- Runbook for failed flows
- Access request process documentation
- Monthly permission review process
- Quarterly KPI and threshold tuning review

## Backend Done Criteria

- All workflows pass UAT scenario tests
- Escalations and reminders execute on schedule
- Audit records complete for all sensitive operations
- KPI outputs match approved formulas
- Security and retention controls validated by governance
