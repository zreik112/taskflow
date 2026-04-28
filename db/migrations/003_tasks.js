/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // organization_id denormalized — tenant filtering in one join
    table
      .uuid('organization_id')
      .notNullable()
      .references('id')
      .inTable('organizations')
      .onDelete('RESTRICT');

    table
      .uuid('project_id')
      .notNullable()
      .references('id')
      .inTable('projects')
      .onDelete('RESTRICT');

    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.enu('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo');
    table.enu('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');

    table
      .uuid('assigned_to')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.timestamp('due_date', { useTz: true }).nullable();

    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });

  // Individual FK indexes
  await knex.schema.table('tasks', (table) => {
    table.index(['organization_id'], 'idx_tasks_organization_id');
    table.index(['project_id'], 'idx_tasks_project_id');
    table.index(['assigned_to'], 'idx_tasks_assigned_to');
    table.index(['created_by'], 'idx_tasks_created_by');
  });

  // Composite index for the primary query pattern (most selective first)
  await knex.raw(
    'CREATE INDEX idx_tasks_org_project_status ON tasks (organization_id, project_id, status)'
  );
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tasks');
};
