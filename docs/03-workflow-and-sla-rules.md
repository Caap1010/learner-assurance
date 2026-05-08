# Workflow, SLA, and Trigger Rules

## Purpose

Defines operational workflow rules, deadlines, reminders, and escalation thresholds.

## Attendance Workflow

1. Submission

- Learner or Coach submits attendance by 18:00 local time.

2. Approval

- Supervisor approves or rejects within 2 business days.

3. Reminder Sequence

- Reminder 1 at 24 hours after submission if pending.
- Reminder 2 at 48 hours after submission if pending.

4. Escalation

- Escalate to Assurance Officer at 72 hours pending.

## Monthly Performance Review Workflow

1. Review Creation

- Auto-create monthly review task on day 1.

2. Submission Deadline

- Coach/Supervisor submit by day 5.

3. Approval Deadline

- Manager approves by day 8.

4. Escalation

- Missing submission by day 6 triggers warning.
- Missing approval by day 9 escalates to Assurance Officer.

## 360 Appraisal Workflow

1. Appraisal cycle created by Coach or Assurance Officer.
2. Feedback request sent to selected contributors.
3. Feedback window: 7 calendar days.
4. Day 5 reminder to incomplete contributors.
5. Day 8 escalation notice to cycle owner.
6. Aggregation and summary locked after manager acknowledgment.

## Goal and Task Workflow

- Goal statuses:
  - Not Started -> In Progress -> Completed
  - Not Started/In Progress -> At Risk
- Task statuses:
  - Not Started -> In Progress -> Completed
  - Overdue set automatically at 00:00 after dueDate

## Intervention Trigger Thresholds

### Attendance Based Triggers

- Low risk:
  - 2 absences in rolling 14 days.
- Medium risk:
  - 3 absences in rolling 30 days.
- High risk:
  - 5 absences in rolling 30 days.
- Critical risk:
  - 7 absences in rolling 60 days.

### Performance Based Triggers

- Medium risk:
  - Performance rating <= 2 once.
- High risk:
  - Performance rating <= 2 in 2 consecutive months.
- Critical risk:
  - Performance rating = 1 and attendance low risk or worse in same month.

### Goal/Task Based Triggers

- Medium risk:
  - 2 overdue goals in current month.
- High risk:
  - 4 overdue tasks in current month.
- Critical risk:
  - Any mandatory goal overdue by >14 days.

## Escalation Ownership

- Low: Coach
- Medium: Supervisor
- High: Assurance Officer
- Critical: Assurance Officer + Manager

## Intervention SLA

- Open intervention within 1 business day of trigger.
- Publish action plan within 2 business days.
- Review intervention progress weekly.
- Close only when all linked actions complete.

## Notification Matrix

- Attendance pending approval: Supervisor
- Review pending approval: Manager
- Escalated intervention: Assurance Officer, Manager
- Overdue tasks: Assignee, Assignor
- Upcoming due date (48 hours): Assignee

## Status Transition Guardrails

- Completed learner cannot move back to Active without Admin override.
- Closed intervention cannot return to Open; create a new intervention.
- Approved performance reviews are read-only except Admin correction flow.

## Open Decisions

- Confirm business day calendar source (regional holidays).
- Confirm local timezone policy if learners are cross-region.
- Confirm if escalation should include Teams notifications by default.
