# TaskFlow — Implementation Plan (Checkpoint 1)

## Phase 1 — Database Entities

1. Define `organizations` table: `id` (UUID PK), `name`, `slug` (unique), audit columns.
2. Define `users` table: `id` (UUID PK), `organization_id` (FK, indexed), `email`, composite unique constraint `(organization_id, email)`, `first_name`, `last_name`, `password_hash`, `role` enum (`admin|member`), audit columns.
3. Define `projects` table: `id` (UUID PK), `organization_id` (FK, indexed), `name`, `description`, `status` enum (`active|archived`), `owner_id` (FK → users, indexed), audit columns.
4. Define `tasks` table: `id` (UUID PK), `organization_id` (FK, indexed — denormalized for single-join tenant filtering), `project_id` (FK, indexed), `title` (VARCHAR 200), `description` (TEXT nullable), `status` enum (`todo|in_progress|done`), `priority` enum (`low|medium|high`), `assigned_to` (FK → users, nullable, SET NULL on delete, indexed), `due_date` (TIMESTAMPTZ nullable), `created_by` (FK → users, indexed), audit columns.
5. Add composite index on `tasks(organization_id, project_id, status)` — most-selective first.
6. All FK columns have explicit individual indexes (rule DB-5).

## Phase 2 — Migrations and Seed Data

7. Create `db/migrations/001_organizations_users.js` — organizations + users, both with `up()` and `down()`.
8. Create `db/migrations/002_projects.js` — projects with `up()` and `down()`.
9. Create `db/migrations/003_tasks.js` — tasks with all indexes and `up()` and `down()`.
10. Create `db/seeds/001_base_data.js` — 2 organizations, 5 users, 4 projects, 20 tasks with realistic data spread across statuses and priorities.
11. Run `npx knex migrate:latest` against `taskflow_dev` and verify with `\dt` and `\d tasks`.
12. Run `npx knex seed:run` and verify `SELECT count(*) FROM tasks` returns 20.

## Phase 3 — API Endpoints

13. `POST /api/tasks` — authenticate → validate(createTaskSchema) → controller.create → service.create → repository.create → 201.
14. `GET /api/tasks/:id` — authenticate → controller.getById → service.getByIdForUser → repository.findById → 200 or 404.
15. `GET /api/tasks` — authenticate → controller.list → service.list → repository.findByProject → 200 (senior/homework extension; stub only for frontend).
16. Error responses follow the standard shape: `{ status, error, message, fields? }`.

## Phase 4 — Tests (written BEFORE handlers — TDD Red first)

17. `tasks.test.js` — Test 1: POST happy path → 201, UUID id, organization_id from auth.
18. `tasks.test.js` — Test 2: POST without auth → 401.
19. `tasks.test.js` — Test 3: POST without title → 422 with `fields.title`.
20. `tasks.test.js` — Test 4: POST with project_id from different org → 404.
21. `tasks.test.js` — Test 5: GET happy path → 200 matching seeded task.
22. `tasks.test.js` — Test 6: GET without auth → 401.
23. `tasks.test.js` — Test 7: GET non-existent id → 404.
24. `tasks.test.js` — Test 8: GET cross-tenant task → 404 (not 403).

## Phase 5 — Frontend Components

25. `src/api/tasks.js` — `list({ projectId })`, `create(payload)`, `getById(id)` — all return `{ data, error }`.
26. `src/styles/tokens.css` — design tokens (colors, typography, spacing, radius, focus ring).
27. `src/components/TaskCard.jsx` + `TaskCard.module.css` — renders title, status badge, priority badge, assignee, due date.
28. `src/components/TaskList.jsx` + `TaskList.module.css` — fetches via `api.tasks.list()`, renders loading / success / error / empty states.
29. `src/components/TaskCreate.jsx` + `TaskCreate.module.css` — form with client-side + server-side validation, field-level 422 errors, loading state on submit.

## Phase 6 — Implementation Order (smallest slice first)

30. DB layer: migrations → seed → verify.
31. Test infrastructure: `src/db.js`, test DB setup, `beforeEach` fixtures.
32. Write Red tests (all 8 failing).
33. Implement bottom-up: repository → service → middleware (validate, error-handler, authenticate) → controller → route → app.
34. Run tests → confirm Green.
35. Refactor pass (max 2 changes, re-run tests after each).
36. Frontend: `src/api/tasks.js` → tokens → TaskCard → TaskList (verify 3 states) → TaskCreate (verify 422).
37. UI audit → apply top finding.
38. Final commit, push, open draft PR.
