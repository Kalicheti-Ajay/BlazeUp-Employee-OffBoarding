# BlazeUp HROS — Employee Offboarding

An Express, MongoDB and React implementation of configurable employee offboarding workflows. Workflow templates define stages; workflow instances run those templates for individual departures. Stages sharing the same order execute in parallel, and the next order activates only after all current tasks are approved.

## Run locally

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/blazeup-offboarding
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

```bash
cd backend
npm install
npm run seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Demo password for every account is `Demo@123`.

| Role | Email |
| --- | --- |
| HR Admin | hr@blazeup.demo |
| Reporting Manager | manager@blazeup.demo |
| Admin & Systems | admin@blazeup.demo |
| Accounts | accounts@blazeup.demo |
| Personnel | personnel@blazeup.demo |

## Demo flow

1. Sign in as HR, select **New Offboarding**, and choose an active seeded employee.
2. Sign in as Manager and approve Project Clearance (complete required checklist items).
3. Sign in independently as Admin and Accounts; both order-2 tasks are active. Admin can record access revocations before approving.
4. Sign in as Personnel to approve order 3, then HR for final clearance.
5. The employee is marked `OFFBOARDED`; HR can download real PDF resignation, NOC, and relieving letters from the case.

## API highlights

- `POST /api/offboarding` creates the case and starts the active OFFBOARDING template atomically at the application level.
- `POST /api/workflows/tasks/:taskId/approve` and `/reject` enforce task ownership.
- `POST /api/workflows/tasks/:taskId/revoke-access` records Admin access revocation.
- `POST /api/offboarding/:id/reminder` notifies all pending assignees.
- `GET /api/offboarding/:id/documents/:kind` streams protected PDFs (`resignation`, `noc`, `relieving`) after completion.

Public registration creates only a standard `PERSONNEL` account; privileged roles are seeded/provisioned, never selected by an untrusted public client.

Current limitation: reminders are deliberate/manual (not a background scheduler), and access revocation is an auditable internal record awaiting future external IAM/email integrations.
