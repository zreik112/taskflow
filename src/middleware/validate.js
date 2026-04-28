class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const fields = {};
      for (const detail of error.details) {
        const key = detail.path.join('.');
        fields[key] = detail.message;
      }
      return next(new ValidationError('Validation failed', fields));
    }
    req.body = value;
    next();
  };
}

module.exports = { validate, ValidationError };
