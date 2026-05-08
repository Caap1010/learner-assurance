# Data Model and Contracts

## Purpose

Defines shared frontend-backend contracts for all modules. Frontend should use this document to build forms, validation, and service interfaces.

## Core Entities

- Learner
- AttendanceRecord
- CoachingSession
- PerformanceReview
- AppraisalCycle
- AppraisalFeedback
- Goal
- Task
- CourseAssignment
- EvidenceItem
- Intervention
- NotificationEvent
- AuditEvent

## Canonical Field Definitions

### Learner

- learnerId: string, required, immutable
- employeeNumber: string, required, unique
- firstName: string, required
- lastName: string, required
- email: string, required, unique
- programmeName: string, required
- intakeDate: date, required
- expectedCompletionDate: date, required
- status: enum[Active, At Risk, On Intervention, Completed], required
- assignedCoachIds: string[], optional
- assignedMentorIds: string[], optional
- assignedSupervisorIds: string[], optional
- createdAt: datetime, required
- updatedAt: datetime, required

### AttendanceRecord

- attendanceId: string, required
- learnerId: string, required
- periodType: enum[Daily, Weekly, Monthly], required
- attendanceDate: date, required
- status: enum[Present, Absent, Late, Excused], required
- timeIn: datetime, optional
- timeOut: datetime, optional
- totalHours: number, calculated
- submittedBy: string, required
- submittedAt: datetime, required
- approvalStatus: enum[Draft, Submitted, Approved, Rejected], required
- approverId: string, optional
- approvedAt: datetime, optional

### CoachingSession

- sessionId: string, required
- learnerId: string, required
- scheduledAt: datetime, required
- sessionType: enum[Technical, Behavioural, Progress Review], required
- facilitatorId: string, required
- notes: richtext, optional
- outcomes: richtext, optional
- followUpActions: string[], optional
- linkedGoalIds: string[], optional
- linkedReviewId: string, optional
- status: enum[Scheduled, Completed, Cancelled], required

### PerformanceReview

- reviewId: string, required
- learnerId: string, required
- reviewMonth: string(YYYY-MM), required
- reviewerId: string, required
- reviewerRole: enum[Coach, Supervisor], required
- performanceRating: integer[1..5], required
- strengths: richtext, required
- gaps: richtext, required
- improvementAreas: richtext, required
- riskLevel: enum[Low, Medium, High], required
- status: enum[Draft, Submitted, Approved, Rejected], required
- submittedAt: datetime, optional
- approvedAt: datetime, optional

### Goal

- goalId: string, required
- learnerId: string, required
- level: enum[Learnership, Monthly, Weekly, Daily], required
- title: string, required
- description: richtext, optional
- ownerId: string, required
- startDate: date, required
- dueDate: date, required
- status: enum[Not Started, In Progress, Completed, At Risk], required
- progressPercent: integer[0..100], required
- progressNotes: richtext, optional
- linkedTaskIds: string[], optional

### Task

- taskId: string, required
- learnerId: string, optional
- assignedToId: string, required
- assignedById: string, required
- title: string, required
- dueDate: date, required
- completionStatus: enum[Not Started, In Progress, Completed, Overdue], required
- linkedGoalId: string, optional
- linkedCourseAssignmentId: string, optional
- linkedInterventionId: string, optional
- evidenceRequired: boolean, required
- evidenceItemIds: string[], optional

### CourseAssignment

- assignmentId: string, required
- learnerId: string, optional
- assigneeId: string, required
- courseName: string, required
- platform: enum[Microsoft Learn, Cisco NetAcad, MiGrowth Percipio, Internal, Other], required
- platformLink: string(url), required
- assignedDate: date, required
- targetCompletionDate: date, required
- completionStatus: enum[Not Started, In Progress, Completed, Expired], required
- completionDate: date, optional

### EvidenceItem

- evidenceId: string, required
- learnerId: string, required
- evidenceType: enum[Certificate, Screenshot, Report, Assignment, Timesheet, Other], required
- fileName: string, required
- fileUrl: string, required
- sourceModule: enum[Attendance, Goal, Task, Course, Intervention, Review], required
- sourceRecordId: string, required
- uploadedBy: string, required
- uploadedAt: datetime, required
- version: integer, required

### Intervention

- interventionId: string, required
- learnerId: string, required
- triggerType: enum[Attendance, Performance, Goal Overdue, Manual], required
- triggerDetails: richtext, required
- severity: enum[Low, Medium, High, Critical], required
- ownerId: string, required
- actionPlan: richtext, required
- dueDate: date, required
- status: enum[Open, In Progress, Resolved, Escalated, Closed], required
- escalatedToId: string, optional
- escalatedAt: datetime, optional
- closedAt: datetime, optional

## API Contract Patterns

- All responses include requestId and timestamp.
- All write operations return resource id and current status.
- All list endpoints support pagination, sorting, and filtering.

## Standard Envelope

- success: boolean
- data: object | array
- error: { code: string, message: string, details?: object }
- meta: { page?: number, pageSize?: number, total?: number }

## Error Codes

- AUTH-401 Unauthorized
- AUTH-403 Forbidden
- VAL-400 Validation error
- DATA-404 Not found
- DATA-409 Conflict
- FLOW-422 Invalid status transition
- SYS-500 Internal server error

## Validation Rules

- All date fields use ISO 8601.
- timeOut must be greater than timeIn.
- progressPercent must match status mapping:
  - Not Started: 0
  - In Progress: 1 to 99
  - Completed: 100
- Performance review rating must be integer 1 to 5.
- Closed interventions cannot be edited except by Admin.

## Open Decisions

- Confirm whether attendance supports half-day values.
- Confirm whether course completion can be self-declared without evidence.
- Confirm max file size per evidence item (recommended 20 MB).
