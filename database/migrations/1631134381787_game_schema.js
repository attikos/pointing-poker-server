/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class GameSchema extends Schema {
    up() {
        this.raw('DROP TYPE IF EXISTS game_status_type');

        this.create('games', (table) => {
            table.increments();
            table.enu('status', ['lobby', 'game', 'result'], { useNative: true, existingType: false, enumName: 'game_status_type' }).defaultTo('lobby');
            table.integer('user_id').notNullable().references('id').inTable('users');
            table.string('nice_id', 6).notNullable().unique().index();
            table.timestamps();
        });
    }

    down() {
        this.drop('games');
        this.raw('DROP TYPE game_status_type');
    }
}

module.exports = GameSchema;
