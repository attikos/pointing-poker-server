/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class IssueSchema extends Schema {
    up() {
        this.raw('DROP TYPE IF EXISTS issue_priority_type');

        this.create('issues', (table) => {
            table.increments();
            table.integer('game_id').references('id').inTable('games');
            table.boolean('is_current').defaultTo(false);
            table.string('title', 512).notNullable();
            table.string('link', 512);
            table.enu('priority', ['low', 'middle', 'high'], { useNative: true, existingType: false, enumName: 'issue_priority_type' }).defaultTo('middle');
            table.timestamps();
        });
    }

    down() {
        this.drop('issues');
        this.raw('DROP TYPE issue_priority_type');
    }
}

module.exports = IssueSchema;
