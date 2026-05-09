const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const repository = require('./repository');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const JWT_EXPIRY = '15m';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, org: user.organization_id, role: user.role },
    getSecret(),
    { expiresIn: JWT_EXPIRY }
  );
}

function slugify(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${uuidv4().slice(0, 8)}`;
}

function sanitize(user) {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
}

function invalidCredentials() {
  const err = new Error('Invalid email or password');
  err.statusCode = 401;
  return err;
}

async function register({ email, password, firstName, lastName, orgName }) {
  const existing = await repository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with that email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const orgSlug = slugify(orgName);

  const { user } = await repository.createOrgAndUser({
    orgName,
    orgSlug,
    email,
    passwordHash,
    firstName,
    lastName,
  });

  return { token: signToken(user), user: sanitize(user) };
}

async function login({ email, password }) {
  const user = await repository.findByEmail(email);
  if (!user) throw invalidCredentials();

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw invalidCredentials();

  return { token: signToken(user), user: sanitize(user) };
}

module.exports = { register, login };
