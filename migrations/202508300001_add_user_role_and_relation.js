/**
 * Migration to add clients table and update users.role to enum.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  // Enable required extensions
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "citext"');
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // Create enum type for user roles
  await knex.schema.raw(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Coach', 'Client');
      END IF;
    END$$;`);

  // Alter users.role to use enum type
  await knex.schema.alterTable('users', (t) => {
    t.specificType('role', 'user_role').notNullable().defaultTo('Coach').alter();
  });

  // Create clients table
  await knex.schema.createTable('clients', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('trainer_id').notNullable();
    t.specificType('email', 'citext').unique();
    t.text('first_name');
    t.text('last_name');
    t.text('phone');
    t.text('notes');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    t.foreign('trainer_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('clients');
  // Optionally revert users.role to text
  await knex.schema.alterTable('users', (t) => {
    t.text('role').notNullable().defaultTo('Coach').alter();
  });
  await knex.schema.raw('DROP TYPE IF EXISTS user_role');
};