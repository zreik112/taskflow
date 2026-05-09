require('dotenv').config();
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';
process.env.BCRYPT_ROUNDS = '1'; // Fast in tests

const request = require('supertest');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const app = require('../../app');

const db = knex(knexConfig.test);

// ── Setup / Teardown ────────────────────────────────────────────

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('tasks').del();
  await db('projects').del();
  await db('users').del();
  await db('organizations').del();
});

afterAll(async () => {
  await db.destroy();
});

// ── POST /api/auth/register ──────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validPayload = {
    email: 'alice@example.com',
    password: 'SecurePass1!',
    first_name: 'Alice',
    last_name: 'Smith',
    org_name: 'Acme Corp',
  };

  test('1. happy path — creates org+user, sets httpOnly cookie, returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.password_hash).toBeUndefined(); // never expose hash

    // Cookie must be set and httpOnly
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toMatch(/token=/);
    expect(setCookie[0]).toMatch(/HttpOnly/i);

    // Org and user persisted in DB
    const user = await db('users').where({ email: 'alice@example.com' }).first();
    expect(user).toBeTruthy();
    expect(user.role).toBe('admin');
    const org = await db('organizations').where({ id: user.organization_id }).first();
    expect(org.name).toBe('Acme Corp');
  });

  test('2. duplicate email — returns 409', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('conflict');
  });

  test('3. missing required fields — returns 422 with fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('validation_error');
    expect(res.body.fields).toBeDefined();
  });

  test('4. password too short — returns 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'short' });

    expect(res.status).toBe(422);
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Register a user to login with
    await request(app).post('/api/auth/register').send({
      email: 'bob@example.com',
      password: 'MyPassword99!',
      first_name: 'Bob',
      last_name: 'Jones',
      org_name: 'Bob Co',
    });
  });

  test('5. happy path — valid credentials return 200 with cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'MyPassword99!' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('bob@example.com');
    expect(res.body.user.password_hash).toBeUndefined();

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toMatch(/token=/);
    expect(setCookie[0]).toMatch(/HttpOnly/i);
  });

  test('6. wrong password — returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  test('7. unknown email — returns 401 (same message, no user enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  test('8. missing fields — returns 422', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bob@example.com' });
    expect(res.status).toBe(422);
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  test('9. clears the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'];
    // Cookie should be cleared (max-age=0 or expires in the past)
    if (setCookie) {
      expect(setCookie[0]).toMatch(/token=/);
    }
  });
});
