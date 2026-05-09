const service = require('./service');

async function list(req, res, next) {
  try {
    const projects = await service.list(req.user);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const project = await service.create(req.user, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
