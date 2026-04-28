const { v4: uuidv4 } = require('uuid');
const db = require('../../db');
const repository = require('./repository');
const { NotFoundError } = require('../../middleware/error-handler');

async function create(user, payload) {
  // organization_id always from auth — never from payload
  const { project_id, title, description, status, priority, assigned_to, due_date } = payload;

  const project = await db('projects')
    .where({ id: project_id, organization_id: user.organization_id })
    .whereNull('deleted_at')
    .first();

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const task = await repository.create({
    id: uuidv4(),
    organization_id: user.organization_id,
    project_id,
    title,
    description: description || null,
    status: status || 'todo',
    priority: priority || 'medium',
    assigned_to: assigned_to || null,
    due_date: due_date || null,
    created_by: user.id,
  });

  return task;
}

async function getByIdForUser(user, id) {
  const task = await repository.findById(id);

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Cross-tenant: return 404, not 403, to avoid leaking existence
  if (task.organization_id !== user.organization_id) {
    throw new NotFoundError('Task not found');
  }

  return task;
}

async function listByProject(user, projectId) {
  return repository.findByProject({
    organizationId: user.organization_id,
    projectId,
  });
}

module.exports = { create, getByIdForUser, listByProject };
