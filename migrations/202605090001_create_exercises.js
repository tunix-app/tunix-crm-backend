/**
 * Creates the exercises table for the exercise catalog feature.
 * Tags stored as JSONB; unique constraint prevents duplicate names per trainer.
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.dropTableIfExists('exercises');
  await knex.schema.createTable('exercises', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('trainer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.text('description').nullable();
    t.jsonb('tags').notNullable().defaultTo('[]');
    t.text('exercise_demo').nullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(['trainer_id', 'name']);
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('exercises');
};
