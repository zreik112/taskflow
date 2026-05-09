const db = require('../../db');

const USER_COLUMNS = [
  'id',
  'organization_id',
  'email',
  'first_name',
  'last_name',
  'password_hash',
  'role',
  'created_at',
  'updated_at',
];

async function findByEmail(email) {
  return db('users')
    .select(USER_COLUMNS)
    .whereRaw('LOWER(email) = LOWER(?)', [email])
    .whereNull('deleted_at')
    .first();
}

async function createOrgAndUser({ orgName, orgSlug, email, passwordHash, firstName, lastName }) {
  return db.transaction(async (trx) => {
    const [org] = await trx('organizations')
      .insert({ name: orgName, slug: orgSlug })
      .returning(['id', 'name', 'slug']);

    const [user] = await trx('users')
      .insert({
        organization_id: org.id,
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        role: 'admin',
      })
      .returning(USER_COLUMNS);

    return { org, user };
  });
}

module.exports = { findByEmail, createOrgAndUser };
