/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('program_exercises', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('program_id')
      .notNullable()
      .references('id')
      .inTable('programs')
      .onDelete('CASCADE');
    table
      .uuid('exercise_id')
      .notNullable()
      .references('id')
      .inTable('exercises');
    table.integer('order_index').notNullable().defaultTo(0);
    table.integer('sets').nullable();
    table.string('reps').nullable();
    table.integer('duration_seconds').nullable();
    table.text('notes').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('program_exercises');
};
