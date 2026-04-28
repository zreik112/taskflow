# TaskFlow — PRD

## Slice entity for Checkpoint 1: `Task`

This PRD covers a vertical slice of TaskFlow focused on the `Task` entity: creation, listing, viewing details, with full multi-tenant isolation.

---

## Feature Summary

Users can create, list, and view Tasks within their organization's projects. All task data is strictly isolated per organization — a user from one organization can never read or interact with tasks from another. This slice delivers the foundational CRUD operations (POST and GET) needed to validate the full stack end-to-end.

---

## User Stories

1. **As Lina (project manager)**, I want to create a new task with a title, description, status, priority, and optional due date, so that my team knows what needs to be done.
2. **As Karim (team member)**, I want to view the details of a task assigned to me, so that I understand what is expected and when it is due.
3. **As Karim**, I want to list all tasks in a project, so that I can see my workload at a glance.
4. **As the system**, I must ensure that a user can never access a task belonging to a different organization, even if they know the UUID.
5. **As Lina**, I want to see a clear validation error when I submit an incomplete task form, so that I know exactly what field to fix.

---

## Data Model

### Task

| Field | Type | Notes |
|---|---|---|
| `id` | UUID v4 | PK |
| `organization_id` | UUID | FK → organizations; denormalized for single-join tenant filtering |
| `project_id` | UUID | FK → projects; required |
| `title` | VARCHAR(200) | Required |
| `description` | TEXT | Optional, nullable |
| `status` | ENUM | `todo` \| `in_progress` \| `done`; default `todo` |
| `priority` | ENUM | `low` \| `medium` \| `high`; default `medium` |
| `assigned_to` | UUID | FK → users; nullable (SET NULL on user delete) |
| `due_date` | TIMESTAMPTZ | Optional, nullable; past dates allowed at creation |
| `created_by` | UUID | FK → users; set from authenticated user, never from payload |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |
| `deleted_at` | TIMESTAMPTZ | Nullable; soft delete only |

---

## API Endpoints

### POST /api/tasks

- **Auth**: Required — `X-User-Id` header (mocked; JWT in Session 6)
- **Request body**:
```json
{
  "project_id": "uuid",
  "title": "string (1–200 chars, required)",
  "description": "string (optional)",
  "status": "todo | in_progress | done (default: todo)",
  "priority": "low | medium | high (default: medium)",
  "assigned_to": "uuid (optional)",
  "due_date": "ISO timestamp (optional)"
}
```
- **Response 201**:
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "project_id": "uuid",
  "title": "string",
  "description": "string|null",
  "status": "todo",
  "priority": "medium",
  "assigned_to": "uuid|null",
  "due_date": "timestamp|null",
  "created_by": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "deleted_at": null
}
```
- **Response 401**: Missing or invalid `X-User-Id`
- **Response 404**: `project_id` does not belong to user's organization
- **Response 422**: Validation error
```json
{
  "status": 422,
  "error": "validation_error",
  "message": "Validation failed",
  "fields": { "title": "title is required" }
}
```

### GET /api/tasks/:id

- **Auth**: Required
- **Response 200**: Full task object (same shape as POST 201)
- **Response 401**: Unauthenticated
- **Response 404**: Task not found OR belongs to a different organization (intentionally identical — no tenant existence leak)

### GET /api/tasks?project_id=:uuid

- **Auth**: Required
- **Response 200**: Array of task objects filtered to the user's organization and the given project
- **Note**: List endpoint is defined here for frontend consumption; full implementation including pagination and filtering is in the senior path.

---

## Out of Scope (v2 or later)

1. **PATCH /api/tasks/:id** — updating status, reassigning, editing title/description. Planned for Session 7+.
2. **DELETE /api/tasks/:id** (soft) — setting `deleted_at`. Senior path extension.
3. **Real authentication** — JWT with httpOnly cookies. Session 6.
4. **Filtering by assignee, priority, or date range** — senior extension.
5. **Pagination** — the list endpoint returns all non-deleted tasks in the project for now; pagination comes in Session 7.
6. **Real-time updates** — WebSocket push. Not in v1 scope.
7. **User and project management** — invitations, project creation. Session 6+.

---

## Success Metrics

1. `POST /api/tasks` returns 201 with a valid UUID and `organization_id` derived from auth — confirmed by green TDD suite.
2. `GET /api/tasks/:id` returns 404 for a cross-tenant UUID — confirmed by explicit cross-tenant test.
3. TaskList renders loading → success (≥1 task from seed data) in the browser.
4. TaskCreate shows a field-level error under `title` when submitting without a title (422 from backend surfaced in UI).
5. All 8 tests green; `docs/green-screenshot.png` archived.
