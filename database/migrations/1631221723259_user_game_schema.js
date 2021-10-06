/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserGameSchema extends Schema {
    up() {
        this.create('user_games', (table) => {
            table.increments();
            table.integer('user_id').notNullable().references('id').inTable('users');
            table.integer('game_id').notNullable().references('id').inTable('games');
            table.timestamps();
        });
    }

    down() {
        this.drop('user_games');
    }
}

module.exports = UserGameSchema;
