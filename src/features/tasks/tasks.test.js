require('dotenv').config();
const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const knexConfig = require('../../../knexfile');

// src/app.js does not exist yet — tests will fail at this import (Red step)
const app = require('../../app');

const db = knex(knexConfig.test);

// ── Fixtures ────────────────────────────────────────────────────

let org1, org2, project1, project2, user1, user2;

async function seedFixtures() {
  org1 = { id: uuidv4(), name: 'Test Org 1', slug: `org1-${Date.now()}` };
  org2 = { id: uuidv4(), name: 'Test Org 2', slug: `org2-${Date.now()}` };
  await db('organizations').insert([org1, org2]);

  user1 = {
    id: uuidv4(),
    organization_id: org1.id,
    email: `user1-${Date.now()}@test.example`,
    first_name: 'Test',
    last_name: 'User1',
    password_hash: 'hashed',
    role: 'member',
  };
  user2 = {
    id: uuidv4(),
    organization_id: org2.id,
    email: `user2-${Date.now()}@test.example`,
    first_name: 'Test',
    last_name: 'User2',
    password_hash: 'hashed',
    role: 'member',
  };
  await db('users').insert([user1, user2]);

  project1 = {
    id: uuidv4(),
    organization_id: org1.id,
    name: 'Project Alpha',
    status: 'active',
    owner_id: user1.id,
  };
  project2 = {
    id: uuidv4(),
    organization_id: org2.id,
    name: 'Project Beta',
    status: 'active',
    owner_id: user2.id,
  };
  await db('projects').insert([project1, project2]);
}

// ── Setup / Teardown ────────────────────────────────────────────

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('tasks').del();
  await db('projects').del();
  await db('users').del();
  await db('organizations').del();
  await seedFixtures();
});

afterAll(async () => {
  await db.destroy();
});

// ── POST /api/tasks ──────────────────────────────────────────────

describe('POST /api/tasks', () => {
  test('1. happy path — creates task and returns 201', async () => {
    const payload = {
      project_id: project1.id,
      title: 'Implement login page',
      description: 'Build the auth UI with email and password fields.',
      status: 'todo',
      priority: 'medium',
    };

    const res = await request(app)
      .post('/api/tasks')
      .set('X-User-Id', user1.id)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.body.title).toBe(payload.title);
    // organization_id must come from auth, never from payload
    expect(res.body.organization_id).toBe(org1.id);
    expect(res.body.created_by).toBe(user1.id);
    expect(res.body.created_at).toBeTruthy();
    expect(res.body.updated_at).toBeTruthy();

    // Confirm record persisted in DB
    const record = await db('tasks').where({ id: res.body.id }).first();
    expect(record).toBeTruthy();
    expect(record.title).toBe(payload.title);
  });

  test('2. unauthorized — missing X-User-Id returns 401', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ project_id: project1.id, title: 'Some task' });

    expect(res.status).toBe(401);
  });

  test('3. invalid payload — missing title returns 422 with fields', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('X-User-Id', user1.id)
      .send({ project_id: project1.id });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('validation_error');
    expect(res.body.fields).toBeDefined();
    expect(res.body.fields.title).toBeTruthy();
  });

  test('4. cross-tenant project — returns 404 (no tenant leak)', async () => {
    // user1 is in org1 but project2 belongs to org2
    const res = await request(app)
      .post('/api/tasks')
      .set('X-User-Id', user1.id)
      .send({ project_id: project2.id, title: 'Sneaky task' });

    expect(res.status).toBe(404);
  });
});

// ── GET /api/tasks/:id ───────────────────────────────────────────

describe('GET /api/tasks/:id', () => {
  let seededTask;

  beforeEach(async () => {
    [seededTask] = await db('tasks')
      .insert({
        id: uuidv4(),
        organization_id: org1.id,
        project_id: project1.id,
        title: 'Seeded task for GET test',
        status: 'todo',
        priority: 'low',
        created_by: user1.id,
      })
      .returning('*');
  });

  test('5. happy path — returns 200 with task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${seededTask.id}`)
      .set('X-User-Id', user1.id);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(seededTask.id);
    expect(res.body.title).toBe('Seeded task for GET test');
    expect(res.body.organization_id).toBe(org1.id);
  });

  test('6. unauthorized — missing X-User-Id returns 401', async () => {
    const res = await request(app).get(`/api/tasks/${seededTask.id}`);
    expect(res.status).toBe(401);
  });

  test('7. not found — non-existent UUID returns 404', async () => {
    const res = await request(app)
      .get(`/api/tasks/${uuidv4()}`)
      .set('X-User-Id', user1.id);

    expect(res.status).toBe(404);
  });

  test('8. cross-tenant isolation — task in org2 returns 404 for org1 user', async () => {
    // Seed a task in org2
    const [org2Task] = await db('tasks')
      .insert({
        id: uuidv4(),
        organization_id: org2.id,
        project_id: project2.id,
        title: 'Org2 secret task',
        status: 'todo',
        priority: 'high',
        created_by: user2.id,
      })
      .returning('*');

    // user1 (org1) tries to access org2's task — must get 404, not 403
    const res = await request(app)
      .get(`/api/tasks/${org2Task.id}`)
      .set('X-User-Id', user1.id);

    expect(res.status).toBe(404);
  });
});
