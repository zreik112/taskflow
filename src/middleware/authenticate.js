const jwt = require('jsonwebtoken');
const db = require('../db');

const USER_COLUMNS = ['id', 'organization_id', 'email', 'first_name', 'last_name', 'role'];

module.exports = async function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return next({ status: 401, error: 'unauthorized', message: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db('users')
      .select(USER_COLUMNS)
      .where({ id: payload.sub })
      .whereNull('deleted_at')
      .first();

    if (!user) {
      return next({ status: 401, error: 'unauthorized', message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next({ status: 401, error: 'unauthorized', message: 'Invalid or expired token' });
    }
    next(err);
  }
};
