/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class MessagesSchema extends Schema {
    up() {
        this.create('messages', (table) => {
            table.increments();
            table.integer('user_id').notNullable().references('id').inTable('users');
            table.integer('game_id').notNullable().references('id').inTable('games');
            table.string('message', 512).notNullable();
            table.timestamps();
        });
    }

    down() {
        this.drop('messages');
    }
}

module.exports = MessagesSchema;
