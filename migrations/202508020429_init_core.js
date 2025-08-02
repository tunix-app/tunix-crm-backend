/**
 * Initial core migration for Iteration 0.
 * Creates an optional app_health table for smoke checks.
 * Note: enable extensions only if available on your Supabase instance/plan.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  // Example extensions (uncomment if needed and permitted):
  // await knex.schema.raw('create extension if not exists "citext"');
  // await knex.schema.raw('create extension if not exists "pgcrypto"');

  await knex.schema.createTable('app_health', (t) => {
    t.increments('id').primary();
    t.timestamp('at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.text('note');
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('app_health');
};
