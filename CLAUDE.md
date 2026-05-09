# CLAUDE.md — TaskFlow

## Project Overview

TaskFlow is a multi-tenant task management SaaS for teams of 5–50 people: each organization manages projects and tasks in an isolated workspace, with users assigned to tasks, status workflow (todo / in_progress / done), and priority levels (low / medium / high).

---

## Architecture & Boundaries

1. Backend is strictly layered: routes → middleware → controller → service → repository → db. Never skip layers.
2. Frontend components consume the `src/api/` layer only. No backend types or raw fetch calls leak into UI components.
3. Each feature lives in its own folder: `src/features/<feature-name>/` containing controller, service, repository, and tests.
4. The Express app (`src/app.js`) mounts routes and the error handler. No business logic lives in app.js.
5. Environment variables are loaded via `dotenv` in `knexfile.js` and `src/app.js` only. Never hardcode credentials.

---

## Coding Conventions

1. Filenames: PascalCase for React components (`TaskCard.jsx`), kebab-case for everything else (`error-handler.js`).
2. No `any` types if TypeScript is introduced. Use `unknown` and narrow.
3. Lines under 100 characters where reasonable. Prettier on save.
4. Use `async/await` over raw Promise chains. Always `await` inside `try/catch` in controllers and services.
5. Named exports for utilities and middleware; default exports for React components.

---

## Database Rules

1. Primary keys: UUID v4. Never auto-increment integers.
2. Audit columns on every table: `created_at`, `updated_at`, `deleted_at` (TIMESTAMP WITH TIME ZONE; `deleted_at` is nullable; others default `now()`).
3. Soft delete only: never `DELETE` rows. Set `deleted_at` instead.
4. Multi-tenancy: every tenant-scoped table carries an `organization_id` FK. The service layer always derives `organization_id` from the authenticated user — never from the request payload.
5. Every foreign key column has a corresponding explicit index — never assumed.
6. Composite indexes match real query patterns. Most-selective column first. Key index: `tasks(organization_id, project_id, status)`.
7. Schema changes are new Knex migration files. Never modify an existing migration that has been run.

---

## Testing Rules

1. Test-first for every new endpoint: write the failing test (Red) before any handler code.
2. Tests run against a separate test database (`taskflow_test`). Never the dev database.
3. Coverage threshold for new files in this checkpoint: 80% lines, 70% branches.
4. Each test file manages its own fixtures via `beforeEach` truncation + minimal seed. No shared mutable state between tests.
5. `knex.destroy()` is called in `afterAll` to close the DB connection pool cleanly.

---

## Frontend Rules

1. One component per file. Default export. PascalCase filename.
2. Component size limit: 150 lines. Over the limit splits into sub-components.
3. API calls go through `src/api/` only. No `fetch()` inside a component.
4. Every API call renders three states: loading, success, error. No silent failures.
5. Every interactive element has a visible label or an `aria-label`.
6. State management: React `useState` + `useReducer` for local state. No global state library for this slice.
7. CSS uses tokens from `src/styles/tokens.css` exclusively. No hardcoded hex, px, or rem values in component styles.
8. CSS Modules co-located with the component file (`TaskCard.module.css` next to `TaskCard.jsx`).

---

## Forbidden Patterns

1. Never call `fetch()` directly in a React component. All network calls go through `src/api/`.
2. Never use `SELECT *` in production query code. Use explicit column lists.
3. Never store JWT tokens in `localStorage`. (Revisited with httpOnly cookies in Session 6.)
4. Never return `403` for a cross-tenant resource lookup. Return `404` to avoid confirming the existence of another tenant's data.
5. Never commit `.env` to the repository. Only `.env.example` is tracked.

---

## Security Rules

1. JWT tokens are stored exclusively in httpOnly cookies — never in localStorage, sessionStorage, or a JSON response body.
2. Passwords are hashed with bcrypt at a cost factor of 12 (controlled via the `BCRYPT_ROUNDS` env var; set to 1 in test environments to keep tests fast).
3. Auth endpoints (`/api/auth/*`) are rate-limited to 5 requests per 15 minutes per IP.
4. Every request body is validated with Joi before it reaches the controller — no raw `req.body` access in controllers.
5. Helmet is applied globally in `app.js` to set secure HTTP response headers on every route.
6. CORS is configured with an explicit allowlist via the `CORS_ORIGIN` env var — wildcard `*` is never used in production.
7. No credentials, secrets, or API keys appear in code. All sensitive values are loaded exclusively from environment variables.

---

## Always-On Behaviors

1. Read CLAUDE.md at the start of every conversation before generating any code.
2. When asked to plan, always output a numbered checklist before generating code.
3. When generating a new table, always include all 7 Database Rules as a self-check before finalizing the schema.
