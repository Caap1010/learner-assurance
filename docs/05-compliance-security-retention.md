# Compliance, Security, and Retention Controls

## Purpose

Defines legal, security, and governance controls for learner assurance data.

## Data Classification

- Public: none
- Internal: programme metadata, non-sensitive schedules
- Confidential: learner records, attendance, goals, reviews
- Restricted: appraisals, interventions, disciplinary notes

## Privacy and Legal Requirements

- Follow POPIA/GDPR principles applicable to data subjects.
- Purpose limitation: collect only required data for learner assurance.
- Data minimization: avoid unnecessary sensitive fields.
- Consent notice required for peer feedback participation where mandated.

## Access Control

- Enforce least privilege through Entra groups.
- Use role-based access with explicit deny for restricted modules.
- Break inheritance on sensitive SharePoint libraries.

## Audit and Traceability

- Log create/update/delete and approval actions with actor, timestamp, source, and reason.
- Maintain immutable audit trail for appraisal and intervention records.
- Retain approval history for all workflow decisions.

## Retention Policy (Recommended Baseline)

- Attendance records: 5 years
- Performance reviews: 5 years
- Appraisal feedback: 5 years
- Intervention records: 7 years
- Evidence documents: 7 years
- Audit events: 7 years minimum

## Archival and Disposal

- Archive completed learner records after 12 months of completion.
- Secure disposal at retention end through approved M365 retention labels.
- Legal hold overrides disposal when required.

## File Upload Policy

- Allowed extensions: pdf, docx, xlsx, png, jpg, jpeg
- Blocked extensions: exe, bat, cmd, js, ps1, vbs, zip (unless approved)
- Max file size: 20 MB recommended baseline
- Mandatory metadata: learnerId, evidenceType, sourceModule, uploadDate

## Security Baseline

- MFA required for all non-learner administrative users.
- Conditional access for high-risk sign-ins.
- DLP policy for restricted fields in export channels.
- Session timeout for admin and assurance users after 20 minutes idle.

## Incident and Breach Handling

- Alert within 1 hour for unauthorized access detection.
- Triage severity within 4 hours.
- Containment and communication process aligned with organization policy.

## Open Decisions

- Confirm if peer appraisal data is classified Restricted or Confidential.
- Confirm whether zip uploads are allowed for bulk evidence.
- Confirm retention periods against legal counsel guidance.
