const db = require('../../db');

const TASK_COLUMNS = [
  'id',
  'organization_id',
  'project_id',
  'title',
  'description',
  'status',
  'priority',
  'assigned_to',
  'due_date',
  'created_by',
  'created_at',
  'updated_at',
  'deleted_at',
];

async function create(payload) {
  const [task] = await db('tasks').insert(payload).returning(TASK_COLUMNS);
  return task;
}

async function findById(id) {
  return db('tasks').select(TASK_COLUMNS).where({ id }).whereNull('deleted_at').first();
}

async function findByProject({ organizationId, projectId }) {
  return db('tasks')
    .select(TASK_COLUMNS)
    .where({ organization_id: organizationId, project_id: projectId })
    .whereNull('deleted_at')
    .orderBy('created_at', 'desc');
}

module.exports = { create, findById, findByProject };
