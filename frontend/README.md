# Frontend Scope

This folder is for the Learner Assurance portal frontend implementation.

## Build In This Folder

- Role-based portal UI
- Module pages and forms
- Dashboards and analytics views
- Client-side validation
- API contract client layer
- Accessibility and responsive behavior

## Out Of Scope Here

- SharePoint schema setup
- Power Automate workflow implementation
- Permission enforcement at data source level

## Primary References

- ../docs/02-data-model-and-contracts.md
- ../docs/03-workflow-and-sla-rules.md
- ../docs/08-frontend-implementation-plan.md

## Current Status

Sprint 1 foundation is implemented:

- React + TypeScript + Vite scaffold
- Route architecture and module placeholders
- Role-based navigation preview and route guard
- Shared components (table, status badge, timeline, modal, form field)
- Service contract stubs and mock data

## Run Locally

1. Install Node.js LTS (if not already installed).
2. From this folder run:

```bash
npm install
npm run dev
```

1. Open the local URL shown by Vite.

## Next Build Step

Start Sprint 2: learner profile deep view, attendance approval queue, and richer validation/error handling.
