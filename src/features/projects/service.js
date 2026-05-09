const repository = require('./repository');

async function list(user) {
  return repository.findByOrg(user.organization_id);
}

async function create(user, { name }) {
  return repository.create({
    organizationId: user.organization_id,
    name,
    ownerId: user.id,
  });
}

module.exports = { list, create };
