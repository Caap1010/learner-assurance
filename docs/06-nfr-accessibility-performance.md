# Non Functional Requirements

## Performance Targets

- Initial page load p95 <= 3.0 seconds on standard enterprise network.
- API-backed view refresh p95 <= 1.5 seconds for filtered lists under 2,000 records.
- Dashboard render p95 <= 4.0 seconds with default filters.

## Scalability Targets

- Support 5,000 active learners without architecture redesign.
- Support 200 concurrent active users during peak review windows.

## Availability and Reliability

- Target availability: 99.5 percent monthly for core workflows.
- Retry and dead-letter handling for failed workflow steps.
- Alerting on failed approval/escalation workflow events.

## Accessibility

- Meet WCAG 2.1 AA baseline.
- Full keyboard navigation for all forms and tables.
- Visible focus states and readable contrast ratio at least 4.5:1.
- Form errors announced clearly and linked to fields.

## Usability

- Role dashboards should surface top 5 pending actions first.
- Primary actions should be reachable within two clicks from dashboard.
- Avoid duplicate data entry by pre-filling known learner details.

## Security

- Enforce least privilege and separation of duties.
- Ensure audit logging for all approvals and status transitions.
- Mask restricted fields for non-privileged users in exports.

## Maintainability

- Contract-first architecture for frontend service layer.
- Standardized status enums shared across modules.
- Configuration-driven thresholds for risk triggers.

## Localization and Time

- Store all timestamps in UTC.
- Display local time by user profile timezone.
- Business day calculations must use approved calendar service.

## Quality Gates

- Unit tests for validation and status transition logic.
- Integration tests for critical workflows.
- UAT sign-off from Assurance owner and Operations owner.

## Open Decisions

- Confirm peak concurrency assumptions.
- Confirm whether offline data entry is required.
- Confirm minimum browser support matrix.
