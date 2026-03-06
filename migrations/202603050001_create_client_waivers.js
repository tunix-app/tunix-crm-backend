/**
 * Migration to create client_waivers table for tracking waiver PDF files stored in Supabase Storage.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('client_waivers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('client_id').notNullable();
    t.foreign('client_id').references('id').inTable('clients').onDelete('CASCADE');
    t.text('storage_path').notNullable();      // internal Supabase Storage path, never returned to client
    t.text('original_filename').notNullable(); // display name shown in UI
    t.integer('file_size_bytes').notNullable();
    t.timestamp('uploaded_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('client_waivers');
};
