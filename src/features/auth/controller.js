const service = require('./service');

function cookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
  };
}

async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name, org_name } = req.body;
    const { token, user } = await service.register({
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      orgName: org_name,
    });
    res.cookie('token', token, cookieOpts());
    res.status(201).json({ user });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ status: 409, error: 'conflict', message: err.message });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await service.login({ email, password });
    res.cookie('token', token, cookieOpts());
    res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode === 401) {
      return res.status(401).json({ status: 401, error: 'unauthorized', message: err.message });
    }
    next(err);
  }
}

function logout(_req, res) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = { register, login, logout };
