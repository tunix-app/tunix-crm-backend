/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('programs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('trainer_id').notNullable().references('id').inTable('users');
    table.uuid('client_id').notNullable().references('id').inTable('clients');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('status').notNullable().defaultTo('DRAFT');
    table.text('notes').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('programs');
};
