/**
 * Migration for users table.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  // Enable citext and pgcrypto extensions if needed
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "citext"');
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.specificType('email', 'citext').unique().notNullable();
    t.text('role').notNullable().defaultTo('trainer');
    t.text('first_name');
    t.text('last_name');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users');
};