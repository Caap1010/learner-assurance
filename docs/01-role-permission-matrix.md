# Learner Assurance Portal Role and Permission Matrix

## Purpose

This matrix defines who can perform which actions in each module. Backend must enforce all permissions server-side. Frontend uses this for navigation and UI visibility only.

## Roles

- Learner
- Coach
- Mentor
- Supervisor
- Manager
- Assurance Officer
- Admin
- Auditor (read-only)

## Permission Legend

- C: Create
- R: Read
- U: Update
- D: Delete
- A: Approve
- E: Escalate
- X: Export
- S: Submit

## Module Permissions

### Learner Profile

- Learner: R (own profile), U (limited fields: phone, address, emergency contact)
- Coach: R, U (programme progress section)
- Mentor: R, U (development notes section)
- Supervisor: R, U (placement and attendance section)
- Manager: R, X
- Assurance Officer: C, R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Attendance

- Learner: C (self submission if enabled), R (own records), S
- Coach: C, R, U, S
- Supervisor: R, A, U
- Manager: R, X
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Coaching Sessions

- Learner: R (assigned sessions), U (confirm attendance), S (feedback)
- Coach: C, R, U, D, S
- Mentor: C, R, U, S
- Supervisor: R, U
- Manager: R
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R

### Monthly Performance Reviews

- Learner: R (finalized reviews only), S (acknowledge receipt)
- Coach: C, R, U, S
- Supervisor: C, R, U, S
- Manager: R, A
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### 360 Appraisals

- Learner: R (aggregated view, anonymized where required)
- Coach: C (request cycle), R, S
- Mentor: C (input), R, S
- Supervisor: C (input), R, S
- Manager: C (input), R, S, A
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Goals and Roadmaps

- Learner: C (personal goals if enabled), R, U (own), S
- Coach: C, R, U, S
- Mentor: C, R, U
- Supervisor: C, R, U, A
- Manager: R, A, X
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Tasks and Deliverables

- Learner: R (assigned), U (status), S (evidence)
- Coach: C, R, U, D, A
- Mentor: C, R, U, A
- Supervisor: C, R, U, A
- Manager: R, X
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Courses and Learning

- Learner: R (assigned courses), U (progress evidence), S
- Coach: C, R, U, A
- Supervisor: C, R, U, A
- Manager: R, X
- Assurance Officer: R, U, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Interventions and Escalations

- Learner: R (own action plan), U (progress notes)
- Coach: C, R, U, S
- Supervisor: C, R, U, A
- Manager: R, A, E
- Assurance Officer: C, R, U, A, E, X
- Admin: C, R, U, D, X
- Auditor: R, X

### Reporting and Exports

- Learner: R (own dashboard only)
- Coach: R (cohort), X (limited)
- Supervisor: R (team), X (limited)
- Manager: R, X
- Assurance Officer: R, X
- Admin: R, X
- Auditor: R, X

## Approval Delegation Rules

- Manager can delegate approvals to Supervisor for up to 30 days.
- Assurance Officer approval cannot be delegated.
- Delegations must have start date, end date, reason, and delegate user id.

## Segregation of Duties

- A user cannot approve their own submission.
- A user cannot close an intervention they opened.
- Admin can maintain data but cannot approve performance outcomes.

## Open Decisions

- Confirm whether Learners can self-submit attendance in all programmes.
- Confirm whether peer feedback is anonymous by default.
- Confirm if Managers can edit finalized performance reviews.
