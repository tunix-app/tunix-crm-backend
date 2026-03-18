/**
 * Migration to add tools_used column to sessions table.
 * The sessions table was created manually in Supabase; this migration adds the new multi-select field.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('sessions', 'tools_used');
  if (!hasColumn) {
    await knex.schema.table('sessions', (t) => {
      t.specificType('tools_used', 'text[]').nullable();
    });
  }
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.table('sessions', (t) => {
    t.dropColumn('tools_used');
  });
};
