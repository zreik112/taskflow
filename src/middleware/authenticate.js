// Mocked authentication for Checkpoint 1.
// Reads X-User-Id header and looks up the user in DB.
// Will be replaced with proper JWT auth in Session 6.
const db = require('../db');

module.exports = async function authenticate(req, res, next) {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next({ status: 401, error: 'unauthorized', message: 'Missing X-User-Id header' });
  }

  try {
    const user = await db('users').where({ id: userId }).whereNull('deleted_at').first();
    if (!user) {
      return next({ status: 401, error: 'unauthorized', message: 'Invalid user' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
