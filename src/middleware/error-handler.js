const { ValidationError } = require('./validate');

class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Plain objects thrown via next({ status, error, message })
  if (err.error && err.status) {
    return res.status(err.status).json({
      status: err.status,
      error: err.error,
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      status: 422,
      error: 'validation_error',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 404,
      error: 'not_found',
      message: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 401,
      error: 'unauthorized',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 500,
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
  });
}

module.exports = { errorHandler, NotFoundError, UnauthorizedError };
