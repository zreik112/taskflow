const db = require('../../db');

const PROJECT_COLUMNS = [
  'id',
  'organization_id',
  'name',
  'status',
  'owner_id',
  'created_at',
  'updated_at',
];

async function findByOrg(organizationId) {
  return db('projects')
    .select(PROJECT_COLUMNS)
    .where({ organization_id: organizationId })
    .whereNull('deleted_at')
    .orderBy('created_at', 'desc');
}

async function create({ organizationId, name, ownerId }) {
  const [project] = await db('projects')
    .insert({
      organization_id: organizationId,
      name,
      status: 'active',
      owner_id: ownerId,
    })
    .returning(PROJECT_COLUMNS);
  return project;
}

module.exports = { findByOrg, create };
