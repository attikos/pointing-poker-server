/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserGameSchema extends Schema {
    up() {
        this.create('user_game', (table) => {
            table.increments();
            table.integer('user_id').notNullable().references('id').inTable('user');
            table.integer('game_id').notNullable().references('id').inTable('game');
            table.timestamps();
        });
    }

    down() {
        this.drop('user_game');
    }
}

module.exports = UserGameSchema;
