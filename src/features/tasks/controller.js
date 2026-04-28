const service = require('./service');

async function create(req, res, next) {
  try {
    const task = await service.create(req.user, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const task = await service.getByIdForUser(req.user, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const tasks = await service.listByProject(req.user, req.query.project_id);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, list };
