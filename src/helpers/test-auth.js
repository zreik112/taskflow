/**
 * Test helpers for JWT authentication.
 *
 * Generates a valid signed JWT for a seeded user without going through
 * the /api/auth/login endpoint, keeping task/project tests fast and focused.
 * Uses JWT_SECRET from env (set to a test value in CI / local test runs).
 */
const jwt = require('jsonwebtoken');

const TEST_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-production';

function testToken(user) {
  return jwt.sign(
    { sub: user.id, org: user.organization_id, role: user.role },
    TEST_SECRET,
    { expiresIn: '15m' }
  );
}

/** Returns a Cookie header string: "token=<jwt>" */
function cookieHeader(user) {
  return `token=${testToken(user)}`;
}

module.exports = { testToken, cookieHeader };
