# Environments, Release, and Support Model

## Environment Model

- DEV: build and internal testing
- UAT: business validation and sign-off
- PROD: live operations

## Environment Rules

- No direct manual edits in PROD lists or workflows.
- Changes must move DEV -> UAT -> PROD with approvals.
- Configuration values tracked per environment.

## Release Process

1. Scope freeze for sprint release
2. Test evidence attached to release ticket
3. UAT sign-off by Assurance product owner
4. Deployment approval by platform owner
5. Post-release validation checklist within 24 hours

## Rollback Strategy

- Workflow rollback: disable latest flow version and restore prior version.
- Schema rollback: controlled migration scripts with backup export.
- Frontend rollback: redeploy last known good artifact.

## Support Model

- L1: operational support team handles access, basic issues
- L2: assurance platform team handles workflow/data issues
- L3: engineering handles defects and enhancements

## Incident Priority Matrix

- P1: data exposure, system unavailable, approval chain blocked globally
- P2: critical workflow failing for a business unit
- P3: module defect with workaround
- P4: cosmetic or minor usability issue

## SLA Targets

- P1 response: 30 minutes
- P2 response: 2 hours
- P3 response: 8 business hours
- P4 response: 2 business days

## Monitoring Requirements

- Flow failure alerts to support channel
- Daily health report for pending approvals and overdue escalations
- Weekly governance report for access and audit anomalies

## Open Decisions

- Confirm support hours and on-call model.
- Confirm release window constraints.
- Confirm incident tooling and ticket taxonomy.
