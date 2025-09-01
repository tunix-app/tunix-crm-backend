/**
 * Migration to update users.role to ENUM and add userRelation table.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  // Create ENUM type for role
  await knex.schema.raw(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Client', 'Coach');
      END IF;
    END$$;`);

  // Alter users.role to use ENUM type
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('role');
  });
  await knex.schema.alterTable('users', (t) => {
    t.enu('role', ['Admin', 'Client', 'Coach'], { useNative: true, enumName: 'user_role' }).notNullable().defaultTo('Coach');
  });

  // Create userRelation table
  await knex.schema.createTable('userRelation', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('coach_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('client_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.unique(['coach_id', 'client_id']);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('userRelation');
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('role');
  });
  await knex.schema.alterTable('users', (t) => {
    t.text('role').notNullable().defaultTo('Coach');
  });
  await knex.schema.raw('DROP TYPE IF EXISTS user_role');
};