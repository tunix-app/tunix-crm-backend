/**
 * Migration to remove redundant columns from clients and add client_id reference.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('clients', (t) => {
    // Add client_id column with foreign key to users
    t.uuid('client_id').notNullable();
    t.foreign('client_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Drop redundant columns
    t.dropColumn('first_name');
    t.dropColumn('last_name');
    t.dropColumn('email');
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('clients', (t) => {
    // Re-add the dropped columns
    t.specificType('email', 'citext').unique();
    t.text('first_name');
    t.text('last_name');
    
    // Drop the client_id column and its foreign key
    t.dropForeign(['client_id']);
    t.dropColumn('client_id');
  });
};