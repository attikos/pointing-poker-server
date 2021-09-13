/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
    up() {
        this.create('users', (table) => {
            table.increments();
            table.string('token', 255).notNullable().unique().index();
            table.string('nice_id', 6).notNullable().unique().index();
            table.string('first_name', 255).notNullable();
            table.string('last_name', 255).notNullable();
            table.boolean('is_diller').defaultTo(false);
            table.boolean('is_player').defaultTo(false);
            table.string('job', 255);
            // table.integer('game_id').references('id').inTable('game')
            // table.integer('image_id').references('id').inTable('image')
            table.timestamps();
        });
    }

    down() {
        this.drop('users');
    }
}

module.exports = UserSchema;
